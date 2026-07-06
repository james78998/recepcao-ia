const dns = require('dns').promises;
const net = require('net');
const AppError = require('./AppError');

// Faixas IPv4 privadas/reservadas — cobre os blocos relevantes para proteção
// de SSRF (RFC 1918, loopback, link-local, CGNAT, faixas de teste/reservadas).
// Não é um espelho exaustivo do registro IANA, apenas o suficiente para
// bloquear os alvos internos mais comuns.
const IPV4_PRIVATE_RANGES = [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
];

function ipv4ToInt(ip) {
  return ip.split('.').reduce((acc, part) => (acc << 8) + Number(part), 0) >>> 0;
}

function isIpv4InRange(ip, [base, bits]) {
  const mask = (~0 << (32 - bits)) >>> 0;
  return (ipv4ToInt(ip) & mask) === (ipv4ToInt(base) & mask);
}

function isPrivateIpv4(ip) {
  return IPV4_PRIVATE_RANGES.some((range) => isIpv4InRange(ip, range));
}

// Expande um endereço IPv6 textual em 8 grupos de 16 bits, ou identifica um
// endereço IPv4-mapped (::ffff:1.2.3.4) para reduzir a checagem ao caso IPv4.
function parseIpv6(address) {
  const withoutScope = address.split('%')[0];

  const mapped = withoutScope.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (mapped) {
    return { mappedIpv4: mapped[1] };
  }

  const parts = withoutScope.split('::');
  const head = parts[0] ? parts[0].split(':').filter(Boolean) : [];
  const tail = parts[1] ? parts[1].split(':').filter(Boolean) : [];
  const missing = 8 - head.length - tail.length;
  if (missing < 0) return null;

  const groups = [...head, ...Array(missing).fill('0'), ...tail].map((g) => parseInt(g, 16));
  if (groups.length !== 8 || groups.some((g) => Number.isNaN(g))) return null;

  return { groups };
}

function isPrivateIpv6(address) {
  const parsed = parseIpv6(address);
  if (!parsed) return true; // não conseguiu interpretar — bloqueia por segurança

  if (parsed.mappedIpv4) return isPrivateIpv4(parsed.mappedIpv4);

  const { groups } = parsed;
  const isLoopback = groups.every((g, i) => (i < 7 ? g === 0 : g === 1));
  const isUnspecified = groups.every((g) => g === 0);
  const isLinkLocal = (groups[0] & 0xffc0) === 0xfe80; // fe80::/10
  const isUniqueLocal = (groups[0] & 0xfe00) === 0xfc00; // fc00::/7

  return isLoopback || isUnspecified || isLinkLocal || isUniqueLocal;
}

function isPrivateIp(ip) {
  if (net.isIPv4(ip)) return isPrivateIpv4(ip);
  if (net.isIPv6(ip)) return isPrivateIpv6(ip);
  return true; // não reconhecido como IP — bloqueia por segurança
}

const BLOCKED_HOSTNAMES = new Set(['localhost']);

/**
 * Garante que a URL de um webhook é pública, HTTPS e não aponta para
 * localhost, loopback, rede privada ou endereço IP interno — mesmo quando a
 * URL usa HTTPS. Lança AppError(422) em qualquer violação.
 */
async function assertPublicHttpsUrl(rawUrl) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new AppError('URL do webhook inválida.', 422);
  }

  if (parsed.protocol !== 'https:') {
    throw new AppError('URL do webhook deve usar HTTPS.', 422);
  }

  const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, '');

  if (BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith('.localhost')) {
    throw new AppError('URL do webhook não pode apontar para localhost.', 422);
  }

  // Host já é um literal IP — valida direto, sem resolução DNS.
  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) {
      throw new AppError('URL do webhook não pode apontar para um endereço IP privado ou interno.', 422);
    }
    return;
  }

  let addresses;
  try {
    addresses = await dns.lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw new AppError('Não foi possível resolver o domínio do webhook.', 422);
  }

  if (addresses.length === 0 || addresses.some((entry) => isPrivateIp(entry.address))) {
    throw new AppError('URL do webhook não pode apontar para um endereço IP privado ou interno.', 422);
  }
}

module.exports = { assertPublicHttpsUrl, isPrivateIp };

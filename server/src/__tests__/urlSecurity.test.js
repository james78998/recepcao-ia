jest.mock('dns', () => ({
  promises: { lookup: jest.fn() },
}));

const dns = require('dns').promises;
const { assertPublicHttpsUrl } = require('../utils/urlSecurity');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('assertPublicHttpsUrl — protocolo', () => {
  it('rejeita URL inválida', async () => {
    await expect(assertPublicHttpsUrl('não-é-uma-url')).rejects.toMatchObject({ status: 422 });
  });

  it('rejeita http:// (exige HTTPS)', async () => {
    await expect(assertPublicHttpsUrl('http://exemplo.com/webhook')).rejects.toMatchObject({ status: 422 });
  });
});

describe('assertPublicHttpsUrl — hostnames bloqueados sem DNS', () => {
  it('rejeita localhost', async () => {
    await expect(assertPublicHttpsUrl('https://localhost/webhook')).rejects.toMatchObject({ status: 422 });
    expect(dns.lookup).not.toHaveBeenCalled();
  });

  it('rejeita subdomínio .localhost', async () => {
    await expect(assertPublicHttpsUrl('https://qualquer.localhost/webhook')).rejects.toMatchObject({ status: 422 });
  });
});

describe('assertPublicHttpsUrl — IP literal (sem DNS)', () => {
  const casosPrivados = [
    'https://127.0.0.1/webhook',
    'https://10.0.0.5/webhook',
    'https://172.16.0.1/webhook',
    'https://192.168.1.1/webhook',
    'https://169.254.169.254/webhook', // IP de metadados de nuvem — alvo clássico de SSRF
    'https://[::1]/webhook',
  ];

  it.each(casosPrivados)('rejeita IP privado/interno literal: %s', async (url) => {
    await expect(assertPublicHttpsUrl(url)).rejects.toMatchObject({ status: 422 });
    expect(dns.lookup).not.toHaveBeenCalled();
  });

  it('aceita IP público literal', async () => {
    await expect(assertPublicHttpsUrl('https://8.8.8.8/webhook')).resolves.toBeUndefined();
    expect(dns.lookup).not.toHaveBeenCalled();
  });
});

describe('assertPublicHttpsUrl — resolução DNS', () => {
  it('rejeita quando o domínio resolve para um IP privado', async () => {
    dns.lookup.mockResolvedValue([{ address: '10.0.0.5', family: 4 }]);

    await expect(assertPublicHttpsUrl('https://interno.exemplo.com/webhook')).rejects.toMatchObject({ status: 422 });
  });

  it('rejeita se qualquer um dos IPs resolvidos for privado', async () => {
    dns.lookup.mockResolvedValue([
      { address: '8.8.8.8', family: 4 },
      { address: '192.168.0.1', family: 4 },
    ]);

    await expect(assertPublicHttpsUrl('https://misto.exemplo.com/webhook')).rejects.toMatchObject({ status: 422 });
  });

  it('aceita quando todos os IPs resolvidos são públicos', async () => {
    dns.lookup.mockResolvedValue([{ address: '8.8.8.8', family: 4 }]);

    await expect(assertPublicHttpsUrl('https://n8n.exemplo.com/webhook')).resolves.toBeUndefined();
  });

  it('rejeita quando o domínio não resolve', async () => {
    dns.lookup.mockRejectedValue(new Error('ENOTFOUND'));

    await expect(assertPublicHttpsUrl('https://dominio-invalido.example/webhook')).rejects.toMatchObject({ status: 422 });
  });
});

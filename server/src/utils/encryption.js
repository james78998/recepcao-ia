const crypto = require('crypto');

// AES-256-GCM — usado para todo segredo de tenant que precisa ser recuperado
// em texto puro (chaves de API, tokens de integração). Senhas de login
// continuam com bcrypt (hash, não reversível) em outro lugar do código.
const ALGORITHM = 'aes-256-gcm';
const VERSION = 'v1';
const IV_LENGTH = 12; // recomendado para GCM

function getKey() {
  const raw = process.env.TENANT_SECRETS_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error('TENANT_SECRETS_ENCRYPTION_KEY não configurado.');
  }
  const key = Buffer.from(raw, 'base64');
  if (key.length !== 32) {
    throw new Error('TENANT_SECRETS_ENCRYPTION_KEY deve ser uma chave de 32 bytes em base64.');
  }
  return key;
}

// Retorna "v1:<iv>:<authTag>:<ciphertext>" (tudo em base64, exceto o prefixo de versão).
function encrypt(plainText) {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const ciphertext = Buffer.concat([cipher.update(String(plainText), 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [VERSION, iv.toString('base64'), authTag.toString('base64'), ciphertext.toString('base64')].join(':');
}

function decrypt(payload) {
  const key = getKey();
  const parts = String(payload).split(':');
  if (parts.length !== 4 || parts[0] !== VERSION) {
    throw new Error('Formato de payload criptografado inválido.');
  }
  const [, ivB64, authTagB64, ciphertextB64] = parts;

  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(authTagB64, 'base64'));

  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertextB64, 'base64')),
    decipher.final(),
  ]);

  return plaintext.toString('utf8');
}

module.exports = { encrypt, decrypt };

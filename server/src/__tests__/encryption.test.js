const crypto = require('crypto');

const ORIGINAL_KEY = process.env.TENANT_SECRETS_ENCRYPTION_KEY;

beforeEach(() => {
  jest.resetModules();
  process.env.TENANT_SECRETS_ENCRYPTION_KEY = crypto.randomBytes(32).toString('base64');
});

afterAll(() => {
  if (ORIGINAL_KEY !== undefined) {
    process.env.TENANT_SECRETS_ENCRYPTION_KEY = ORIGINAL_KEY;
  } else {
    delete process.env.TENANT_SECRETS_ENCRYPTION_KEY;
  }
});

function loadEncryption() {
  return require('../utils/encryption');
}

describe('encryption.encrypt/decrypt', () => {
  it('faz round-trip: decrypt(encrypt(x)) === x', () => {
    const { encrypt, decrypt } = loadEncryption();
    const plain = 'sk-super-secreta-123';

    const ciphertext = encrypt(plain);
    expect(decrypt(ciphertext)).toBe(plain);
  });

  it('o texto criptografado nunca é igual ao texto puro', () => {
    const { encrypt } = loadEncryption();
    const plain = 'sk-super-secreta-123';

    expect(encrypt(plain)).not.toContain(plain);
  });

  it('gera ciphertexts diferentes para o mesmo valor (IV aleatório)', () => {
    const { encrypt } = loadEncryption();
    const plain = 'valor-repetido';

    expect(encrypt(plain)).not.toBe(encrypt(plain));
  });

  it('inclui o prefixo de versão "v1"', () => {
    const { encrypt } = loadEncryption();
    expect(encrypt('qualquer-coisa').startsWith('v1:')).toBe(true);
  });

  it('lança erro ao criptografar sem TENANT_SECRETS_ENCRYPTION_KEY', () => {
    delete process.env.TENANT_SECRETS_ENCRYPTION_KEY;
    const { encrypt } = loadEncryption();

    expect(() => encrypt('x')).toThrow('TENANT_SECRETS_ENCRYPTION_KEY');
  });

  it('lança erro com chave de tamanho inválido', () => {
    process.env.TENANT_SECRETS_ENCRYPTION_KEY = Buffer.from('chave-curta-demais').toString('base64');
    const { encrypt } = loadEncryption();

    expect(() => encrypt('x')).toThrow('32 bytes');
  });

  it('lança erro ao decriptar payload malformado', () => {
    const { decrypt } = loadEncryption();
    expect(() => decrypt('formato-invalido')).toThrow('inválido');
  });

  it('lança erro ao decriptar com uma chave diferente da usada para criptografar', () => {
    const { encrypt } = loadEncryption();
    const ciphertext = encrypt('segredo');

    process.env.TENANT_SECRETS_ENCRYPTION_KEY = crypto.randomBytes(32).toString('base64');
    jest.resetModules();
    const { decrypt } = require('../utils/encryption');

    expect(() => decrypt(ciphertext)).toThrow();
  });
});

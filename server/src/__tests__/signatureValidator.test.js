const crypto = require('crypto');

// Isola variáveis de ambiente — sem efeito colateral entre testes
const ORIGINAL_SECRET = process.env.WHATSAPP_APP_SECRET;

afterAll(() => {
  if (ORIGINAL_SECRET !== undefined) {
    process.env.WHATSAPP_APP_SECRET = ORIGINAL_SECRET;
  } else {
    delete process.env.WHATSAPP_APP_SECRET;
  }
});

const { validateSignature } = require('../integrations/meta/signatureValidator');

const TEST_SECRET = 'segredo-de-teste-unitario';

function makeSignature(secret, body) {
  return 'sha256=' + crypto.createHmac('sha256', secret).update(body).digest('hex');
}

beforeEach(() => {
  process.env.WHATSAPP_APP_SECRET = TEST_SECRET;
});

afterEach(() => {
  delete process.env.WHATSAPP_APP_SECRET;
});

describe('validateSignature — assinatura válida', () => {
  it('retorna true para assinatura HMAC-SHA256 correta (Buffer)', () => {
    const body = Buffer.from('{"test":"payload"}');
    expect(validateSignature(body, makeSignature(TEST_SECRET, body))).toBe(true);
  });

  it('retorna true para payload em string', () => {
    const body = '{"object":"whatsapp_business_account"}';
    expect(validateSignature(body, makeSignature(TEST_SECRET, body))).toBe(true);
  });

  it('retorna true para payload vazio mas assinado corretamente', () => {
    const body = Buffer.from('');
    expect(validateSignature(body, makeSignature(TEST_SECRET, body))).toBe(true);
  });
});

describe('validateSignature — assinatura inválida', () => {
  it('retorna false para hash hex incorreto', () => {
    const body = Buffer.from('{"test":"payload"}');
    expect(validateSignature(body, 'sha256=0000000000000000000000000000000000000000000000000000000000000000')).toBe(false);
  });

  it('retorna false para body adulterado após assinar', () => {
    const original = Buffer.from('body original');
    const adulterado = Buffer.from('body adulterado');
    const sig = makeSignature(TEST_SECRET, original);
    expect(validateSignature(adulterado, sig)).toBe(false);
  });

  it('retorna false para secret diferente do configurado', () => {
    const body = Buffer.from('payload');
    const sigOutroSecret = makeSignature('outro-secret', body);
    expect(validateSignature(body, sigOutroSecret)).toBe(false);
  });
});

describe('validateSignature — header ausente ou malformado', () => {
  it('retorna false para header undefined', () => {
    expect(validateSignature(Buffer.from('test'), undefined)).toBe(false);
  });

  it('retorna false para header null', () => {
    expect(validateSignature(Buffer.from('test'), null)).toBe(false);
  });

  it('retorna false para string vazia', () => {
    expect(validateSignature(Buffer.from('test'), '')).toBe(false);
  });

  it('retorna false para hash sem prefixo sha256=', () => {
    const body = Buffer.from('test');
    const rawHex = crypto.createHmac('sha256', TEST_SECRET).update(body).digest('hex');
    expect(validateSignature(body, rawHex)).toBe(false);
  });

  it('retorna false para prefixo errado (sha1= em vez de sha256=)', () => {
    expect(validateSignature(Buffer.from('test'), 'sha1=aaabbbccc')).toBe(false);
  });

  it('retorna false (lengths diferentes não causam exceção)', () => {
    // timingSafeEqual lança RangeError se lengths diferentes — deve ser capturado
    expect(validateSignature(Buffer.from('test'), 'sha256=abc')).toBe(false);
  });
});

describe('validateSignature — WHATSAPP_APP_SECRET não configurado', () => {
  it('retorna false e não expõe erro para o cliente', () => {
    delete process.env.WHATSAPP_APP_SECRET;
    const body = Buffer.from('payload');
    expect(validateSignature(body, 'sha256=qualquercoisa')).toBe(false);
  });
});

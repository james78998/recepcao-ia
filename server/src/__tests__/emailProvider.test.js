jest.mock('../integrations/email/providers/smtpEmailProvider', () => ({ send: jest.fn() }));
jest.mock('../integrations/email/providers/dryRunEmailProvider', () => ({ send: jest.fn() }));

const smtpEmailProvider = require('../integrations/email/providers/smtpEmailProvider');
const dryRunEmailProvider = require('../integrations/email/providers/dryRunEmailProvider');
const { getEmailProvider } = require('../integrations/email');

const ORIGINAL_ENV = process.env;

beforeEach(() => {
  jest.clearAllMocks();
  process.env = { ...ORIGINAL_ENV };
  delete process.env.EMAIL_DRY_RUN;
  delete process.env.EMAIL_PROVIDER;
});

afterAll(() => {
  process.env = ORIGINAL_ENV;
});

describe('getEmailProvider', () => {
  it('retorna o provider dry-run quando EMAIL_DRY_RUN=true, mesmo com EMAIL_PROVIDER definido', () => {
    process.env.EMAIL_DRY_RUN = 'true';
    process.env.EMAIL_PROVIDER = 'smtp';

    expect(getEmailProvider()).toBe(dryRunEmailProvider);
  });

  it('retorna o provider SMTP por padrão (sem EMAIL_PROVIDER definido)', () => {
    expect(getEmailProvider()).toBe(smtpEmailProvider);
  });

  it('retorna o provider SMTP quando EMAIL_PROVIDER=smtp', () => {
    process.env.EMAIL_PROVIDER = 'smtp';
    expect(getEmailProvider()).toBe(smtpEmailProvider);
  });

  it.each(['resend', 'sendgrid', 'ses'])(
    'lança erro claro para "%s" — reservado, ainda não implementado',
    (providerKey) => {
      process.env.EMAIL_PROVIDER = providerKey;
      expect(() => getEmailProvider()).toThrow(/ainda não implementado/);
    }
  );

  it('lança erro para um provider desconhecido', () => {
    process.env.EMAIL_PROVIDER = 'provedor-que-nao-existe';
    expect(() => getEmailProvider()).toThrow(/desconhecido/);
  });
});

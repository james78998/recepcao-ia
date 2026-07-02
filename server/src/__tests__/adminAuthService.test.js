jest.mock('../repositories/adminUserRepository');
jest.mock('bcrypt');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const adminUserRepository = require('../repositories/adminUserRepository');
const { login } = require('../services/adminAuthService');

const ADMIN = {
  id: 'admin-uuid-1',
  name: 'Super Admin',
  email: 'admin@recepcaoia.com',
  passwordHash: 'hashed-password',
  role: 'SUPER_ADMIN',
  isActive: true,
};

beforeAll(() => {
  process.env.ADMIN_JWT_SECRET = 'test-admin-secret';
  process.env.JWT_SECRET = 'test-tenant-secret';
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('adminAuthService.login — sucesso', () => {
  it('retorna accessToken e dados do admin quando credenciais são válidas', async () => {
    adminUserRepository.findByEmail.mockResolvedValue(ADMIN);
    bcrypt.compare.mockResolvedValue(true);

    const result = await login({ email: ADMIN.email, password: 'senha-correta' });

    expect(result.accessToken).toEqual(expect.any(String));
    expect(result.admin).toEqual({
      id: ADMIN.id,
      name: ADMIN.name,
      email: ADMIN.email,
      role: ADMIN.role,
    });
  });

  it('assina o token com ADMIN_JWT_SECRET e sem tenantId no payload', async () => {
    adminUserRepository.findByEmail.mockResolvedValue(ADMIN);
    bcrypt.compare.mockResolvedValue(true);

    const { accessToken } = await login({ email: ADMIN.email, password: 'senha-correta' });
    const payload = jwt.verify(accessToken, process.env.ADMIN_JWT_SECRET);

    expect(payload.sub).toBe(ADMIN.id);
    expect(payload.role).toBe('SUPER_ADMIN');
    expect(payload.tenantId).toBeUndefined();
  });

  it('token de admin não é válido com o segredo do tenant (isolamento de realm)', async () => {
    adminUserRepository.findByEmail.mockResolvedValue(ADMIN);
    bcrypt.compare.mockResolvedValue(true);

    const { accessToken } = await login({ email: ADMIN.email, password: 'senha-correta' });

    expect(() => jwt.verify(accessToken, process.env.JWT_SECRET)).toThrow();
  });
});

describe('adminAuthService.login — erros', () => {
  it('lança 401 quando o e-mail não existe', async () => {
    adminUserRepository.findByEmail.mockResolvedValue(null);

    await expect(login({ email: 'nao-existe@x.com', password: 'qualquer' }))
      .rejects.toMatchObject({ status: 401 });
  });

  it('lança 401 quando a senha está incorreta', async () => {
    adminUserRepository.findByEmail.mockResolvedValue(ADMIN);
    bcrypt.compare.mockResolvedValue(false);

    await expect(login({ email: ADMIN.email, password: 'senha-errada' }))
      .rejects.toMatchObject({ status: 401 });
  });

  it('lança 401 quando a conta está desativada', async () => {
    adminUserRepository.findByEmail.mockResolvedValue({ ...ADMIN, isActive: false });
    bcrypt.compare.mockResolvedValue(true);

    await expect(login({ email: ADMIN.email, password: 'senha-correta' }))
      .rejects.toMatchObject({ status: 401 });
  });
});

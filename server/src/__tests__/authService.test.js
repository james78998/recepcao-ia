jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../repositories/userRepository');
jest.mock('../services/tenantOnboardingService');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const { login, me, updateMe, changePassword } = require('../services/authService');

const USER_WITH_TENANT = {
  id: 'user-1',
  name: 'Admin Teste',
  email: 'admin@teste.com',
  role: 'ADMIN',
  tenantId: 'tenant-1',
  passwordHash: 'hash-qualquer',
  tenant: { id: 'tenant-1', name: 'Clínica Teste', aiEnabled: false },
};

beforeEach(() => {
  jest.clearAllMocks();
  jwt.sign.mockReturnValue('token-fake');
});

describe('authService — formatUser inclui tenant.aiEnabled', () => {
  it('login retorna tenant.aiEnabled real do banco', async () => {
    userRepository.findByEmailWithTenant.mockResolvedValue(USER_WITH_TENANT);
    bcrypt.compare.mockResolvedValue(true);

    const { user } = await login({ email: 'admin@teste.com', password: 'senha123' });

    expect(user.tenant.aiEnabled).toBe(false);
    expect(user.tenant.id).toBe('tenant-1');
    expect(user.tenant.name).toBe('Clínica Teste');
  });

  it('me() retorna tenant.aiEnabled real do banco', async () => {
    userRepository.findByIdWithTenant.mockResolvedValue(USER_WITH_TENANT);

    const user = await me('user-1');

    expect(user.tenant.aiEnabled).toBe(false);
  });

  it('reflete aiEnabled=true quando o tenant está com IA ativa', async () => {
    userRepository.findByEmailWithTenant.mockResolvedValue({
      ...USER_WITH_TENANT,
      tenant: { ...USER_WITH_TENANT.tenant, aiEnabled: true },
    });
    bcrypt.compare.mockResolvedValue(true);

    const { user } = await login({ email: 'admin@teste.com', password: 'senha123' });

    expect(user.tenant.aiEnabled).toBe(true);
  });
});

describe('authService.updateMe', () => {
  it('atualiza nome/e-mail e retorna o usuário formatado', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.update.mockResolvedValue({});
    userRepository.findByIdWithTenant.mockResolvedValue({
      ...USER_WITH_TENANT,
      name: 'Novo Nome',
    });

    const result = await updateMe('user-1', { name: 'Novo Nome' });

    expect(userRepository.update).toHaveBeenCalledWith('user-1', { name: 'Novo Nome', email: undefined });
    expect(result.name).toBe('Novo Nome');
  });

  it('lança 409 quando o e-mail já pertence a outro usuário', async () => {
    userRepository.findByEmail.mockResolvedValue({ id: 'outro-user' });

    await expect(updateMe('user-1', { email: 'ocupado@teste.com' })).rejects.toMatchObject({ status: 409 });
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it('permite manter o próprio e-mail (não é conflito consigo mesmo)', async () => {
    userRepository.findByEmail.mockResolvedValue({ id: 'user-1' });
    userRepository.update.mockResolvedValue({});
    userRepository.findByIdWithTenant.mockResolvedValue(USER_WITH_TENANT);

    await expect(updateMe('user-1', { email: 'admin@teste.com' })).resolves.toBeDefined();
    expect(userRepository.update).toHaveBeenCalled();
  });
});

describe('authService.changePassword', () => {
  it('troca a senha quando a senha atual está correta', async () => {
    userRepository.findById.mockResolvedValue({ id: 'user-1', passwordHash: 'hash-antigo' });
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue('hash-novo');

    await changePassword('user-1', { currentPassword: 'senhaAtual123', newPassword: 'senhaNova123' });

    expect(bcrypt.hash).toHaveBeenCalledWith('senhaNova123', expect.any(Number));
    expect(userRepository.update).toHaveBeenCalledWith('user-1', { passwordHash: 'hash-novo' });
  });

  it('lança 401 quando a senha atual está incorreta', async () => {
    userRepository.findById.mockResolvedValue({ id: 'user-1', passwordHash: 'hash-antigo' });
    bcrypt.compare.mockResolvedValue(false);

    await expect(
      changePassword('user-1', { currentPassword: 'errada', newPassword: 'senhaNova123' })
    ).rejects.toMatchObject({ status: 401 });
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it('lança 404 quando o usuário não existe', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(
      changePassword('id-inexistente', { currentPassword: 'x', newPassword: 'senhaNova123' })
    ).rejects.toMatchObject({ status: 404 });
  });
});

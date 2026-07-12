jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../repositories/userRepository');
jest.mock('../repositories/passwordResetTokenRepository');
jest.mock('../services/tenantOnboardingService');
jest.mock('../services/emailService');
jest.mock('../services/tenantEntitlementService');
jest.mock('../utils/domainEvents');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const passwordResetTokenRepository = require('../repositories/passwordResetTokenRepository');
const emailService = require('../services/emailService');
const tenantEntitlementService = require('../services/tenantEntitlementService');
const domainEvents = require('../utils/domainEvents');
const { login, me, updateMe, changePassword, forgotPassword, resetPassword } = require('../services/authService');

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
  tenantEntitlementService.getEnabledModuleKeys.mockResolvedValue(['CRM', 'WHATSAPP']);
});

describe('authService — formatUser inclui tenant.aiEnabled e enabledModules', () => {
  it('login retorna tenant.aiEnabled real do banco', async () => {
    userRepository.findByEmailWithTenant.mockResolvedValue(USER_WITH_TENANT);
    bcrypt.compare.mockResolvedValue(true);

    const { user } = await login({ email: 'admin@teste.com', password: 'senha123' });

    expect(user.tenant.aiEnabled).toBe(false);
    expect(user.tenant.id).toBe('tenant-1');
    expect(user.tenant.name).toBe('Clínica Teste');
  });

  it('login retorna enabledModules a partir do tenantEntitlementService', async () => {
    userRepository.findByEmailWithTenant.mockResolvedValue(USER_WITH_TENANT);
    bcrypt.compare.mockResolvedValue(true);

    const { user } = await login({ email: 'admin@teste.com', password: 'senha123' });

    expect(tenantEntitlementService.getEnabledModuleKeys).toHaveBeenCalledWith('tenant-1');
    expect(user.enabledModules).toEqual(['CRM', 'WHATSAPP']);
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

describe('authService.forgotPassword', () => {
  it('gera token, envia e-mail e emite USER_PASSWORD_RESET_REQUESTED quando o e-mail existe', async () => {
    userRepository.findByEmail.mockResolvedValue({ ...USER_WITH_TENANT });

    await forgotPassword('admin@teste.com');

    expect(passwordResetTokenRepository.invalidateAllForUser).toHaveBeenCalledWith('user-1');
    expect(passwordResetTokenRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        tokenHash: expect.stringMatching(/^[0-9a-f]{64}$/), // SHA-256 hex — nunca o token em texto puro
        expiresAt: expect.any(Date),
      })
    );
    expect(emailService.sendPasswordResetEmail).toHaveBeenCalledWith(
      'admin@teste.com',
      expect.stringContaining('/redefinir-senha?token=')
    );
    expect(domainEvents.emit).toHaveBeenCalledWith('user.password_reset_requested', {
      tenantId: 'tenant-1',
      data: { id: 'user-1', name: 'Admin Teste', email: 'admin@teste.com' },
    });
  });

  it('não lança, não envia e-mail e não emite evento quando o e-mail não existe (evita enumeração)', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(forgotPassword('naoexiste@teste.com')).resolves.toBeUndefined();

    expect(passwordResetTokenRepository.create).not.toHaveBeenCalled();
    expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    expect(domainEvents.emit).not.toHaveBeenCalled();
  });
});

describe('authService.resetPassword', () => {
  it('troca a senha, invalida os tokens e emite USER_PASSWORD_RESET_COMPLETED', async () => {
    passwordResetTokenRepository.findValidByHash.mockResolvedValue({
      id: 'reset-token-1',
      userId: 'user-1',
    });
    userRepository.findById.mockResolvedValue({ ...USER_WITH_TENANT });
    bcrypt.hash.mockResolvedValue('hash-novo');

    await resetPassword('token-em-texto-puro', 'novaSenhaSegura123');

    expect(userRepository.update).toHaveBeenCalledWith('user-1', { passwordHash: 'hash-novo' });
    expect(passwordResetTokenRepository.invalidateAllForUser).toHaveBeenCalledWith('user-1');
    expect(domainEvents.emit).toHaveBeenCalledWith('user.password_reset_completed', {
      tenantId: 'tenant-1',
      data: { id: 'user-1', name: 'Admin Teste', email: 'admin@teste.com' },
    });
  });

  it('lança 400 quando o token não existe, expirou ou já foi usado', async () => {
    passwordResetTokenRepository.findValidByHash.mockResolvedValue(null);

    await expect(resetPassword('token-invalido', 'novaSenhaSegura123')).rejects.toMatchObject({ status: 400 });
    expect(userRepository.update).not.toHaveBeenCalled();
    expect(domainEvents.emit).not.toHaveBeenCalled();
  });

  it('lança 400 quando o token é válido mas o usuário não existe mais', async () => {
    passwordResetTokenRepository.findValidByHash.mockResolvedValue({ id: 'reset-token-1', userId: 'user-removido' });
    userRepository.findById.mockResolvedValue(null);

    await expect(resetPassword('token-qualquer', 'novaSenhaSegura123')).rejects.toMatchObject({ status: 400 });
    expect(userRepository.update).not.toHaveBeenCalled();
  });
});

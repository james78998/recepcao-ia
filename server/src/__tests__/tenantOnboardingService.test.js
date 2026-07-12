jest.mock('bcrypt');
jest.mock('../repositories/prisma', () => ({
  $transaction: jest.fn((cb) => cb({})),
}));
jest.mock('../repositories/userRepository');
jest.mock('../repositories/tenantRepository');
jest.mock('../repositories/moduleRepository');
jest.mock('../repositories/tenantModuleRepository');

const bcrypt = require('bcrypt');
const prisma = require('../repositories/prisma');
const userRepository = require('../repositories/userRepository');
const tenantRepository = require('../repositories/tenantRepository');
const moduleRepository = require('../repositories/moduleRepository');
const tenantModuleRepository = require('../repositories/tenantModuleRepository');
const { onboardTenant } = require('../services/tenantOnboardingService');

const CATALOG = [{ id: 'module-1' }, { id: 'module-2' }];

const INPUT = {
  tenantName: 'Clínica Teste',
  tenantEmail: 'clinica@teste.com',
  userName: 'Admin Teste',
  userEmail: 'admin@teste.com',
  password: 'senha1234',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('tenantOnboardingService.onboardTenant', () => {
  it('cria tenant e usuário ADMIN numa transação e retorna o usuário com tenant', async () => {
    tenantRepository.findByEmail.mockResolvedValue(null);
    userRepository.findByEmail.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashed-password');
    tenantRepository.create.mockResolvedValue({ id: 'tenant-1' });
    moduleRepository.findAll.mockResolvedValue(CATALOG);
    tenantModuleRepository.createManyEnabledForTenant.mockResolvedValue({ count: 2 });
    userRepository.create.mockResolvedValue({ id: 'user-1' });
    userRepository.findByIdWithTenant.mockResolvedValue({
      id: 'user-1',
      tenant: { id: 'tenant-1' },
    });

    const result = await onboardTenant(INPUT);

    expect(tenantRepository.create).toHaveBeenCalledWith(
      { name: INPUT.tenantName, email: INPUT.tenantEmail },
      expect.anything()
    );
    expect(tenantModuleRepository.createManyEnabledForTenant).toHaveBeenCalledWith(
      'tenant-1',
      ['module-1', 'module-2'],
      expect.anything()
    );
    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'tenant-1',
        name: INPUT.userName,
        email: INPUT.userEmail,
        passwordHash: 'hashed-password',
        role: 'ADMIN',
      }),
      expect.anything()
    );
    expect(result).toEqual({ id: 'user-1', tenant: { id: 'tenant-1' } });
  });

  it('lança 409 quando o e-mail da empresa já existe', async () => {
    tenantRepository.findByEmail.mockResolvedValue({ id: 'existing-tenant' });
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(onboardTenant(INPUT)).rejects.toMatchObject({ status: 409 });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('lança 409 quando o e-mail do usuário já existe', async () => {
    tenantRepository.findByEmail.mockResolvedValue(null);
    userRepository.findByEmail.mockResolvedValue({ id: 'existing-user' });

    await expect(onboardTenant(INPUT)).rejects.toMatchObject({ status: 409 });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});

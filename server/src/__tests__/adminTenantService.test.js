jest.mock('../repositories/tenantRepository');
jest.mock('../services/tenantOnboardingService');

const tenantRepository = require('../repositories/tenantRepository');
const tenantOnboardingService = require('../services/tenantOnboardingService');
const { list, getById, create } = require('../services/adminTenantService');

const TENANT_ROW = {
  id: 'tenant-uuid-1',
  name: 'Clínica Teste',
  email: 'clinica@teste.com',
  createdAt: new Date('2026-06-20T12:00:00.000Z'),
  aiEnabled: true,
  whatsappPhoneNumberId: '123456789',
  _count: { users: 1, leads: 5, conversations: 2 },
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('adminTenantService.list', () => {
  it('retorna tenants formatados com totalUsers/totalLeads/totalConversations', async () => {
    tenantRepository.findAllForAdmin.mockResolvedValue([TENANT_ROW]);

    const result = await list();

    expect(result).toEqual([
      {
        id: TENANT_ROW.id,
        name: TENANT_ROW.name,
        email: TENANT_ROW.email,
        createdAt: TENANT_ROW.createdAt,
        aiEnabled: true,
        whatsappPhoneNumberId: '123456789',
        totalUsers: 1,
        totalLeads: 5,
        totalConversations: 2,
      },
    ]);
  });

  it('não vaza o campo _count bruto do Prisma', async () => {
    tenantRepository.findAllForAdmin.mockResolvedValue([TENANT_ROW]);

    const [tenant] = await list();

    expect(tenant._count).toBeUndefined();
  });

  it('retorna array vazio quando não há tenants', async () => {
    tenantRepository.findAllForAdmin.mockResolvedValue([]);

    const result = await list();

    expect(result).toEqual([]);
  });
});

describe('adminTenantService.getById', () => {
  it('retorna o tenant formatado quando encontrado', async () => {
    tenantRepository.findByIdForAdmin.mockResolvedValue(TENANT_ROW);

    const result = await getById(TENANT_ROW.id);

    expect(result.totalLeads).toBe(5);
    expect(result.totalConversations).toBe(2);
  });

  it('lança 404 quando o tenant não existe', async () => {
    tenantRepository.findByIdForAdmin.mockResolvedValue(null);

    await expect(getById('id-inexistente')).rejects.toMatchObject({ status: 404 });
  });
});

describe('adminTenantService.create', () => {
  const INPUT = {
    tenantName: 'Clínica Teste',
    tenantEmail: 'clinica@teste.com',
    userName: 'Admin Teste',
    userEmail: 'admin@teste.com',
    password: 'senha1234',
  };

  it('cria o tenant via onboarding e retorna o tenant formatado', async () => {
    tenantOnboardingService.onboardTenant.mockResolvedValue({
      tenant: { id: TENANT_ROW.id },
    });
    tenantRepository.findByIdForAdmin.mockResolvedValue(TENANT_ROW);

    const result = await create(INPUT);

    expect(tenantOnboardingService.onboardTenant).toHaveBeenCalledWith(INPUT);
    expect(tenantRepository.findByIdForAdmin).toHaveBeenCalledWith(TENANT_ROW.id);
    expect(result.totalUsers).toBe(1);
    expect(result._count).toBeUndefined();
  });

  it('propaga erro de e-mail duplicado do onboarding', async () => {
    const conflictErr = Object.assign(new Error('E-mail de empresa já cadastrado.'), { status: 409 });
    tenantOnboardingService.onboardTenant.mockRejectedValue(conflictErr);

    await expect(create(INPUT)).rejects.toMatchObject({ status: 409 });
  });
});

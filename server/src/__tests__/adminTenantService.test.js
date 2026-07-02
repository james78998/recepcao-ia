jest.mock('../repositories/tenantRepository');

const tenantRepository = require('../repositories/tenantRepository');
const { list, getById } = require('../services/adminTenantService');

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

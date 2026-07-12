jest.mock('../repositories/prisma', () => ({
  $transaction: jest.fn((cb) => cb({})),
}));
jest.mock('../repositories/moduleRepository');
jest.mock('../repositories/tenantModuleRepository');
jest.mock('../repositories/tenantRepository');
jest.mock('../services/adminAuditLogService');

const moduleRepository = require('../repositories/moduleRepository');
const tenantModuleRepository = require('../repositories/tenantModuleRepository');
const tenantRepository = require('../repositories/tenantRepository');
const adminAuditLogService = require('../services/adminAuditLogService');
const {
  getEnabledModuleKeys,
  hasModule,
  getCatalogWithStatus,
  setModuleEnabled,
  setModulesBulk,
} = require('../services/tenantEntitlementService');

const TENANT = { id: 'tenant-1', name: 'Clínica Teste' };

const CATALOG = [
  { id: 'module-crm', key: 'CRM', name: 'CRM', description: null },
  { id: 'module-auto', key: 'AUTOMATION_ENGINE', name: 'Motor de Automações', description: null },
];

beforeEach(() => {
  jest.clearAllMocks();
});

describe('tenantEntitlementService.hasModule / getEnabledModuleKeys', () => {
  it('hasModule retorna true quando a chave está entre os módulos habilitados', async () => {
    tenantModuleRepository.findEnabledKeysByTenant.mockResolvedValue(['CRM', 'AUTOMATION_ENGINE']);

    await expect(hasModule('tenant-1', 'CRM')).resolves.toBe(true);
  });

  it('hasModule retorna false quando a chave não está habilitada', async () => {
    tenantModuleRepository.findEnabledKeysByTenant.mockResolvedValue(['CRM']);

    await expect(hasModule('tenant-1', 'AUTOMATION_ENGINE')).resolves.toBe(false);
  });

  it('getEnabledModuleKeys repassa o resultado do repository', async () => {
    tenantModuleRepository.findEnabledKeysByTenant.mockResolvedValue(['CRM']);

    await expect(getEnabledModuleKeys('tenant-1')).resolves.toEqual(['CRM']);
  });
});

describe('tenantEntitlementService.getCatalogWithStatus', () => {
  it('mescla o catálogo com o status habilitado/desabilitado do tenant', async () => {
    tenantRepository.findByIdProfile.mockResolvedValue(TENANT);
    moduleRepository.findAll.mockResolvedValue(CATALOG);
    tenantModuleRepository.findAllByTenant.mockResolvedValue([
      { moduleId: 'module-crm', enabled: true },
      { moduleId: 'module-auto', enabled: false },
    ]);

    const result = await getCatalogWithStatus('tenant-1');

    expect(result).toEqual([
      { key: 'CRM', name: 'CRM', description: null, enabled: true },
      { key: 'AUTOMATION_ENGINE', name: 'Motor de Automações', description: null, enabled: false },
    ]);
  });

  it('trata módulo sem linha de TenantModule como desabilitado', async () => {
    tenantRepository.findByIdProfile.mockResolvedValue(TENANT);
    moduleRepository.findAll.mockResolvedValue(CATALOG);
    tenantModuleRepository.findAllByTenant.mockResolvedValue([]);

    const result = await getCatalogWithStatus('tenant-1');

    expect(result.every((m) => m.enabled === false)).toBe(true);
  });

  it('lança 404 quando o tenant não existe', async () => {
    tenantRepository.findByIdProfile.mockResolvedValue(null);

    await expect(getCatalogWithStatus('id-inexistente')).rejects.toMatchObject({ status: 404 });
  });
});

describe('tenantEntitlementService.setModuleEnabled', () => {
  it('habilita um módulo e registra auditoria MODULE_ENABLED', async () => {
    tenantRepository.findByIdProfile.mockResolvedValue(TENANT);
    moduleRepository.findByKey.mockResolvedValue(CATALOG[1]);
    tenantModuleRepository.findAllByTenant
      .mockResolvedValueOnce([{ moduleId: 'module-auto', enabled: false }])
      .mockResolvedValueOnce([{ moduleId: 'module-auto', enabled: true }]);
    moduleRepository.findAll.mockResolvedValue(CATALOG);

    await setModuleEnabled('tenant-1', 'AUTOMATION_ENGINE', true, { adminUserId: 'admin-1' });

    expect(tenantModuleRepository.upsert).toHaveBeenCalledWith({
      tenantId: 'tenant-1',
      moduleId: 'module-auto',
      enabled: true,
    });
    expect(adminAuditLogService.record).toHaveBeenCalledWith(
      expect.objectContaining({
        adminUserId: 'admin-1',
        tenantId: 'tenant-1',
        action: 'MODULE_ENABLED',
        resource: 'TenantModule',
        resourceId: 'AUTOMATION_ENGINE',
        oldValue: { enabled: false },
        newValue: { enabled: true },
      })
    );
  });

  it('desabilita um módulo e registra auditoria MODULE_DISABLED', async () => {
    tenantRepository.findByIdProfile.mockResolvedValue(TENANT);
    moduleRepository.findByKey.mockResolvedValue(CATALOG[1]);
    tenantModuleRepository.findAllByTenant.mockResolvedValue([{ moduleId: 'module-auto', enabled: true }]);
    moduleRepository.findAll.mockResolvedValue(CATALOG);

    await setModuleEnabled('tenant-1', 'AUTOMATION_ENGINE', false, { adminUserId: 'admin-1' });

    expect(adminAuditLogService.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'MODULE_DISABLED', oldValue: { enabled: true }, newValue: { enabled: false } })
    );
  });

  it('lança 404 quando o tenant não existe', async () => {
    tenantRepository.findByIdProfile.mockResolvedValue(null);

    await expect(
      setModuleEnabled('id-inexistente', 'CRM', true, { adminUserId: 'admin-1' })
    ).rejects.toMatchObject({ status: 404 });
    expect(tenantModuleRepository.upsert).not.toHaveBeenCalled();
  });

  it('lança 404 quando o módulo não existe', async () => {
    tenantRepository.findByIdProfile.mockResolvedValue(TENANT);
    moduleRepository.findByKey.mockResolvedValue(null);

    await expect(
      setModuleEnabled('tenant-1', 'MODULO_INEXISTENTE', true, { adminUserId: 'admin-1' })
    ).rejects.toMatchObject({ status: 404 });
    expect(tenantModuleRepository.upsert).not.toHaveBeenCalled();
  });
});

describe('tenantEntitlementService.setModulesBulk', () => {
  it('aplica todas as mudanças e registra um único log MODULES_BULK_UPDATED', async () => {
    tenantRepository.findByIdProfile.mockResolvedValue(TENANT);
    moduleRepository.findAll
      .mockResolvedValueOnce(CATALOG) // resolução das chaves recebidas
      .mockResolvedValueOnce(CATALOG); // getCatalogWithStatus final
    tenantModuleRepository.findAllByTenant
      .mockResolvedValueOnce([
        { moduleId: 'module-crm', enabled: true },
        { moduleId: 'module-auto', enabled: true },
      ])
      .mockResolvedValueOnce([
        { moduleId: 'module-crm', enabled: false },
        { moduleId: 'module-auto', enabled: false },
      ]);

    await setModulesBulk(
      'tenant-1',
      [
        { key: 'CRM', enabled: false },
        { key: 'AUTOMATION_ENGINE', enabled: false },
      ],
      { adminUserId: 'admin-1' }
    );

    expect(tenantModuleRepository.upsert).toHaveBeenCalledTimes(2);
    expect(adminAuditLogService.record).toHaveBeenCalledTimes(1);
    expect(adminAuditLogService.record).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'MODULES_BULK_UPDATED',
        oldValue: { CRM: true, AUTOMATION_ENGINE: true },
        newValue: { CRM: false, AUTOMATION_ENGINE: false },
      })
    );
  });

  it('lança 404 e não altera nada quando alguma chave do lote não existe no catálogo', async () => {
    tenantRepository.findByIdProfile.mockResolvedValue(TENANT);
    moduleRepository.findAll.mockResolvedValue(CATALOG);

    await expect(
      setModulesBulk('tenant-1', [{ key: 'MODULO_INEXISTENTE', enabled: true }], { adminUserId: 'admin-1' })
    ).rejects.toMatchObject({ status: 404 });
    expect(tenantModuleRepository.upsert).not.toHaveBeenCalled();
    expect(adminAuditLogService.record).not.toHaveBeenCalled();
  });

  it('lança 404 quando o tenant não existe', async () => {
    tenantRepository.findByIdProfile.mockResolvedValue(null);

    await expect(
      setModulesBulk('id-inexistente', [{ key: 'CRM', enabled: true }], { adminUserId: 'admin-1' })
    ).rejects.toMatchObject({ status: 404 });
  });
});

jest.mock('../repositories/adminAuditLogRepository');
jest.mock('../utils/logger');

const adminAuditLogRepository = require('../repositories/adminAuditLogRepository');
const logger = require('../utils/logger');
const { record } = require('../services/adminAuditLogService');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('adminAuditLogService.record', () => {
  it('grava o log de auditoria com os campos recebidos', async () => {
    await record({
      adminUserId: 'admin-1',
      tenantId: 'tenant-1',
      action: 'MODULE_ENABLED',
      resource: 'TenantModule',
      resourceId: 'CRM',
      oldValue: { enabled: false },
      newValue: { enabled: true },
    });

    expect(adminAuditLogRepository.create).toHaveBeenCalledWith({
      adminUserId: 'admin-1',
      tenantId: 'tenant-1',
      action: 'MODULE_ENABLED',
      resource: 'TenantModule',
      resourceId: 'CRM',
      oldValue: { enabled: false },
      newValue: { enabled: true },
    });
  });

  it('não lança quando a gravação falha — apenas registra no logger', async () => {
    adminAuditLogRepository.create.mockRejectedValue(new Error('falha de banco'));

    await expect(
      record({ adminUserId: 'admin-1', action: 'MODULE_ENABLED', resource: 'TenantModule' })
    ).resolves.toBeUndefined();

    expect(logger.error).toHaveBeenCalled();
  });
});

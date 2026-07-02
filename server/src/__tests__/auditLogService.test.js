jest.mock('../repositories/auditLogRepository');
jest.mock('../utils/logger');

const auditLogRepository = require('../repositories/auditLogRepository');
const logger = require('../utils/logger');
const { record } = require('../services/auditLogService');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('auditLogService.record', () => {
  it('grava o log de auditoria com os campos fornecidos', async () => {
    auditLogRepository.create.mockResolvedValue({ id: 'log-1' });

    await record({
      tenantId: 't1',
      userId: 'u1',
      action: 'UPDATE_AI_CONFIG',
      resource: 'TenantAiConfig',
      oldValue: { model: 'a' },
      newValue: { model: 'b' },
    });

    expect(auditLogRepository.create).toHaveBeenCalledWith({
      tenantId: 't1',
      userId: 'u1',
      action: 'UPDATE_AI_CONFIG',
      resource: 'TenantAiConfig',
      oldValue: { model: 'a' },
      newValue: { model: 'b' },
    });
  });

  it('não lança erro quando a gravação falha — engole e loga', async () => {
    auditLogRepository.create.mockRejectedValue(new Error('DB offline'));

    await expect(
      record({ tenantId: 't1', userId: 'u1', action: 'X', resource: 'Y', oldValue: null, newValue: null })
    ).resolves.toBeUndefined();

    expect(logger.error).toHaveBeenCalled();
  });
});

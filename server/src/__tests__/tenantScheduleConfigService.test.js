jest.mock('../repositories/tenantScheduleConfigRepository');
jest.mock('../services/auditLogService');

const tenantScheduleConfigRepository = require('../repositories/tenantScheduleConfigRepository');
const auditLogService = require('../services/auditLogService');
const { getOrDefault, update } = require('../services/tenantScheduleConfigService');

const TENANT_ID = 'tenant-1';
const USER_ID = 'user-1';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('tenantScheduleConfigService.getOrDefault', () => {
  it('retorna defaults quando o tenant não configurou nada', async () => {
    tenantScheduleConfigRepository.findByTenantId.mockResolvedValue(null);

    const result = await getOrDefault(TENANT_ID);

    expect(result).toEqual({
      timezone: 'America/Sao_Paulo',
      defaultAppointmentDurationMin: 30,
      bufferBetweenAppointmentsMin: 0,
    });
  });

  it('retorna os valores configurados pelo tenant', async () => {
    tenantScheduleConfigRepository.findByTenantId.mockResolvedValue({
      timezone: 'America/Manaus',
      defaultAppointmentDurationMin: 45,
      bufferBetweenAppointmentsMin: 15,
    });

    const result = await getOrDefault(TENANT_ID);

    expect(result.timezone).toBe('America/Manaus');
    expect(result.defaultAppointmentDurationMin).toBe(45);
  });
});

describe('tenantScheduleConfigService.update', () => {
  it('persiste os dados enviados e registra auditoria', async () => {
    tenantScheduleConfigRepository.findByTenantId
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ timezone: 'America/Manaus', defaultAppointmentDurationMin: 45, bufferBetweenAppointmentsMin: 15 });
    tenantScheduleConfigRepository.upsert.mockResolvedValue({});

    const result = await update(TENANT_ID, USER_ID, { timezone: 'America/Manaus', defaultAppointmentDurationMin: 45 });

    expect(tenantScheduleConfigRepository.upsert).toHaveBeenCalledWith(TENANT_ID, {
      timezone: 'America/Manaus',
      defaultAppointmentDurationMin: 45,
    });
    expect(result.timezone).toBe('America/Manaus');
    expect(auditLogService.record).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: TENANT_ID, userId: USER_ID, action: 'UPDATE_SCHEDULE_CONFIG' })
    );
  });
});

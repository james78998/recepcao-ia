jest.mock('../repositories/tenantBusinessHourRepository');
jest.mock('../services/auditLogService');

const tenantBusinessHourRepository = require('../repositories/tenantBusinessHourRepository');
const auditLogService = require('../services/auditLogService');
const { getAll, updateAll, DAYS_ORDER } = require('../services/tenantBusinessHourService');

const TENANT_ID = 'tenant-1';
const USER_ID = 'user-1';

const MON_ROW = {
  dayOfWeek: 'MON',
  enabled: true,
  startTime: '08:00',
  endTime: '18:00',
  lunchStart: '12:00',
  lunchEnd: '13:00',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('tenantBusinessHourService.getAll', () => {
  it('retorna os 7 dias, na ordem MON..SUN', async () => {
    tenantBusinessHourRepository.findAllByTenantId.mockResolvedValue([MON_ROW]);

    const result = await getAll(TENANT_ID);

    expect(result).toHaveLength(7);
    expect(result.map((d) => d.dayOfWeek)).toEqual(DAYS_ORDER);
  });

  it('preenche dias ausentes como enabled=false com horários nulos', async () => {
    tenantBusinessHourRepository.findAllByTenantId.mockResolvedValue([MON_ROW]);

    const result = await getAll(TENANT_ID);
    const tuesday = result.find((d) => d.dayOfWeek === 'TUE');

    expect(tuesday).toEqual({
      dayOfWeek: 'TUE',
      enabled: false,
      startTime: null,
      endTime: null,
      lunchStart: null,
      lunchEnd: null,
    });
  });

  it('preserva o dia configurado', async () => {
    tenantBusinessHourRepository.findAllByTenantId.mockResolvedValue([MON_ROW]);

    const result = await getAll(TENANT_ID);
    const monday = result.find((d) => d.dayOfWeek === 'MON');

    expect(monday).toEqual(MON_ROW);
  });
});

describe('tenantBusinessHourService.updateAll', () => {
  it('substitui a semana inteira via replaceAll e registra auditoria', async () => {
    tenantBusinessHourRepository.findAllByTenantId
      .mockResolvedValueOnce([]) // before
      .mockResolvedValueOnce([MON_ROW]); // after
    tenantBusinessHourRepository.replaceAll.mockResolvedValue([]);

    const days = [MON_ROW];
    await updateAll(TENANT_ID, USER_ID, days);

    expect(tenantBusinessHourRepository.replaceAll).toHaveBeenCalledWith(TENANT_ID, days);
    expect(auditLogService.record).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: TENANT_ID, userId: USER_ID, action: 'UPDATE_BUSINESS_HOURS' })
    );
  });
});

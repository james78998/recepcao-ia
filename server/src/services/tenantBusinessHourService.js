const tenantBusinessHourRepository = require('../repositories/tenantBusinessHourRepository');
const auditLogService = require('./auditLogService');

const DAYS_ORDER = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

function withDefaults(rows) {
  const byDay = Object.fromEntries(rows.map((row) => [row.dayOfWeek, row]));
  return DAYS_ORDER.map(
    (day) =>
      byDay[day] ?? {
        dayOfWeek: day,
        enabled: false,
        startTime: null,
        endTime: null,
        lunchStart: null,
        lunchEnd: null,
      }
  );
}

async function getAll(tenantId) {
  const rows = await tenantBusinessHourRepository.findAllByTenantId(tenantId);
  return withDefaults(rows);
}

// Substitui a semana inteira de uma vez — a tela sempre envia os 7 dias.
async function updateAll(tenantId, userId, days) {
  const before = await getAll(tenantId);
  await tenantBusinessHourRepository.replaceAll(tenantId, days);
  const after = await getAll(tenantId);

  await auditLogService.record({
    tenantId,
    userId,
    action: 'UPDATE_BUSINESS_HOURS',
    resource: 'TenantBusinessHour',
    oldValue: before,
    newValue: after,
  });

  return after;
}

module.exports = { getAll, updateAll, DAYS_ORDER };

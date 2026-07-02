const tenantScheduleConfigRepository = require('../repositories/tenantScheduleConfigRepository');
const auditLogService = require('./auditLogService');

function withDefaults(row) {
  return {
    timezone: row?.timezone ?? 'America/Sao_Paulo',
    defaultAppointmentDurationMin: row?.defaultAppointmentDurationMin ?? 30,
    bufferBetweenAppointmentsMin: row?.bufferBetweenAppointmentsMin ?? 0,
  };
}

async function getOrDefault(tenantId) {
  const row = await tenantScheduleConfigRepository.findByTenantId(tenantId);
  return withDefaults(row);
}

async function update(tenantId, userId, data) {
  const before = await getOrDefault(tenantId);
  await tenantScheduleConfigRepository.upsert(tenantId, data);
  const after = await getOrDefault(tenantId);

  await auditLogService.record({
    tenantId,
    userId,
    action: 'UPDATE_SCHEDULE_CONFIG',
    resource: 'TenantScheduleConfig',
    oldValue: before,
    newValue: after,
  });

  return after;
}

module.exports = { getOrDefault, update };

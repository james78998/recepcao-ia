const tenantRepository = require('../repositories/tenantRepository');
const auditLogService = require('./auditLogService');

async function update(tenantId, userId, data) {
  const before = await tenantRepository.findByIdProfile(tenantId);
  const after = await tenantRepository.updateProfile(tenantId, data);

  await auditLogService.record({
    tenantId,
    userId,
    action: 'UPDATE_PROFILE',
    resource: 'Tenant',
    oldValue: before,
    newValue: after,
  });

  return after;
}

module.exports = { update };

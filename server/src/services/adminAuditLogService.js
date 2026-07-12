const adminAuditLogRepository = require('../repositories/adminAuditLogRepository');
const logger = require('../utils/logger');

// Registra uma ação do Super Admin (realm de AdminUser, separado do AuditLog
// do tenant). Mesmo contrato de auditLogService.record: falha ao gravar
// auditoria nunca derruba a operação principal — é registrada e engolida.
async function record({ adminUserId, tenantId, action, resource, resourceId, oldValue, newValue }) {
  try {
    await adminAuditLogRepository.create({ adminUserId, tenantId, action, resource, resourceId, oldValue, newValue });
  } catch (err) {
    logger.error('[admin-audit] falha ao registrar log de auditoria', {
      adminUserId, tenantId, action, resource, message: err.message,
    });
  }
}

module.exports = { record };

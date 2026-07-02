const auditLogRepository = require('../repositories/auditLogRepository');
const logger = require('../utils/logger');

// Registra uma alteração de configuração do tenant. oldValue/newValue devem
// ser objetos JÁ SANITIZADOS pelo chamador (nunca segredo em texto puro ou
// payload criptografado bruto — ver helpers `redactSecretFields` em cada
// service de configuração). Falha ao gravar auditoria não deve derrubar a
// operação principal — é registrada e engolida.
async function record({ tenantId, userId, action, resource, oldValue, newValue }) {
  try {
    await auditLogRepository.create({ tenantId, userId, action, resource, oldValue, newValue });
  } catch (err) {
    logger.error('[audit] falha ao registrar log de auditoria', { tenantId, action, resource, message: err.message });
  }
}

module.exports = { record };

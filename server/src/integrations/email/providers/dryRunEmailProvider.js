const logger = require('../../../utils/logger');

/**
 * Implementação do contrato EmailProvider que não envia nada de verdade —
 * só loga o conteúdo. Usado em dev/teste (EMAIL_DRY_RUN=true) para exercitar
 * o fluxo inteiro sem precisar de credenciais SMTP reais.
 */
async function send({ to, subject, html, text }) {
  logger.info('[email] EMAIL_DRY_RUN ativo — e-mail não foi enviado', { to, subject });
  logger.info('[email] conteúdo (dry-run)', { text: text ?? html });
}

module.exports = { send };

const { getEmailProvider } = require('../integrations/email');
const { buildPasswordResetEmail } = require('../integrations/email/templates/passwordReset');
const logger = require('../utils/logger');

// Nunca lança para quem chama — falha de envio de e-mail não pode quebrar o
// fluxo de recuperação de senha do lado do backend (a resposta ao cliente já
// é genérica de propósito, ver authService.forgotPassword).
async function sendPasswordResetEmail(to, resetLink) {
  try {
    const { subject, html, text } = buildPasswordResetEmail(resetLink);
    await getEmailProvider().send({ to, subject, html, text });
  } catch (err) {
    logger.error('[email] falha ao enviar e-mail de recuperação de senha', { message: err.message });
  }
}

module.exports = { sendPasswordResetEmail };

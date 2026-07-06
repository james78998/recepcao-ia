// Função pura — monta o conteúdo do e-mail de recuperação de senha.
// Separado do provider para poder testar o texto sem depender de SMTP/mock.
function buildPasswordResetEmail(resetLink) {
  const subject = 'Recepção IA — Redefinição de senha';

  const text =
    `Recebemos um pedido para redefinir sua senha.\n\n` +
    `Acesse o link abaixo para escolher uma nova senha (válido por tempo limitado):\n${resetLink}\n\n` +
    `Se você não pediu isso, pode ignorar este e-mail — sua senha continua a mesma.`;

  const html = `
    <p>Recebemos um pedido para redefinir sua senha.</p>
    <p><a href="${resetLink}">Clique aqui para escolher uma nova senha</a> (link válido por tempo limitado).</p>
    <p>Se você não pediu isso, pode ignorar este e-mail — sua senha continua a mesma.</p>
  `;

  return { subject, text, html };
}

module.exports = { buildPasswordResetEmail };

const dryRunEmailProvider = require('./providers/dryRunEmailProvider');
const smtpEmailProvider = require('./providers/smtpEmailProvider');

/**
 * Contrato EmailProvider — qualquer provedor (SMTP, Resend, SendGrid, Amazon
 * SES...) deve expor:
 *
 *   async function send({ to, subject, html, text }): Promise<void>
 *
 * O restante do sistema (emailService.js) nunca fala com nodemailer, Resend
 * etc. diretamente — só com esse contrato. Trocar de provedor é trocar o
 * valor de EMAIL_PROVIDER, sem tocar em quem chama send().
 */
const PROVIDERS = {
  smtp: smtpEmailProvider,
  // Reservado para o futuro — implementar o arquivo em providers/ e
  // adicionar a entrada aqui é a única mudança necessária:
  // resend: require('./providers/resendEmailProvider'),
  // sendgrid: require('./providers/sendgridEmailProvider'),
  // ses: require('./providers/sesEmailProvider'),
};

const NOT_YET_IMPLEMENTED = new Set(['resend', 'sendgrid', 'ses']);

function getEmailProvider() {
  if (process.env.EMAIL_DRY_RUN === 'true') {
    return dryRunEmailProvider;
  }

  const providerKey = process.env.EMAIL_PROVIDER || 'smtp';

  if (NOT_YET_IMPLEMENTED.has(providerKey)) {
    throw new Error(
      `Provedor de e-mail "${providerKey}" ainda não implementado. Providers disponíveis: ${Object.keys(PROVIDERS).join(', ')}.`
    );
  }

  const provider = PROVIDERS[providerKey];
  if (!provider) {
    throw new Error(`Provedor de e-mail "${providerKey}" desconhecido.`);
  }

  return provider;
}

module.exports = { getEmailProvider };

const nodemailer = require('nodemailer');

let cachedTransport = null;

// Lazy singleton — evita recriar a conexão SMTP a cada envio.
function getTransport() {
  if (cachedTransport) return cachedTransport;

  cachedTransport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
  });

  return cachedTransport;
}

/**
 * Implementação do contrato EmailProvider (ver integrations/email/index.js)
 * usando SMTP via nodemailer.
 */
async function send({ to, subject, html, text }) {
  const from = process.env.SMTP_FROM_NAME
    ? `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`
    : process.env.SMTP_FROM_EMAIL;

  await getTransport().sendMail({ from, to, subject, html, text });
}

module.exports = { send };

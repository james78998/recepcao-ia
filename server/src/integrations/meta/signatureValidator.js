const crypto = require('crypto');

/**
 * Valida o header X-Hub-Signature-256 enviado pela Meta.
 * Usa timingSafeEqual para evitar timing attacks.
 */
function validateSignature(rawBody, signatureHeader) {
  const appSecret = process.env.WHATSAPP_APP_SECRET;

  if (!appSecret) {
    console.error('[webhook] WHATSAPP_APP_SECRET não configurado — rejeição por segurança.');
    return false;
  }

  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
    return false;
  }

  const expected = 'sha256=' + crypto
    .createHmac('sha256', appSecret)
    .update(rawBody)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signatureHeader),
      Buffer.from(expected)
    );
  } catch {
    return false;
  }
}

module.exports = { validateSignature };

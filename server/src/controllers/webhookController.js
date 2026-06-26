const { validateSignature } = require('../integrations/meta/signatureValidator');
const whatsappService = require('../services/whatsappService');

/**
 * GET /api/webhooks/whatsapp
 * Verificação do webhook pela Meta (hub challenge).
 */
function verify(req, res) {
  const mode      = req.query['hub.mode'];
  const token     = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.status(403).json({ error: true, message: 'Verificação do webhook falhou.' });
}

/**
 * POST /api/webhooks/whatsapp
 * Recebimento de eventos da Meta. Responde 200 imediatamente;
 * processa o payload de forma assíncrona após a resposta.
 */
async function receive(req, res) {
  const signature = req.headers['x-hub-signature-256'];

  if (!validateSignature(req.rawBody, signature)) {
    return res.status(403).json({ error: true, message: 'Assinatura inválida.' });
  }

  // Meta exige resposta em até 20s — respondemos antes de processar
  res.status(200).json({ status: 'ok' });

  const body = req.body;
  if (body?.object !== 'whatsapp_business_account') return;

  const entries = body.entry ?? [];
  for (const entry of entries) {
    try {
      await whatsappService.processInbound(entry);
    } catch (err) {
      console.error('[webhook] erro ao processar entry:', err);
    }
  }
}

module.exports = { verify, receive };

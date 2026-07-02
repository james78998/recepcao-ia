const GRAPH_API_URL = 'https://graph.facebook.com/v21.0';
const TIMEOUT_MS = 10_000;

/**
 * Monta o payload de envio para a WhatsApp Cloud API.
 * Estruturado para receber novos tipos (image, document, audio, template) sem quebrar.
 */
function buildPayload({ to, type, text, image, document, audio, template }) {
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type,
  };

  if (type === 'text' && text) {
    payload.text = { preview_url: false, body: text.body };
  } else if (type === 'image' && image) {
    payload.image = image;
  } else if (type === 'document' && document) {
    payload.document = document;
  } else if (type === 'audio' && audio) {
    payload.audio = audio;
  } else if (type === 'template' && template) {
    payload.template = template;
  }

  return payload;
}

/**
 * Envia uma mensagem via WhatsApp Cloud API.
 * Não contém regra de negócio — apenas a chamada HTTP.
 *
 * @param {object} params
 * @param {string} params.phoneNumberId  - Phone Number ID do tenant (Meta)
 * @param {string} params.to             - Número do destinatário em E.164 (com +)
 * @param {string} [params.type='text']  - Tipo da mensagem
 * @param {object} [params.text]         - { body: string }
 * @param {object} [params.image]        - (futuro)
 * @param {object} [params.document]     - (futuro)
 * @param {object} [params.audio]        - (futuro)
 * @param {object} [params.template]     - (futuro)
 * @param {string} [params.token]        - Token de acesso do tenant; cai para WHATSAPP_TOKEN se ausente
 * @returns {Promise<object>} Resposta bruta da API da Meta
 */
async function sendMessage({ phoneNumberId, to, type = 'text', text, image, document, audio, template, token }) {
  const accessToken = token || process.env.WHATSAPP_TOKEN;
  if (!accessToken) throw new Error('WHATSAPP_TOKEN não configurado');

  const payload = buildPayload({ to, type, text, image, document, audio, template });

  const response = await fetch(`${GRAPH_API_URL}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!response.ok) {
    const body = await response.text();
    const err = new Error(`Meta API ${response.status}: ${body}`);
    err.status = response.status;
    err.isMetaError = true;
    throw err;
  }

  return response.json();
}

module.exports = { sendMessage, buildPayload };

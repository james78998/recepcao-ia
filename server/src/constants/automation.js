// Eventos válidos para o Motor de Automações — espelha o enum AutomationEvent
// do Prisma. Mantido aqui como fonte única para os schemas de validação (Zod),
// evitando duplicar a lista de strings em cada rota. AUTOMATION_TEST fica de
// fora de propósito — é reservado ao endpoint de teste manual, nunca algo que
// um tenant possa assinar num webhook.
const AUTOMATION_EVENTS = [
  'LEAD_CREATED',
  'LEAD_UPDATED',
  'CONVERSATION_CREATED',
  'MESSAGE_RECEIVED',
  'MESSAGE_SENT',
  'APPOINTMENT_CREATED',
  'PAYMENT_PAID',
];

// Nome "com ponto" enviado no campo `event` do envelope e no header
// X-Automation-Event — mapeia cada valor do enum Prisma AutomationEvent.
const AUTOMATION_EVENT_NAMES = {
  LEAD_CREATED: 'lead.created',
  LEAD_UPDATED: 'lead.updated',
  CONVERSATION_CREATED: 'conversation.created',
  MESSAGE_RECEIVED: 'message.received',
  MESSAGE_SENT: 'message.sent',
  APPOINTMENT_CREATED: 'appointment.created',
  PAYMENT_PAID: 'payment.paid',
  AUTOMATION_TEST: 'automation.test',
};

// Versão do envelope de payload enviado aos webhooks:
// { apiVersion, event, tenantId, eventId, deliveryId, occurredAt, data }
const AUTOMATION_PAYLOAD_VERSION = 1;

// Limite de webhooks cadastrados por tenant — evita fan-out de abuso.
const MAX_WEBHOOKS_PER_TENANT = 20;

// Timeout por tentativa de entrega — mesmo padrão de integrations/meta/whatsappClient.js.
const AUTOMATION_DISPATCH_TIMEOUT_MS = 10_000;

// Atraso antes da 2ª e da 3ª tentativa (backoff). Total de tentativas = length + 1.
const AUTOMATION_RETRY_DELAYS_MS = [5_000, 30_000];

// Tamanho máximo do payload serializado (bytes) — acima disso a entrega falha
// sem tentar enviar, sem retry (é uma condição estática, não transitória).
const AUTOMATION_MAX_PAYLOAD_BYTES = 256 * 1024;

// User-Agent enviado em toda requisição de saída do Motor de Automações.
const AUTOMATION_USER_AGENT = 'RecepcaoIA-Automation/1.0';

module.exports = {
  AUTOMATION_EVENTS,
  AUTOMATION_EVENT_NAMES,
  AUTOMATION_PAYLOAD_VERSION,
  MAX_WEBHOOKS_PER_TENANT,
  AUTOMATION_DISPATCH_TIMEOUT_MS,
  AUTOMATION_RETRY_DELAYS_MS,
  AUTOMATION_MAX_PAYLOAD_BYTES,
  AUTOMATION_USER_AGENT,
};

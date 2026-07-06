// Rótulos em PT-BR dos eventos do Motor de Automações — espelha o enum
// AutomationEvent do backend (server/prisma/schema.prisma). AUTOMATION_TEST
// fica de fora de propósito: é reservado ao endpoint de teste manual, nunca
// algo que o tenant assina num webhook.
export const AUTOMATION_EVENT_LABELS = {
  LEAD_CREATED: "Lead criado",
  LEAD_UPDATED: "Lead atualizado",
  CONVERSATION_CREATED: "Conversa iniciada",
  MESSAGE_RECEIVED: "Mensagem recebida",
  MESSAGE_SENT: "Mensagem enviada",
  APPOINTMENT_CREATED: "Agendamento criado",
  PAYMENT_PAID: "Pagamento confirmado",
  USER_PASSWORD_RESET_REQUESTED: "Redefinição de senha solicitada",
  USER_PASSWORD_RESET_COMPLETED: "Redefinição de senha concluída",
};

export const AUTOMATION_EVENT_OPTIONS = Object.entries(AUTOMATION_EVENT_LABELS).map(
  ([value, label]) => ({ value, label })
);

// Exemplo estático do envelope de payload — só para facilitar o tenant a
// configurar/testar o parser do lado dele. Não reflete uma chamada real.
export const EXAMPLE_AUTOMATION_PAYLOAD = {
  apiVersion: 1,
  event: "lead.created",
  tenantId: "00000000-0000-0000-0000-000000000000",
  eventId: "11111111-1111-1111-1111-111111111111",
  deliveryId: "22222222-2222-2222-2222-222222222222",
  occurredAt: "2026-07-06T12:00:00.000Z",
  data: {
    id: "33333333-3333-3333-3333-333333333333",
    name: "Maria Souza",
    phone: "+5511999998888",
    status: "NOVO",
    source: "WHATSAPP",
  },
};

const messageRepository = require('../repositories/messageRepository');
const openAiClient = require('../integrations/openai/openAiClient');

const HISTORY_LIMIT = parseInt(process.env.OPENAI_HISTORY_LIMIT || '10', 10);

function buildSystemPrompt(tenant, lead) {
  const lines = [
    `Você é a recepcionista virtual da ${tenant.name}.`,
    `Sua função é acolher contatos recebidos via WhatsApp, responder dúvidas gerais,`,
    `identificar a necessidade do lead e oferecer agendamento quando pertinente.`,
    ``,
    `Sobre este contato:`,
    `- Nome: ${lead.name}`,
    `- Status no CRM: ${lead.status}`,
  ];
  if (lead.company) lines.push(`- Empresa: ${lead.company}`);
  if (lead.segment) lines.push(`- Segmento: ${lead.segment}`);
  lines.push(
    ``,
    `Regras obrigatórias:`,
    `1. Responda sempre em português brasileiro, de forma cordial e objetiva.`,
    `2. Máximo 3 parágrafos curtos. Prefira 1 ou 2 parágrafos.`,
    `3. Não invente preços, horários ou procedimentos específicos não fornecidos.`,
    `4. Se não souber responder, diga que vai verificar e retornar em breve.`,
    `5. Nunca afirme ser humano se questionado diretamente.`,
    `6. Nunca mencione dados de outros clientes.`,
    `7. Se o lead demonstrar interesse, sugira agendar uma consulta ou visita.`,
  );
  return lines.join('\n');
}

async function generateReply({ tenant, lead, conversation, inboundText }) {
  const isDryRun = process.env.OPENAI_DRY_RUN === 'true';
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  // Histórico recente (inclui o INBOUND recém-salvo como último item)
  const history = await messageRepository.getRecentByConversation(
    conversation.id,
    HISTORY_LIMIT + 1,
  );

  // Remove o último item (INBOUND recém-salvo) para não duplicá-lo no contexto
  const priorHistory = history.slice(0, -1);

  const chatMessages = [
    { role: 'system', content: buildSystemPrompt(tenant, lead) },
    ...priorHistory.map(m => ({
      role: m.direction === 'INBOUND' ? 'user' : 'assistant',
      content: m.content,
    })),
    { role: 'user', content: inboundText },
  ];

  let reply;
  if (isDryRun) {
    reply = '[DRY RUN] Resposta simulada da IA — OpenAI não foi chamada.';
  } else {
    reply = await openAiClient.complete({
      messages: chatMessages,
      model,
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '300', 10),
    });
  }

  await messageRepository.create({
    tenantId: tenant.id,
    conversationId: conversation.id,
    leadId: lead.id,
    direction: 'OUTBOUND',
    status: 'DRAFT',
    aiGenerated: true,
    content: reply,
    wamid: null,
    sentAt: null,
    metadata: {
      model: isDryRun ? 'dry-run' : model,
      generatedAt: new Date().toISOString(),
    },
  });

  console.info(`[ai] rascunho gerado — lead: ${lead.id}, conv: ${conversation.id}`);
}

module.exports = { generateReply, buildSystemPrompt };

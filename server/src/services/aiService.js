const messageRepository = require('../repositories/messageRepository');
const openAiClient = require('../integrations/openai/openAiClient');
const tenantAiConfigService = require('./tenantAiConfigService');

const HISTORY_LIMIT = parseInt(process.env.OPENAI_HISTORY_LIMIT || '10', 10);

// Regras fixas do produto — nunca editáveis pelo cliente. O "customPrompt" de
// cada tenant (TenantAiConfig) é sempre somado a estas regras, nunca as
// substitui. Exportado para exibição somente-leitura na tela de Configurações.
const FIXED_RULES = [
  'Responda sempre em português brasileiro, de forma cordial e objetiva.',
  'Máximo 3 parágrafos curtos. Prefira 1 ou 2 parágrafos.',
  'Não invente preços, horários ou procedimentos específicos não fornecidos.',
  'Se não souber responder, diga que vai verificar e retornar em breve.',
  'Nunca afirme ser humano se questionado diretamente.',
  'Nunca mencione dados de outros clientes.',
  'Se o lead demonstrar interesse, sugira agendar uma consulta ou visita.',
];

const BASE_PROMPT_TEXT = FIXED_RULES.map((rule, i) => `${i + 1}. ${rule}`).join('\n');

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
  lines.push(``, `Regras obrigatórias:`, BASE_PROMPT_TEXT);
  return lines.join('\n');
}

async function generateReply({ tenant, lead, conversation, inboundText }) {
  const isDryRun = process.env.OPENAI_DRY_RUN === 'true';
  const aiConfig = await tenantAiConfigService.getEffectiveConfig(tenant.id);

  const basePrompt = buildSystemPrompt(tenant, lead);
  const systemPrompt = aiConfig.customPrompt
    ? `${basePrompt}\n\nInstruções adicionais definidas pela clínica:\n${aiConfig.customPrompt}`
    : basePrompt;

  // Histórico recente (inclui o INBOUND recém-salvo como último item)
  const history = await messageRepository.getRecentByConversation(
    conversation.id,
    HISTORY_LIMIT + 1,
  );

  // Remove o último item (INBOUND recém-salvo) para não duplicá-lo no contexto
  const priorHistory = history.slice(0, -1);

  const chatMessages = [
    { role: 'system', content: systemPrompt },
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
      model: aiConfig.model,
      maxTokens: aiConfig.maxTokens,
      temperature: aiConfig.temperature,
      apiKey: aiConfig.apiKey,
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
      model: isDryRun ? 'dry-run' : aiConfig.model,
      generatedAt: new Date().toISOString(),
    },
  });

  console.info(`[ai] rascunho gerado — lead: ${lead.id}, conv: ${conversation.id}`);
}

module.exports = { generateReply, buildSystemPrompt, BASE_PROMPT_TEXT };

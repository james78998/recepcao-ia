// Mocks declarados antes de qualquer require para que Jest os intercepte
jest.mock('../repositories/tenantRepository');
jest.mock('../repositories/leadRepository');
jest.mock('../repositories/conversationRepository');
jest.mock('../repositories/messageRepository');
jest.mock('../services/aiService');

const tenantRepo = require('../repositories/tenantRepository');
const leadRepo   = require('../repositories/leadRepository');
const convRepo   = require('../repositories/conversationRepository');
const msgRepo    = require('../repositories/messageRepository');
const aiService  = require('../services/aiService');

const {
  processInbound,
  findOrCreateLead,
  findOrOpenConversation,
} = require('../services/whatsappService');

// ── Fixtures ─────────────────────────────────────────────────────────────────
const TENANT = {
  id: 'tenant-uuid-1',
  name: 'Clínica Teste',
  whatsappPhoneNumberId: 'phone-number-id-1',
  aiEnabled: true,
};
const LEAD = {
  id: 'lead-uuid-1',
  tenantId: 'tenant-uuid-1',
  phone: '5511999990001',
  phoneNormalized: '5511999990001',
  source: 'WHATSAPP',
  status: 'NOVO',
};
const CONV = {
  id: 'conv-uuid-1',
  tenantId: 'tenant-uuid-1',
  leadId: 'lead-uuid-1',
  channel: 'WHATSAPP',
  status: 'OPEN',
};
const MSG = { id: 'msg-uuid-1', wamid: 'wamid.test001' };

function makeEntry(wamid, from, text, phoneNumberId = TENANT.whatsappPhoneNumberId) {
  return {
    id: 'entry-id',
    changes: [{
      field: 'messages',
      value: {
        metadata: { phone_number_id: phoneNumberId },
        messages: [{
          id: wamid,
          from,
          type: 'text',
          timestamp: '1719400000',
          text: { body: text },
        }],
      },
    }],
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  // Padrão: generateReply resolve sem fazer nada (fire-and-forget mockado)
  aiService.generateReply.mockResolvedValue(undefined);
});

// ─────────────────────────────────────────────────────────────────────────────
describe('findOrCreateLead', () => {
  it('retorna lead existente sem chamar create', async () => {
    leadRepo.findByPhoneNormalized.mockResolvedValue(LEAD);

    const result = await findOrCreateLead('tenant-uuid-1', '5511999990001');

    expect(result).toBe(LEAD);
    expect(leadRepo.findByPhoneNormalized).toHaveBeenCalledWith('tenant-uuid-1', '5511999990001');
    expect(leadRepo.create).not.toHaveBeenCalled();
  });

  it('cria novo lead quando não encontrado pelo telefone', async () => {
    leadRepo.findByPhoneNormalized.mockResolvedValue(null);
    leadRepo.create.mockResolvedValue(LEAD);

    const result = await findOrCreateLead('tenant-uuid-1', '5511999990001');

    expect(result).toBe(LEAD);
    expect(leadRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'tenant-uuid-1',
        phone: '5511999990001',
        phoneNormalized: '5511999990001',
        source: 'WHATSAPP',
        status: 'NOVO',
      })
    );
  });

  it('usa o número normalizado como nome inicial do lead', async () => {
    leadRepo.findByPhoneNormalized.mockResolvedValue(null);
    leadRepo.create.mockResolvedValue(LEAD);

    await findOrCreateLead('tenant-uuid-1', '5511999990001');

    expect(leadRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: '5511999990001' })
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('findOrOpenConversation', () => {
  it('retorna conversa aberta existente sem criar nova', async () => {
    convRepo.findOpenByLead.mockResolvedValue(CONV);

    const result = await findOrOpenConversation('tenant-uuid-1', 'lead-uuid-1');

    expect(result).toBe(CONV);
    expect(convRepo.findOpenByLead).toHaveBeenCalledWith('tenant-uuid-1', 'lead-uuid-1');
    expect(convRepo.create).not.toHaveBeenCalled();
  });

  it('cria nova conversa quando não há nenhuma aberta', async () => {
    convRepo.findOpenByLead.mockResolvedValue(null);
    convRepo.create.mockResolvedValue(CONV);

    const result = await findOrOpenConversation('tenant-uuid-1', 'lead-uuid-1');

    expect(result).toBe(CONV);
    expect(convRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'tenant-uuid-1',
        leadId: 'lead-uuid-1',
        channel: 'WHATSAPP',
        status: 'OPEN',
      })
    );
  });

  it('garante que a nova conversa tem tenantId correto', async () => {
    convRepo.findOpenByLead.mockResolvedValue(null);
    convRepo.create.mockResolvedValue(CONV);

    await findOrOpenConversation('tenant-uuid-1', 'lead-uuid-1');

    expect(convRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: 'tenant-uuid-1' })
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('processInbound — idempotência por wamid', () => {
  it('não cria Message duplicada se o wamid já existe no banco', async () => {
    tenantRepo.findByWhatsappPhoneNumberId.mockResolvedValue(TENANT);
    leadRepo.findByPhoneNormalized.mockResolvedValue(LEAD);
    convRepo.findOpenByLead.mockResolvedValue(CONV);
    msgRepo.existsByWamid.mockResolvedValue(true); // já registrada

    await processInbound(makeEntry('wamid.duplicado', '5511999990001', 'Olá'));

    expect(msgRepo.create).not.toHaveBeenCalled();
  });

  it('registra a mensagem quando wamid não existe', async () => {
    tenantRepo.findByWhatsappPhoneNumberId.mockResolvedValue(TENANT);
    leadRepo.findByPhoneNormalized.mockResolvedValue(LEAD);
    convRepo.findOpenByLead.mockResolvedValue(CONV);
    msgRepo.existsByWamid.mockResolvedValue(false);
    msgRepo.create.mockResolvedValue(MSG);

    await processInbound(makeEntry('wamid.novo', '5511999990001', 'Primeira mensagem'));

    expect(msgRepo.create).toHaveBeenCalledTimes(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('processInbound — tenant não encontrado', () => {
  it('não processa e não lança erro quando phone_number_id não tem tenant', async () => {
    tenantRepo.findByWhatsappPhoneNumberId.mockResolvedValue(null);

    await expect(
      processInbound(makeEntry('wamid.sem_tenant', '5511999990001', 'teste', 'ID_DESCONHECIDO'))
    ).resolves.not.toThrow();

    expect(leadRepo.findByPhoneNormalized).not.toHaveBeenCalled();
    expect(msgRepo.create).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('processInbound — fluxo completo', () => {
  it('cria Lead, Conversation e Message para número desconhecido', async () => {
    tenantRepo.findByWhatsappPhoneNumberId.mockResolvedValue(TENANT);
    leadRepo.findByPhoneNormalized.mockResolvedValue(null);
    leadRepo.create.mockResolvedValue(LEAD);
    convRepo.findOpenByLead.mockResolvedValue(null);
    convRepo.create.mockResolvedValue(CONV);
    msgRepo.existsByWamid.mockResolvedValue(false);
    msgRepo.create.mockResolvedValue(MSG);

    await processInbound(makeEntry('wamid.fluxo_completo', '5511999990001', 'Olá, quero agendar'));

    expect(leadRepo.create).toHaveBeenCalledTimes(1);
    expect(convRepo.create).toHaveBeenCalledTimes(1);
    expect(msgRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: TENANT.id,
        leadId: LEAD.id,
        conversationId: CONV.id,
        direction: 'INBOUND',
        status: 'SENT',
        aiGenerated: false,
        wamid: 'wamid.fluxo_completo',
        content: 'Olá, quero agendar',
      })
    );
  });

  it('reutiliza Lead e Conversation existentes (segunda mensagem do mesmo número)', async () => {
    tenantRepo.findByWhatsappPhoneNumberId.mockResolvedValue(TENANT);
    leadRepo.findByPhoneNormalized.mockResolvedValue(LEAD);
    convRepo.findOpenByLead.mockResolvedValue(CONV);
    msgRepo.existsByWamid.mockResolvedValue(false);
    msgRepo.create.mockResolvedValue(MSG);

    await processInbound(makeEntry('wamid.segunda_msg', '5511999990001', 'Qual horário?'));

    expect(leadRepo.create).not.toHaveBeenCalled();
    expect(convRepo.create).not.toHaveBeenCalled();
    expect(msgRepo.create).toHaveBeenCalledTimes(1);
  });

  it('ignora mensagem com tipo não-texto sem lançar erro', async () => {
    tenantRepo.findByWhatsappPhoneNumberId.mockResolvedValue(TENANT);
    const entryAudio = {
      id: 'entry-audio',
      changes: [{
        field: 'messages',
        value: {
          metadata: { phone_number_id: TENANT.whatsappPhoneNumberId },
          messages: [{ id: 'wamid.audio', from: '5511999990001', type: 'audio', timestamp: '1719400000' }],
        },
      }],
    };

    await expect(processInbound(entryAudio)).resolves.not.toThrow();
    expect(msgRepo.create).not.toHaveBeenCalled();
  });

  it('ignora entry com field diferente de messages', async () => {
    tenantRepo.findByWhatsappPhoneNumberId.mockResolvedValue(TENANT);
    const entryStatus = {
      id: 'entry-status',
      changes: [{ field: 'message_template_status_update', value: {} }],
    };

    await processInbound(entryStatus);
    expect(leadRepo.findByPhoneNormalized).not.toHaveBeenCalled();
  });

  it('garante que Message tem tenantId correto (isolamento multi-tenant)', async () => {
    tenantRepo.findByWhatsappPhoneNumberId.mockResolvedValue(TENANT);
    leadRepo.findByPhoneNormalized.mockResolvedValue(LEAD);
    convRepo.findOpenByLead.mockResolvedValue(CONV);
    msgRepo.existsByWamid.mockResolvedValue(false);
    msgRepo.create.mockResolvedValue(MSG);

    await processInbound(makeEntry('wamid.tenant_check', '5511999990001', 'teste'));

    expect(msgRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: TENANT.id })
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('processInbound — integração com aiService', () => {
  it('chama aiService.generateReply após salvar INBOUND quando aiEnabled=true', async () => {
    tenantRepo.findByWhatsappPhoneNumberId.mockResolvedValue(TENANT); // aiEnabled: true
    leadRepo.findByPhoneNormalized.mockResolvedValue(LEAD);
    convRepo.findOpenByLead.mockResolvedValue(CONV);
    msgRepo.existsByWamid.mockResolvedValue(false);
    msgRepo.create.mockResolvedValue(MSG);

    await processInbound(makeEntry('wamid.ai_enabled', '5511999990001', 'quero saber mais'));

    expect(aiService.generateReply).toHaveBeenCalledWith(
      expect.objectContaining({
        tenant: expect.objectContaining({ id: TENANT.id }),
        lead: LEAD,
        conversation: CONV,
        inboundText: 'quero saber mais',
      })
    );
  });

  it('não chama aiService.generateReply quando tenant.aiEnabled=false', async () => {
    const tenantDisabled = { ...TENANT, aiEnabled: false };
    tenantRepo.findByWhatsappPhoneNumberId.mockResolvedValue(tenantDisabled);
    leadRepo.findByPhoneNormalized.mockResolvedValue(LEAD);
    convRepo.findOpenByLead.mockResolvedValue(CONV);
    msgRepo.existsByWamid.mockResolvedValue(false);
    msgRepo.create.mockResolvedValue(MSG);

    await processInbound(makeEntry('wamid.ai_disabled', '5511999990001', 'olá'));

    expect(aiService.generateReply).not.toHaveBeenCalled();
    expect(msgRepo.create).toHaveBeenCalledTimes(1); // apenas o INBOUND
  });

  it('falha da IA não impede que o INBOUND seja salvo', async () => {
    tenantRepo.findByWhatsappPhoneNumberId.mockResolvedValue(TENANT);
    leadRepo.findByPhoneNormalized.mockResolvedValue(LEAD);
    convRepo.findOpenByLead.mockResolvedValue(CONV);
    msgRepo.existsByWamid.mockResolvedValue(false);
    msgRepo.create.mockResolvedValue(MSG);
    aiService.generateReply.mockRejectedValue(new Error('OpenAI indisponível'));

    // processInbound não deve lançar erro mesmo com falha da IA
    await expect(
      processInbound(makeEntry('wamid.ai_error', '5511999990001', 'olá'))
    ).resolves.not.toThrow();

    // INBOUND salvo com sucesso apesar do erro da IA
    expect(msgRepo.create).toHaveBeenCalledTimes(1);
    expect(msgRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ direction: 'INBOUND' })
    );
  });
});

jest.mock('../repositories/leadRepository');
jest.mock('../repositories/messageRepository');
jest.mock('../utils/domainEvents');

const leadRepository = require('../repositories/leadRepository');
const messageRepository = require('../repositories/messageRepository');
const domainEvents = require('../utils/domainEvents');
const { getMessages, create, update } = require('../services/leadsService');

const TENANT_ID = 'tenant-1';
const LEAD_ID = 'lead-1';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('leadsService.getMessages', () => {
  it('retorna as mensagens reais do lead quando ele pertence ao tenant', async () => {
    leadRepository.findById.mockResolvedValue({ id: LEAD_ID, tenantId: TENANT_ID, name: 'João' });
    messageRepository.findByLeadId.mockResolvedValue([
      { id: 'msg-1', direction: 'INBOUND', content: 'Olá' },
      { id: 'msg-2', direction: 'OUTBOUND', content: 'Oi, tudo bem?' },
    ]);

    const result = await getMessages(LEAD_ID, TENANT_ID);

    expect(messageRepository.findByLeadId).toHaveBeenCalledWith(LEAD_ID, TENANT_ID);
    expect(result).toHaveLength(2);
  });

  it('retorna array vazio quando o lead nunca teve mensagens', async () => {
    leadRepository.findById.mockResolvedValue({ id: LEAD_ID, tenantId: TENANT_ID, name: 'João' });
    messageRepository.findByLeadId.mockResolvedValue([]);

    const result = await getMessages(LEAD_ID, TENANT_ID);

    expect(result).toEqual([]);
  });

  it('lança 404 quando o lead não existe ou não é do tenant', async () => {
    leadRepository.findById.mockResolvedValue(null);

    await expect(getMessages('id-inexistente', TENANT_ID)).rejects.toMatchObject({ status: 404 });
    expect(messageRepository.findByLeadId).not.toHaveBeenCalled();
  });
});

describe('leadsService.create — emissão de evento de domínio', () => {
  it('emite lead.created com o lead recém-criado', async () => {
    const novoLead = { id: 'lead-novo', tenantId: TENANT_ID, name: 'Maria', phone: '5511999990000' };
    leadRepository.create.mockResolvedValue(novoLead);

    await create(TENANT_ID, { name: 'Maria', phone: '5511999990000' });

    expect(domainEvents.emit).toHaveBeenCalledWith('lead.created', { tenantId: TENANT_ID, data: novoLead });
  });
});

describe('leadsService.update — emissão de evento de domínio', () => {
  it('emite lead.updated com o lead atualizado', async () => {
    leadRepository.findById.mockResolvedValue({ id: LEAD_ID, tenantId: TENANT_ID });
    const leadAtualizado = { id: LEAD_ID, tenantId: TENANT_ID, name: 'Maria Atualizada' };
    leadRepository.update.mockResolvedValue(leadAtualizado);

    await update(LEAD_ID, TENANT_ID, { name: 'Maria Atualizada' });

    expect(domainEvents.emit).toHaveBeenCalledWith('lead.updated', { tenantId: TENANT_ID, data: leadAtualizado });
  });
});

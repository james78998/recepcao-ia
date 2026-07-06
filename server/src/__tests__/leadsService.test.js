jest.mock('../repositories/leadRepository');
jest.mock('../utils/domainEvents');

const leadRepository = require('../repositories/leadRepository');
const domainEvents = require('../utils/domainEvents');
const { create, update } = require('../services/leadsService');

const TENANT_ID = 'tenant-1';
const LEAD_ID = 'lead-1';

beforeEach(() => {
  jest.clearAllMocks();
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

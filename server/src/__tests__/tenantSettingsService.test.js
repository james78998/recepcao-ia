jest.mock('../repositories/tenantRepository');
jest.mock('../services/tenantAiConfigService');
jest.mock('../services/tenantWhatsappConfigService');
jest.mock('../services/tenantScheduleConfigService');
jest.mock('../services/tenantBusinessHourService');
jest.mock('../services/tenantIntegrationService');
jest.mock('../services/aiService', () => ({ BASE_PROMPT_TEXT: '1. Regra fixa de exemplo.' }));

const tenantRepository = require('../repositories/tenantRepository');
const tenantAiConfigService = require('../services/tenantAiConfigService');
const tenantWhatsappConfigService = require('../services/tenantWhatsappConfigService');
const tenantScheduleConfigService = require('../services/tenantScheduleConfigService');
const tenantBusinessHourService = require('../services/tenantBusinessHourService');
const tenantIntegrationService = require('../services/tenantIntegrationService');
const { getMySettings } = require('../services/tenantSettingsService');

const TENANT_ID = 'tenant-1';

beforeEach(() => {
  jest.clearAllMocks();
  tenantRepository.findByIdProfile.mockResolvedValue({
    id: TENANT_ID,
    name: 'Clínica Teste',
    whatsappPhoneNumberId: 'phone-id-123',
  });
  tenantAiConfigService.getMasked.mockResolvedValue({ aiEnabled: true, openAiApiKeyConfigured: false });
  tenantWhatsappConfigService.getMasked.mockResolvedValue({ connectionStatus: 'NOT_CONNECTED' });
  tenantScheduleConfigService.getOrDefault.mockResolvedValue({ timezone: 'America/Sao_Paulo' });
  tenantBusinessHourService.getAll.mockResolvedValue([]);
  tenantIntegrationService.list.mockResolvedValue([]);
});

describe('tenantSettingsService.getMySettings', () => {
  it('lança 404 quando o tenant não existe', async () => {
    tenantRepository.findByIdProfile.mockResolvedValue(null);

    await expect(getMySettings(TENANT_ID)).rejects.toMatchObject({ status: 404 });
  });

  it('agrega perfil, IA, WhatsApp, agenda, horários e integrações', async () => {
    const result = await getMySettings(TENANT_ID);

    expect(result.profile.name).toBe('Clínica Teste');
    expect(result.aiConfig.aiEnabled).toBe(true);
    expect(result.whatsappConfig.connectionStatus).toBe('NOT_CONNECTED');
    expect(result.scheduleConfig.timezone).toBe('America/Sao_Paulo');
    expect(result.businessHours).toEqual([]);
    expect(result.integrations).toEqual([]);
  });

  it('inclui o basePrompt fixo (somente leitura) no aiConfig', async () => {
    const result = await getMySettings(TENANT_ID);
    expect(result.aiConfig.basePrompt).toBe('1. Regra fixa de exemplo.');
  });

  it('inclui o whatsappPhoneNumberId do tenant no whatsappConfig', async () => {
    const result = await getMySettings(TENANT_ID);
    expect(result.whatsappConfig.whatsappPhoneNumberId).toBe('phone-id-123');
  });
});

const tenantRepository = require('../repositories/tenantRepository');
const tenantAiConfigService = require('./tenantAiConfigService');
const tenantWhatsappConfigService = require('./tenantWhatsappConfigService');
const tenantScheduleConfigService = require('./tenantScheduleConfigService');
const tenantBusinessHourService = require('./tenantBusinessHourService');
const tenantIntegrationService = require('./tenantIntegrationService');
const { BASE_PROMPT_TEXT } = require('./aiService');
const AppError = require('../utils/AppError');

async function getMySettings(tenantId) {
  const profile = await tenantRepository.findByIdProfile(tenantId);
  if (!profile) {
    throw new AppError('Tenant não encontrado.', 404);
  }

  const [aiConfig, whatsappConfig, scheduleConfig, businessHours, integrations] = await Promise.all([
    tenantAiConfigService.getMasked(tenantId),
    tenantWhatsappConfigService.getMasked(tenantId),
    tenantScheduleConfigService.getOrDefault(tenantId),
    tenantBusinessHourService.getAll(tenantId),
    tenantIntegrationService.list(tenantId),
  ]);

  return {
    profile,
    aiConfig: { ...aiConfig, basePrompt: BASE_PROMPT_TEXT },
    whatsappConfig: { ...whatsappConfig, whatsappPhoneNumberId: profile.whatsappPhoneNumberId },
    scheduleConfig,
    businessHours,
    integrations,
  };
}

module.exports = { getMySettings };

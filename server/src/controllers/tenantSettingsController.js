const tenantSettingsService = require('../services/tenantSettingsService');
const tenantProfileService = require('../services/tenantProfileService');
const tenantAiConfigService = require('../services/tenantAiConfigService');
const tenantWhatsappConfigService = require('../services/tenantWhatsappConfigService');
const tenantScheduleConfigService = require('../services/tenantScheduleConfigService');
const tenantBusinessHourService = require('../services/tenantBusinessHourService');
const tenantIntegrationService = require('../services/tenantIntegrationService');

async function getMe(req, res, next) {
  try {
    const settings = await tenantSettingsService.getMySettings(req.user.tenantId);
    res.json(settings);
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const profile = await tenantProfileService.update(req.user.tenantId, req.user.id, req.body);
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

async function updateAiConfig(req, res, next) {
  try {
    const aiConfig = await tenantAiConfigService.update(req.user.tenantId, req.user.id, req.body);
    res.json(aiConfig);
  } catch (err) {
    next(err);
  }
}

async function updateWhatsappConfig(req, res, next) {
  try {
    const whatsappConfig = await tenantWhatsappConfigService.update(req.user.tenantId, req.user.id, req.body);
    res.json(whatsappConfig);
  } catch (err) {
    next(err);
  }
}

async function updateSchedule(req, res, next) {
  try {
    const scheduleConfig = await tenantScheduleConfigService.update(req.user.tenantId, req.user.id, req.body);
    res.json(scheduleConfig);
  } catch (err) {
    next(err);
  }
}

async function updateBusinessHours(req, res, next) {
  try {
    const businessHours = await tenantBusinessHourService.updateAll(req.user.tenantId, req.user.id, req.body.days);
    res.json(businessHours);
  } catch (err) {
    next(err);
  }
}

async function listIntegrations(req, res, next) {
  try {
    const integrations = await tenantIntegrationService.list(req.user.tenantId);
    res.json({ data: integrations });
  } catch (err) {
    next(err);
  }
}

async function upsertIntegration(req, res, next) {
  try {
    const integration = await tenantIntegrationService.connect(
      req.user.tenantId,
      req.user.id,
      req.params.provider,
      req.body
    );
    res.json(integration);
  } catch (err) {
    next(err);
  }
}

async function removeIntegration(req, res, next) {
  try {
    const integration = await tenantIntegrationService.disconnect(req.user.tenantId, req.user.id, req.params.provider);
    res.json(integration);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMe,
  updateProfile,
  updateAiConfig,
  updateWhatsappConfig,
  updateSchedule,
  updateBusinessHours,
  listIntegrations,
  upsertIntegration,
  removeIntegration,
};

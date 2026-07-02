const { Router } = require('express');
const { z } = require('zod');
const validate = require('../middlewares/validate');
const authMiddleware = require('../middlewares/auth');
const requireRole = require('../middlewares/requireRole');
const tenantSettingsController = require('../controllers/tenantSettingsController');

const router = Router();

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const timeField = z.string().regex(TIME_REGEX, 'Horário inválido, use o formato HH:MM.').nullable().optional();

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres.').optional(),
  email: z.string().email('E-mail inválido.').optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  logoPath: z.string().nullable().optional(),
});

const updateAiConfigSchema = z.object({
  aiEnabled: z.boolean().optional(),
  openAiApiKey: z.string().min(1).optional(),
  openAiModel: z.string().min(1).optional(),
  customPrompt: z.string().max(4000, 'Prompt customizado deve ter no máximo 4000 caracteres.').nullable().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().min(50).max(2000).optional(),
});

const updateWhatsappConfigSchema = z.object({
  accessToken: z.string().min(1).optional(),
  businessAccountId: z.string().nullable().optional(),
  displayName: z.string().nullable().optional(),
});

const updateScheduleSchema = z.object({
  timezone: z.string().optional(),
  defaultAppointmentDurationMin: z.number().int().min(5).max(480).optional(),
  bufferBetweenAppointmentsMin: z.number().int().min(0).max(240).optional(),
});

const dayOfWeekEnum = z.enum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']);

const businessHourDaySchema = z.object({
  dayOfWeek: dayOfWeekEnum,
  enabled: z.boolean(),
  startTime: timeField,
  endTime: timeField,
  lunchStart: timeField,
  lunchEnd: timeField,
});

const updateBusinessHoursSchema = z.object({
  days: z.array(businessHourDaySchema).length(7, 'Envie os 7 dias da semana.'),
});

const integrationProviderEnum = z.enum(['GOOGLE_CALENDAR', 'DENTAL_OFFICE']);

const upsertIntegrationSchema = z.object({
  credentials: z.record(z.string(), z.any()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  providerVersion: z.string().optional(),
});

function validateProviderParam(req, res, next) {
  const result = integrationProviderEnum.safeParse(req.params.provider);
  if (!result.success) {
    return res.status(400).json({ error: true, message: 'Provedor de integração inválido.' });
  }
  next();
}

router.use(authMiddleware, requireRole('ADMIN'));

router.get('/', tenantSettingsController.getMe);
router.patch('/', validate(updateProfileSchema), tenantSettingsController.updateProfile);
router.patch('/ai-config', validate(updateAiConfigSchema), tenantSettingsController.updateAiConfig);
router.patch('/whatsapp-config', validate(updateWhatsappConfigSchema), tenantSettingsController.updateWhatsappConfig);
router.patch('/schedule', validate(updateScheduleSchema), tenantSettingsController.updateSchedule);
router.patch('/business-hours', validate(updateBusinessHoursSchema), tenantSettingsController.updateBusinessHours);
router.get('/integrations', tenantSettingsController.listIntegrations);
router.patch(
  '/integrations/:provider',
  validateProviderParam,
  validate(upsertIntegrationSchema),
  tenantSettingsController.upsertIntegration
);
router.delete('/integrations/:provider', validateProviderParam, tenantSettingsController.removeIntegration);

module.exports = router;

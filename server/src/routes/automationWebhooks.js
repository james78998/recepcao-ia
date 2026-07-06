const { Router } = require('express');
const { z } = require('zod');
const validate = require('../middlewares/validate');
const authMiddleware = require('../middlewares/auth');
const requireRole = require('../middlewares/requireRole');
const automationWebhooksController = require('../controllers/automationWebhooksController');
const { AUTOMATION_EVENTS } = require('../constants/automation');

const router = Router();

const automationEventEnum = z.enum(AUTOMATION_EVENTS);

const createAutomationWebhookSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres.').max(120, 'Nome deve ter no máximo 120 caracteres.'),
  url: z.string().url('URL inválida.'),
  events: z.array(automationEventEnum).min(1, 'Selecione ao menos um evento.'),
  enabled: z.boolean().optional().default(true),
});

const updateAutomationWebhookSchema = createAutomationWebhookSchema.partial();

router.use(authMiddleware, requireRole('ADMIN'));

router.get('/', automationWebhooksController.list);
// IMPORTANTE: /stats precisa vir antes de /:id, senão "stats" seria
// interpretado como um :id e cairia no handler errado (getById).
router.get('/stats', automationWebhooksController.getStats);
router.get('/:id', automationWebhooksController.getById);
router.post('/', validate(createAutomationWebhookSchema), automationWebhooksController.create);
router.put('/:id', validate(updateAutomationWebhookSchema), automationWebhooksController.update);
router.delete('/:id', automationWebhooksController.remove);
router.post('/:id/regenerate-secret', automationWebhooksController.regenerateSecret);
router.post('/:id/test', automationWebhooksController.test);
router.get('/:id/logs', automationWebhooksController.getLogs);

module.exports = router;

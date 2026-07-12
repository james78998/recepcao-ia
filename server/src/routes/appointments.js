const { Router } = require('express');
const { z } = require('zod');
const validate = require('../middlewares/validate');
const authMiddleware = require('../middlewares/auth');
const requireModule = require('../middlewares/requireModule');
const appointmentsController = require('../controllers/appointmentsController');

const router = Router();

const statusEnum = z.enum(['SCHEDULED', 'CONFIRMED', 'CANCELED', 'COMPLETED']);

const createSchema = z.object({
  title: z.string().min(2, 'Título deve ter pelo menos 2 caracteres.'),
  clientName: z.string().optional().nullable(),
  leadId: z.string().uuid('Lead inválido.').optional().nullable(),
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  startAt: z.coerce.date({ invalid_type_error: 'Data/hora de início inválida.' }),
  endAt: z.coerce.date({ invalid_type_error: 'Data/hora de término inválida.' }).optional(),
  status: statusEnum.optional().default('SCHEDULED'),
});

const updateSchema = createSchema.partial();

router.use(authMiddleware, requireModule('AGENDA'));

router.get('/', appointmentsController.list);
router.get('/:id', appointmentsController.getById);
router.post('/', validate(createSchema), appointmentsController.create);
router.put('/:id', validate(updateSchema), appointmentsController.update);
router.delete('/:id', appointmentsController.remove);

module.exports = router;

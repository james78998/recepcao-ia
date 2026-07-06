const { Router } = require('express');
const { z } = require('zod');
const validate = require('../middlewares/validate');
const authMiddleware = require('../middlewares/auth');
const leadsController = require('../controllers/leadsController');

const router = Router();

const statusEnum = z.enum(['NOVO', 'DEMONSTRACAO', 'PROPOSTA', 'CLIENTE_ATIVO', 'PERDIDO']);

const createSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres.'),
  phone: z.string().min(8, 'Telefone deve ter pelo menos 8 caracteres.'),
  email: z.string().email('E-mail inválido.').optional().nullable(),
  company: z.string().optional().nullable(),
  segment: z.string().optional().nullable(),
  status: statusEnum.optional().default('NOVO'),
  source: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const updateSchema = createSchema.partial();

router.use(authMiddleware);

router.get('/', leadsController.list);
router.get('/:id', leadsController.getById);
router.get('/:id/messages', leadsController.getMessages);
router.post('/', validate(createSchema), leadsController.create);
router.put('/:id', validate(updateSchema), leadsController.update);
router.delete('/:id', leadsController.remove);

module.exports = router;

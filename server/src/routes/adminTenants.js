const { Router } = require('express');
const { z } = require('zod');
const validate = require('../middlewares/validate');
const adminAuthMiddleware = require('../middlewares/adminAuth');
const adminTenantController = require('../controllers/adminTenantController');

const router = Router();

const createSchema = z.object({
  tenantName: z.string().min(2, 'Nome da empresa deve ter pelo menos 2 caracteres.'),
  tenantEmail: z.string().email('E-mail da empresa inválido.'),
  userName: z.string().min(2, 'Nome do usuário deve ter pelo menos 2 caracteres.'),
  userEmail: z.string().email('E-mail do usuário inválido.'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres.'),
});

router.use(adminAuthMiddleware);

router.get('/', adminTenantController.list);
router.get('/:id', adminTenantController.getById);
router.post('/', validate(createSchema), adminTenantController.create);

module.exports = router;

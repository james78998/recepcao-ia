const { Router } = require('express');
const { z } = require('zod');
const validate = require('../middlewares/validate');
const adminAuthMiddleware = require('../middlewares/adminAuth');
const adminTenantController = require('../controllers/adminTenantController');
const adminTenantModuleController = require('../controllers/adminTenantModuleController');
const { MODULE_KEYS } = require('../constants/modules');

const router = Router();

const createSchema = z.object({
  tenantName: z.string().min(2, 'Nome da empresa deve ter pelo menos 2 caracteres.'),
  tenantEmail: z.string().email('E-mail da empresa inválido.'),
  userName: z.string().min(2, 'Nome do usuário deve ter pelo menos 2 caracteres.'),
  userEmail: z.string().email('E-mail do usuário inválido.'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres.'),
});

const moduleKeyEnum = z.enum(MODULE_KEYS);

const updateModuleSchema = z.object({
  enabled: z.boolean(),
});

const bulkUpdateModulesSchema = z.object({
  modules: z.array(
    z.object({
      key: moduleKeyEnum,
      enabled: z.boolean(),
    })
  ).min(1, 'Informe ao menos um módulo.'),
});

router.use(adminAuthMiddleware);

router.get('/', adminTenantController.list);
router.get('/:id', adminTenantController.getById);
router.post('/', validate(createSchema), adminTenantController.create);

router.get('/:id/modules', adminTenantModuleController.list);
router.put('/:id/modules', validate(bulkUpdateModulesSchema), adminTenantModuleController.bulkUpdate);
router.patch('/:id/modules/:moduleKey', validate(updateModuleSchema), adminTenantModuleController.update);

module.exports = router;

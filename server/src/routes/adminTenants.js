const { Router } = require('express');
const adminAuthMiddleware = require('../middlewares/adminAuth');
const adminTenantController = require('../controllers/adminTenantController');

const router = Router();

router.use(adminAuthMiddleware);

router.get('/', adminTenantController.list);
router.get('/:id', adminTenantController.getById);

module.exports = router;

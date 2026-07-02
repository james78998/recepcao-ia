const { Router } = require('express');
const authRoutes          = require('./auth');
const leadsRoutes         = require('./leads');
const webhooksRoutes      = require('./webhooks');
const conversationsRoutes = require('./conversations');
const messagesRoutes      = require('./messages');
const adminAuthRoutes     = require('./adminAuth');
const adminTenantsRoutes  = require('./adminTenants');
const tenantSettingsRoutes = require('./tenantSettings');

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth',          authRoutes);
router.use('/leads',         leadsRoutes);
router.use('/webhooks',      webhooksRoutes);
router.use('/conversations', conversationsRoutes);
router.use('/messages',      messagesRoutes);
router.use('/admin/auth',    adminAuthRoutes);
router.use('/admin/tenants', adminTenantsRoutes);
router.use('/tenants/me',    tenantSettingsRoutes);

module.exports = router;

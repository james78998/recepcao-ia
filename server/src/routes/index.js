const { Router } = require('express');
const authRoutes          = require('./auth');
const leadsRoutes         = require('./leads');
const webhooksRoutes      = require('./webhooks');
const conversationsRoutes = require('./conversations');
const messagesRoutes      = require('./messages');
const adminAuthRoutes     = require('./adminAuth');
const adminTenantsRoutes  = require('./adminTenants');
const tenantSettingsRoutes = require('./tenantSettings');
const automationWebhooksRoutes = require('./automationWebhooks');
const appointmentsRoutes = require('./appointments');

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
router.use('/tenants/me/automations/webhooks', automationWebhooksRoutes);
router.use('/appointments', appointmentsRoutes);

module.exports = router;

const { Router } = require('express');
const authRoutes          = require('./auth');
const leadsRoutes         = require('./leads');
const webhooksRoutes      = require('./webhooks');
const conversationsRoutes = require('./conversations');
const messagesRoutes      = require('./messages');

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth',          authRoutes);
router.use('/leads',         leadsRoutes);
router.use('/webhooks',      webhooksRoutes);
router.use('/conversations', conversationsRoutes);
router.use('/messages',      messagesRoutes);

module.exports = router;

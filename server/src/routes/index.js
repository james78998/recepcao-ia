const { Router } = require('express');
const authRoutes    = require('./auth');
const leadsRoutes   = require('./leads');
const webhooksRoutes = require('./webhooks');

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth',     authRoutes);
router.use('/leads',    leadsRoutes);
router.use('/webhooks', webhooksRoutes);

module.exports = router;

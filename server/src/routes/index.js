const { Router } = require('express');
const authRoutes = require('./auth');

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);

module.exports = router;

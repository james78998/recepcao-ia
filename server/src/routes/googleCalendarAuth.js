const { Router } = require('express');
const authMiddleware = require('../middlewares/auth');
const requireRole = require('../middlewares/requireRole');
const requireModule = require('../middlewares/requireModule');
const googleCalendarAuthController = require('../controllers/googleCalendarAuthController');

const router = Router();

// Callback é o alvo do redirect do navegador vindo do Google — sem
// Authorization header, por isso fica fora de authMiddleware.
router.get('/callback', googleCalendarAuthController.callback);

router.get(
  '/auth-url',
  authMiddleware,
  requireRole('ADMIN'),
  requireModule('GOOGLE_CALENDAR'),
  googleCalendarAuthController.getAuthUrl
);

module.exports = router;

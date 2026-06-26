const { Router } = require('express');
const webhookController = require('../controllers/webhookController');

const router = Router();

// Rotas públicas — sem authMiddleware.
// Segurança via WHATSAPP_VERIFY_TOKEN (GET) e HMAC-SHA256 (POST).
router.get('/whatsapp', webhookController.verify);
router.post('/whatsapp', webhookController.receive);

module.exports = router;

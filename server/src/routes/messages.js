const { Router } = require('express');
const authMiddleware      = require('../middlewares/auth');
const messagesController  = require('../controllers/messagesController');

const router = Router();

router.use(authMiddleware);

router.post('/:id/send', messagesController.send);

module.exports = router;

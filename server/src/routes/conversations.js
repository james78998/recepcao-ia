const { Router } = require('express');
const authMiddleware = require('../middlewares/auth');
const conversationsController = require('../controllers/conversationsController');

const router = Router();

router.use(authMiddleware);

router.get('/', conversationsController.list);
router.get('/:id/messages', conversationsController.getMessages);

module.exports = router;

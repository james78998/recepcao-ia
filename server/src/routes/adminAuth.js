const { Router } = require('express');
const { z } = require('zod');
const validate = require('../middlewares/validate');
const adminAuthController = require('../controllers/adminAuthController');

const router = Router();

const loginSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(1, 'Senha obrigatória.'),
});

router.post('/login', validate(loginSchema), adminAuthController.login);

module.exports = router;

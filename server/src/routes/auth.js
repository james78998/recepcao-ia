const { Router } = require('express');
const { z } = require('zod');
const validate = require('../middlewares/validate');
const authController = require('../controllers/authController');

const router = Router();

const registerSchema = z.object({
  tenantName: z.string().min(2, 'Nome da empresa deve ter pelo menos 2 caracteres.'),
  tenantEmail: z.string().email('E-mail da empresa inválido.'),
  userName: z.string().min(2, 'Nome do usuário deve ter pelo menos 2 caracteres.'),
  userEmail: z.string().email('E-mail do usuário inválido.'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres.'),
});

const loginSchema = z.object({
  email: z.string().email('E-mail inválido.'),
  password: z.string().min(1, 'Senha obrigatória.'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token obrigatório.'),
});

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshSchema), authController.refresh);

module.exports = router;

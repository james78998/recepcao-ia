const { Router } = require('express');
const { z } = require('zod');
const validate = require('../middlewares/validate');
const authMiddleware = require('../middlewares/auth');
const createRateLimiter = require('../middlewares/rateLimit');
const authController = require('../controllers/authController');

const router = Router();

const forgotPasswordLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Muitas tentativas. Tente novamente mais tarde.',
});

const resetPasswordLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Muitas tentativas. Tente novamente mais tarde.',
});

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

const updateMeSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres.').optional(),
  email: z.string().email('E-mail inválido.').optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual obrigatória.'),
  newPassword: z.string().min(8, 'Nova senha deve ter pelo menos 8 caracteres.'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('E-mail inválido.'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token obrigatório.'),
  newPassword: z.string().min(8, 'Nova senha deve ter pelo menos 8 caracteres.'),
});

router.get('/me', authMiddleware, authController.me);
router.patch('/me', authMiddleware, validate(updateMeSchema), authController.updateMe);
router.post('/change-password', authMiddleware, validate(changePasswordSchema), authController.changePassword);
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/forgot-password', forgotPasswordLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', resetPasswordLimiter, validate(resetPasswordSchema), authController.resetPassword);

module.exports = router;

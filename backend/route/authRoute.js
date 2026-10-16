import express from 'express';
import {
  Register,
  Login,
  getProfile,
  ForgotPassword,
  verifyResetToken,
  ResetPassword,
  updatePassword,
} from '../controller/AuthController.js';
import authenticate from '../middleware/Auth.js';
import { validateBody } from '../validation/auth/validateBody.js';
import { registerSchema } from '../validation/auth/registerValidation.js';
import { loginSchema } from '../validation/auth/loginValidation.js';
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  updatePasswordSchema,
} from '../validation/auth/passwordValidation.js';

const router = express.Router();

router.post('/register', validateBody(registerSchema), Register);
router.post('/login', validateBody(loginSchema), Login);
router.get('/profile', authenticate, getProfile);
router.post('/forgot-password', validateBody(forgotPasswordSchema), ForgotPassword);
router.get('/verify-reset-token/:token', verifyResetToken);
router.post('/reset-password', validateBody(resetPasswordSchema), ResetPassword);
router.patch('/update-password', authenticate, validateBody(updatePasswordSchema), updatePassword);

export default router;
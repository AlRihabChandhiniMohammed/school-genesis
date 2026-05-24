import { Router } from 'express';
import { register, login, logout, refreshToken, forgotPassword, resetPassword, getMe } from '../controllers/authController.js';
import { registerValidation, loginValidation } from '../middleware/validate.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', auth, logout);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/me', auth, getMe);

export default router;

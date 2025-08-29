import { Router } from 'express';
import { body } from 'express-validator';
import { authController } from '../controllers/authController';
import { validate } from '../middleware/validation';
import { authRateLimiter } from '../middleware/rateLimiter';
import { isAuthenticated } from '../middleware/auth';

const router = Router();

router.post(
  '/register',
  authRateLimiter,
  validate([
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('firstName').notEmpty().trim(),
    body('lastName').notEmpty().trim(),
  ]),
  authController.register
);

router.post(
  '/login',
  authRateLimiter,
  validate([
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ]),
  authController.login
);

router.post('/logout', isAuthenticated, authController.logout);

router.get('/me', isAuthenticated, authController.getCurrentUser);

router.post(
  '/forgot-password',
  authRateLimiter,
  validate([body('email').isEmail().normalizeEmail()]),
  authController.forgotPassword
);

router.post(
  '/reset-password',
  authRateLimiter,
  validate([
    body('token').notEmpty(),
    body('password').isLength({ min: 8 }),
  ]),
  authController.resetPassword
);

router.post(
  '/verify-email',
  validate([body('token').notEmpty()]),
  authController.verifyEmail
);

router.post('/resend-verification', isAuthenticated, authController.resendVerification);

export default router;
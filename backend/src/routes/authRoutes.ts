import { Router } from 'express';
import { body } from 'express-validator';
import { authController } from '../controllers/authController';
import { validate } from '../middleware/validation';
import { authRateLimiter } from '../middleware/rateLimiter';
import { isAuthenticated } from '../middleware/auth';
import passport from '../config/passport';
import { checkSocialProviders } from '../utils/socialProviders';

const router = Router();

router.post(
  '/register',
  authRateLimiter,
  validate([
    body('email').isEmail().toLowerCase().trim(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('firstName').notEmpty().trim(),
    body('lastName').notEmpty().trim(),
  ]),
  authController.register
);

router.post(
  '/login',
  authRateLimiter,
  validate([body('email').isEmail().toLowerCase().trim(), body('password').notEmpty()]),
  authController.login
);

router.post('/logout', isAuthenticated as any, authController.logout);

router.get('/me', isAuthenticated as any, authController.getCurrentUser);

router.post(
  '/forgot-password',
  authRateLimiter,
  validate([body('email').isEmail().toLowerCase().trim()]),
  authController.forgotPassword
);

router.post(
  '/reset-password',
  authRateLimiter,
  validate([body('token').notEmpty(), body('password').isLength({ min: 8 })]),
  authController.resetPassword
);

router.post('/verify-email', validate([body('token').notEmpty()]), authController.verifyEmail);

router.post('/resend-verification', isAuthenticated as any, authController.resendVerification);

// Social Providers Status
router.get('/providers', (_req, res) => {
  const providers = checkSocialProviders();
  res.json({ providers });
});

// Apple Authentication Routes
router.get('/apple', passport.authenticate('apple'));

router.post('/apple/callback', 
  (req, res, next) => {
    // Apple sends POST requests to callback
    passport.authenticate('apple', { 
      failureRedirect: `${process.env.FRONTEND_URL}/login?error=apple_auth_failed`,
      session: true 
    })(req, res, next);
  },
  (_req, res) => {
    // Successful authentication
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
);

// Google Authentication Routes
router.get('/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed`,
    session: true 
  }),
  (_req, res) => {
    // Successful authentication
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
);

export default router;

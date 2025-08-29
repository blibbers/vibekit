import { Router } from 'express';
import { body } from 'express-validator';
import { paymentController } from '../controllers/paymentController';
import { validate } from '../middleware/validation';
import { isAuthenticated } from '../middleware/auth';

const router = Router();

router.post(
  '/create-payment-intent',
  isAuthenticated,
  validate([body('amount').isFloat({ min: 0 }), body('currency').optional().isString()]),
  paymentController.createPaymentIntent
);

router.post(
  '/create-checkout-session',
  isAuthenticated,
  validate([body('items').isArray().notEmpty()]),
  paymentController.createCheckoutSession
);

router.post(
  '/create-subscription',
  isAuthenticated,
  validate([body('priceId').notEmpty()]),
  paymentController.createSubscription
);

router.post('/cancel-subscription', isAuthenticated, paymentController.cancelSubscription);

export default router;

import { Router } from 'express';
import { body } from 'express-validator';
import { subscriptionController } from '../controllers/subscriptionController';
import { validate } from '../middleware/validation';
import { isAuthenticated } from '../middleware/auth';

const router = Router();

// Get current user's subscription details
router.get('/current', isAuthenticated as any, subscriptionController.getCurrentSubscription);

// Get subscription invoices
router.get('/invoices', isAuthenticated as any, subscriptionController.getInvoices);

// Get payment methods
router.get('/payment-methods', isAuthenticated as any, subscriptionController.getPaymentMethods);

// Create setup intent for adding payment method
router.post('/payment-methods/setup-intent', isAuthenticated as any, subscriptionController.createSetupIntent);

// Add a payment method
router.post(
  '/payment-methods',
  isAuthenticated as any,
  validate([body('paymentMethodId').notEmpty()]),
  subscriptionController.addPaymentMethod
);

// Remove a payment method
router.delete('/payment-methods/:id', isAuthenticated as any, subscriptionController.removePaymentMethod);

// Set default payment method
router.put(
  '/payment-methods/:id/default',
  isAuthenticated as any,
  subscriptionController.setDefaultPaymentMethod
);

// Create subscription checkout session (for plan upgrades/changes)
router.post(
  '/checkout',
  isAuthenticated as any,
  validate([
    body('priceId').notEmpty().withMessage('Price ID is required'),
    body('successUrl').notEmpty().withMessage('Success URL is required').custom((value) => {
      try {
        new URL(value);
        return true;
      } catch {
        throw new Error('Invalid success URL format');
      }
    }),
    body('cancelUrl').notEmpty().withMessage('Cancel URL is required').custom((value) => {
      try {
        new URL(value);
        return true;
      } catch {
        throw new Error('Invalid cancel URL format');
      }
    })
  ]),
  subscriptionController.createSubscriptionCheckout
);

// Update subscription (change plan)
router.put(
  '/change-plan',
  isAuthenticated as any,
  validate([body('priceId').notEmpty()]),
  subscriptionController.changePlan
);

// Cancel subscription
router.post('/cancel', isAuthenticated as any, subscriptionController.cancelSubscription);

// Resume subscription
router.post('/resume', isAuthenticated as any, subscriptionController.resumeSubscription);

export default router;
import { Router } from 'express';
import { webhookController } from '../controllers/webhookController';
import { stripeWebhookRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post(
  '/stripe',
  stripeWebhookRateLimiter,
  webhookController.handleStripeWebhook
);

export default router;
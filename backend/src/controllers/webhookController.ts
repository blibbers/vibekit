import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { stripeService } from '../services/stripeService';

class WebhookController {
  handleStripeWebhook = asyncHandler(async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string;

    const event = await stripeService.handleWebhook(req.body, signature);

    res.json({ received: true, type: event.type });
  });
}

export const webhookController = new WebhookController();

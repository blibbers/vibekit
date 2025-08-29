import { Response } from 'express';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { stripeService } from '../services/stripeService';
import { config } from '../config/config';

class PaymentController {
  createPaymentIntent = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('User not found', 404);
    }

    const { amount, currency = 'usd', metadata } = req.body;

    const paymentIntent = await stripeService.createPaymentIntent(
      amount,
      currency,
      req.user.stripeCustomerId,
      {
        userId: (req.user._id as any).toString(),
        ...metadata,
      }
    );

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  });

  createCheckoutSession = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('User not found', 404);
    }

    const { items } = req.body;

    const lineItems = items.map((item: any) => ({
      price: item.stripePriceId,
      quantity: item.quantity,
    }));

    const session = await stripeService.createCheckoutSession(
      lineItems,
      req.user.stripeCustomerId!,
      `${config.frontend.url}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      `${config.frontend.url}/checkout/cancel`,
      {
        userId: (req.user._id as any).toString(),
      }
    );

    res.json({
      sessionId: session.id,
      url: session.url,
    });
  });

  createSubscription = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('User not found', 404);
    }

    const { priceId, trialDays } = req.body;

    if (!req.user.stripeCustomerId) {
      throw new AppError('Stripe customer not found', 400);
    }

    const subscription = await stripeService.createSubscription(
      req.user.stripeCustomerId,
      priceId,
      trialDays
    );

    res.json({
      subscription,
      clientSecret: (subscription as any).latest_invoice?.payment_intent?.client_secret,
    });
  });

  cancelSubscription = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('User not found', 404);
    }

    if (!req.user.subscription?.id) {
      throw new AppError('No active subscription found', 400);
    }

    const subscription = await stripeService.cancelSubscription(req.user.subscription.id);

    res.json({
      message: 'Subscription cancelled successfully',
      subscription,
    });
  });
}

export const paymentController = new PaymentController();

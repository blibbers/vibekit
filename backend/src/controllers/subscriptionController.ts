import { Response } from 'express';
import Stripe from 'stripe';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { stripeService } from '../services/stripeService';
import User from '../models/User';
import Product from '../models/Product';
import { config } from '../config/config';

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2023-10-16',
});

class SubscriptionController {
  getCurrentSubscription = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('User not found', 404);
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    let subscriptionDetails = null;
    let currentProduct = null;

    if (user.subscription?.id) {
      try {
        // Get subscription details from Stripe
        const stripeSubscription = await stripe.subscriptions.retrieve(user.subscription.id, {
          expand: ['items.data.price.product']
        });

        // Get product details from our database
        const priceId = stripeSubscription.items.data[0]?.price.id;
        if (priceId) {
          currentProduct = await Product.findOne({ stripePriceId: priceId });
        }

        subscriptionDetails = {
          id: stripeSubscription.id,
          status: stripeSubscription.status,
          currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
          currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
          cancelAt: stripeSubscription.cancel_at ? new Date(stripeSubscription.cancel_at * 1000) : null,
          stripeProduct: stripeSubscription.items.data[0]?.price.product,
          price: stripeSubscription.items.data[0]?.price
        };
      } catch (error) {
        console.error('Error fetching subscription from Stripe:', error);
      }
    } else {
      // User has no paid subscription, check for free plan
      currentProduct = await Product.findOne({ isFree: true, isActive: true });
    }

    res.json({
      subscription: subscriptionDetails,
      currentProduct,
      hasActiveSubscription: !!user.subscription?.id
    });
  });

  getInvoices = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.stripeCustomerId) {
      throw new AppError('No Stripe customer found', 400);
    }

    const limit = parseInt(req.query.limit as string) || 10;
    
    const invoices = await stripe.invoices.list({
      customer: req.user.stripeCustomerId,
      limit,
      expand: ['data.subscription', 'data.payment_intent']
    });

    res.json(invoices);
  });

  getPaymentMethods = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.stripeCustomerId) {
      throw new AppError('No Stripe customer found', 400);
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: req.user.stripeCustomerId,
      type: 'card'
    });

    // Get customer to see default payment method
    const customer = await stripe.customers.retrieve(req.user.stripeCustomerId) as Stripe.Customer;

    res.json({
      paymentMethods: paymentMethods.data,
      defaultPaymentMethod: customer.invoice_settings.default_payment_method
    });
  });

  addPaymentMethod = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.stripeCustomerId) {
      throw new AppError('No Stripe customer found', 400);
    }

    const { paymentMethodId } = req.body;

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: req.user.stripeCustomerId
    });

    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    res.json({
      message: 'Payment method added successfully',
      paymentMethod
    });
  });

  removePaymentMethod = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id: paymentMethodId } = req.params;

    await stripe.paymentMethods.detach(paymentMethodId);

    res.json({
      message: 'Payment method removed successfully'
    });
  });

  setDefaultPaymentMethod = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.stripeCustomerId) {
      throw new AppError('No Stripe customer found', 400);
    }

    const { id: paymentMethodId } = req.params;

    await stripe.customers.update(req.user.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });

    res.json({
      message: 'Default payment method updated successfully'
    });
  });

  createSubscriptionCheckout = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('User not found', 404);
    }

    const { priceId, successUrl, cancelUrl } = req.body;

    // Create Stripe customer if one doesn't exist
    let customerId = req.user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripeService.createCustomer(
        req.user.email,
        `${req.user.firstName} ${req.user.lastName}`
      );
      customerId = customer.id;
      
      // Update user with Stripe customer ID
      await User.findByIdAndUpdate(req.user._id, { stripeCustomerId: customerId });
    }

    // Create checkout session (works for both new subscriptions and plan changes)
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        metadata: {
          userId: req.user._id.toString(),
        }
      }
    });

    res.json({
      sessionId: session.id,
      url: session.url
    });
  });

  changePlan = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.subscription?.id) {
      throw new AppError('No active subscription found', 400);
    }

    const { priceId } = req.body;

    // Get current subscription
    const subscription = await stripe.subscriptions.retrieve(req.user.subscription.id);
    
    // Update subscription with new price
    const updatedSubscription = await stripe.subscriptions.update(req.user.subscription.id, {
      items: [{
        id: subscription.items.data[0].id,
        price: priceId,
      }],
      proration_behavior: 'create_prorations',
    });

    res.json({
      message: 'Subscription plan changed successfully',
      subscription: updatedSubscription
    });
  });

  cancelSubscription = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.subscription?.id) {
      throw new AppError('No active subscription found', 400);
    }

    const subscription = await stripe.subscriptions.update(req.user.subscription.id, {
      cancel_at_period_end: true
    });

    res.json({
      message: 'Subscription will be cancelled at the end of the current period',
      subscription
    });
  });

  resumeSubscription = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.subscription?.id) {
      throw new AppError('No active subscription found', 400);
    }

    const subscription = await stripe.subscriptions.update(req.user.subscription.id, {
      cancel_at_period_end: false
    });

    res.json({
      message: 'Subscription resumed successfully',
      subscription
    });
  });
}

export const subscriptionController = new SubscriptionController();
import Stripe from 'stripe';
import { config } from '../config/config';
import { logger } from '../utils/logger';
import User from '../models/User';
import Order from '../models/Order';

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2023-10-16',
});

export class StripeService {
  async createCustomer(email: string, name: string): Promise<Stripe.Customer> {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          platform: 'backend-app',
        },
      });
      return customer;
    } catch (error) {
      logger.error('Error creating Stripe customer:', error);
      throw error;
    }
  }

  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    customerId?: string,
    metadata?: Record<string, string>
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
        customer: customerId,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });
      return paymentIntent;
    } catch (error) {
      logger.error('Error creating payment intent:', error);
      throw error;
    }
  }

  async createCheckoutSession(
    lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
    customerId: string,
    successUrl: string,
    cancelUrl: string,
    metadata?: Record<string, string>
  ): Promise<Stripe.Checkout.Session> {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        customer: customerId,
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata,
      });
      return session;
    } catch (error) {
      logger.error('Error creating checkout session:', error);
      throw error;
    }
  }

  async createSubscription(
    customerId: string,
    priceId: string,
    trialDays?: number
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        trial_period_days: trialDays,
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });
      return subscription;
    } catch (error) {
      logger.error('Error creating subscription:', error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.cancel(subscriptionId);
      return subscription;
    } catch (error) {
      logger.error('Error canceling subscription:', error);
      throw error;
    }
  }

  async updateSubscription(
    subscriptionId: string,
    params: Stripe.SubscriptionUpdateParams
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, params);
      return subscription;
    } catch (error) {
      logger.error('Error updating subscription:', error);
      throw error;
    }
  }

  async createProduct(
    name: string,
    description: string,
    metadata?: Record<string, string>
  ): Promise<Stripe.Product> {
    try {
      const product = await stripe.products.create({
        name,
        description,
        metadata,
      });
      return product;
    } catch (error) {
      logger.error('Error creating product:', error);
      throw error;
    }
  }

  async createPrice(
    productId: string,
    unitAmount: number,
    currency: string = 'usd',
    recurring?: Stripe.PriceCreateParams.Recurring
  ): Promise<Stripe.Price> {
    try {
      const price = await stripe.prices.create({
        product: productId,
        unit_amount: Math.round(unitAmount * 100),
        currency,
        recurring,
      });
      return price;
    } catch (error) {
      logger.error('Error creating price:', error);
      throw error;
    }
  }

  async processRefund(chargeId: string, amount?: number, reason?: string): Promise<Stripe.Refund> {
    try {
      const refund = await stripe.refunds.create({
        charge: chargeId,
        amount: amount ? Math.round(amount * 100) : undefined,
        reason: reason as Stripe.RefundCreateParams.Reason,
      });
      return refund;
    } catch (error) {
      logger.error('Error processing refund:', error);
      throw error;
    }
  }

  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      logger.error('Error retrieving payment intent:', error);
      throw error;
    }
  }

  async handleWebhook(payload: string | Buffer, signature: string): Promise<Stripe.Event> {
    try {
      const event = stripe.webhooks.constructEvent(payload, signature, config.stripe.webhookSecret);

      logger.info(`Processing webhook event: ${event.type}`);

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentFailure(event.data.object);
          break;

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdate(event.data.object);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionCancellation(event.data.object);
          break;

        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSuccess(event.data.object);
          break;

        default:
          logger.info(`Unhandled webhook event type: ${event.type}`);
      }

      logger.info(`Successfully processed webhook event: ${event.type}`);
      return event;
    } catch (error) {
      logger.error('Webhook error:', error);
      throw error;
    }
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const orderId = paymentIntent.metadata.orderId;
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'paid',
        stripePaymentIntentId: paymentIntent.id,
      });
      logger.info(`Payment successful for order ${orderId}`);
    }
  }

  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
    const orderId = paymentIntent.metadata.orderId;
    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'failed',
      });
      logger.warn(`Payment failed for order ${orderId}`);
    }
  }

  private async handleSubscriptionUpdate(subscription: Stripe.Subscription) {
    try {
      // Extract customer ID - it could be a string or Customer object
      const customerId =
        typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.id;

      logger.info(`Updating subscription for customer: ${customerId}`);

      // First try to find by stripe customer ID
      let user = await User.findOne({ stripeCustomerId: customerId });

      // If not found by customer ID, try to find by userId from metadata
      if (!user && subscription.metadata?.userId) {
        logger.info(
          `User not found by customer ID, trying metadata userId: ${subscription.metadata.userId}`
        );
        user = await User.findById(subscription.metadata.userId);

        // If found, update their stripe customer ID
        if (user) {
          user.stripeCustomerId = customerId;
          logger.info(`Updated user ${user.email} with stripe customer ID: ${customerId}`);
        }
      }

      if (!user) {
        logger.warn(
          `User not found for customer ID: ${customerId} or metadata userId: ${subscription.metadata?.userId}`
        );
        return;
      }

      // Debug the timestamp value
      logger.info(
        `Raw current_period_end: ${subscription.current_period_end}, type: ${typeof subscription.current_period_end}`
      );

      // Convert timestamp to date with robust validation
      let currentPeriodEnd: Date;

      try {
        if (
          typeof subscription.current_period_end === 'number' &&
          subscription.current_period_end > 0
        ) {
          // Convert Unix timestamp (seconds) to JavaScript Date (milliseconds)
          currentPeriodEnd = new Date(subscription.current_period_end * 1000);

          // Validate the resulting date
          if (isNaN(currentPeriodEnd.getTime())) {
            throw new Error('Date conversion resulted in Invalid Date');
          }

          // Sanity check: date should be in the future and reasonable (not more than 10 years ahead)
          const now = new Date();
          const tenYearsFromNow = new Date(now.getFullYear() + 10, now.getMonth(), now.getDate());

          if (currentPeriodEnd < now || currentPeriodEnd > tenYearsFromNow) {
            logger.warn(
              `Date seems unreasonable: ${currentPeriodEnd.toISOString()}, using fallback`
            );
            throw new Error('Date outside reasonable range');
          }

          logger.info(
            `Converted timestamp ${subscription.current_period_end} to date: ${currentPeriodEnd.toISOString()}`
          );
        } else {
          throw new Error('Invalid timestamp value');
        }
      } catch (error) {
        logger.error(`Date conversion error: ${error}. Using fallback date.`);
        // Fallback: set to 30 days from now for monthly subscriptions
        currentPeriodEnd = new Date();
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
      }

      // Update user subscription fields individually
      if (!user.subscription) {
        user.subscription = {
          id: subscription.id,
          status: subscription.status,
          currentPeriodEnd: currentPeriodEnd,
          plan: subscription.items.data[0]?.price.id || '',
        };
      } else {
        user.subscription.id = subscription.id;
        user.subscription.status = subscription.status;
        user.subscription.currentPeriodEnd = currentPeriodEnd;
        user.subscription.plan = subscription.items.data[0]?.price.id || '';
      }

      // Mark subscription as modified for Mongoose
      user.markModified('subscription');

      await user.save();
      logger.info(
        `Subscription updated successfully for user ${user.email}, status: ${subscription.status}`
      );
    } catch (error) {
      logger.error('Error updating subscription:', error);
      throw error;
    }
  }

  private async handleSubscriptionCancellation(subscription: Stripe.Subscription) {
    try {
      // Extract customer ID - it could be a string or Customer object
      const customerId =
        typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.id;

      logger.info(`Cancelling subscription for customer: ${customerId}`);

      const user = await User.findOne({ stripeCustomerId: customerId });
      if (!user) {
        logger.warn(`User not found for customer ID: ${customerId}`);
        return;
      }

      user.subscription = undefined;
      await user.save();
      logger.info(`Subscription cancelled successfully for user ${user.email}`);
    } catch (error) {
      logger.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  private async handleInvoicePaymentSuccess(invoice: Stripe.Invoice) {
    logger.info(`Invoice payment successful: ${invoice.id}`);
  }
}

export const stripeService = new StripeService();

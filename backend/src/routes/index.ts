import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import productRoutes from './productRoutes';
import orderRoutes from './orderRoutes';
import paymentRoutes from './paymentRoutes';
import subscriptionRoutes from './subscriptionRoutes';
import webhookRoutes from './webhookRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/webhooks', webhookRoutes);

export default router;

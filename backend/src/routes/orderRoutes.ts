import { Router } from 'express';
import { body } from 'express-validator';
import { orderController } from '../controllers/orderController';
import { validate } from '../middleware/validation';
import { isAuthenticated, isAdmin } from '../middleware/auth';

const router = Router();

router.get('/', isAuthenticated as any, orderController.getUserOrders);
router.get('/all', isAdmin as any, orderController.getAllOrders);
router.get('/:id', isAuthenticated as any, orderController.getOrderById);

router.post(
  '/',
  isAuthenticated as any,
  validate([
    body('items').isArray().notEmpty(),
    body('shippingAddress').isObject().notEmpty(),
    body('billingAddress').isObject().notEmpty(),
  ]),
  orderController.createOrder
);

router.put('/:id/status', isAdmin as any, orderController.updateOrderStatus);
router.post('/:id/cancel', isAuthenticated as any, orderController.cancelOrder);

export default router;

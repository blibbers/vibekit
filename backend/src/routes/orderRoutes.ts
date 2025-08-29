import { Router } from 'express';
import { body } from 'express-validator';
import { orderController } from '../controllers/orderController';
import { validate } from '../middleware/validation';
import { isAuthenticated, isAdmin } from '../middleware/auth';

const router = Router();

router.get('/', isAuthenticated, orderController.getUserOrders);
router.get('/all', isAdmin, orderController.getAllOrders);
router.get('/:id', isAuthenticated, orderController.getOrderById);

router.post(
  '/',
  isAuthenticated,
  validate([
    body('items').isArray().notEmpty(),
    body('shippingAddress').isObject().notEmpty(),
    body('billingAddress').isObject().notEmpty(),
  ]),
  orderController.createOrder
);

router.put('/:id/status', isAdmin, orderController.updateOrderStatus);
router.post('/:id/cancel', isAuthenticated, orderController.cancelOrder);

export default router;
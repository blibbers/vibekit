import { Router } from 'express';
import { body } from 'express-validator';
import { productController } from '../controllers/productController';
import { validate } from '../middleware/validation';
import { isAdmin } from '../middleware/auth';

const router = Router();

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

router.post(
  '/',
  isAdmin as any,
  validate([
    body('name').notEmpty().trim(),
    body('description').notEmpty(),
    body('price').optional().isFloat({ min: 0 }),
    body('isFree').optional().isBoolean(),
    body('category').notEmpty(),
    body('sku').notEmpty().trim(),
    body('billingType').optional().isIn(['one_time', 'recurring']),
    body('billingInterval').optional().isIn(['day', 'week', 'month', 'year']),
    body('billingIntervalCount').optional().isInt({ min: 1 }),
    body('features').optional().isArray(),
    body('features.*').optional().isString().trim(),
  ]),
  productController.createProduct
);

router.put(
  '/:id', 
  isAdmin as any, 
  validate([
    body('name').optional().notEmpty().trim(),
    body('description').optional().notEmpty(),
    body('price').optional().isFloat({ min: 0 }),
    body('isFree').optional().isBoolean(),
    body('category').optional().notEmpty(),
    body('sku').optional().notEmpty().trim(),
    body('billingType').optional().isIn(['one_time', 'recurring']),
    body('billingInterval').optional().isIn(['day', 'week', 'month', 'year']),
    body('billingIntervalCount').optional().isInt({ min: 1 }),
    body('features').optional().isArray(),
    body('features.*').optional().isString().trim(),
  ]), 
  productController.updateProduct
);
router.delete('/:id', isAdmin as any, productController.deleteProduct);

export default router;
import { Router } from 'express';
import { body } from 'express-validator';
import { userController } from '../controllers/userController';
import { validate } from '../middleware/validation';
import { isAuthenticated, isAdmin } from '../middleware/auth';

const router = Router();

router.get('/', isAdmin, userController.getAllUsers);
router.get('/profile', isAuthenticated, userController.getProfile);
router.put(
  '/profile',
  isAuthenticated,
  validate([
    body('firstName').optional().notEmpty().trim(),
    body('lastName').optional().notEmpty().trim(),
    body('phone').optional().isMobilePhone('any'),
  ]),
  userController.updateProfile
);
router.delete('/account', isAuthenticated, userController.deleteAccount);

export default router;
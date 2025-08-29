import { Router } from 'express';
import { body } from 'express-validator';
import { userController } from '../controllers/userController';
import { validate } from '../middleware/validation';
import { isAuthenticated, isAdmin } from '../middleware/auth';
import { uploadToS3 } from '../config/s3';

const router = Router();

router.get('/', isAdmin as any, userController.getAllUsers);
router.get('/profile', isAuthenticated as any, userController.getProfile);
router.put(
  '/profile',
  isAuthenticated as any,
  validate([
    body('firstName').optional().notEmpty().trim(),
    body('lastName').optional().notEmpty().trim(),
    body('phone').optional().isMobilePhone('any'),
  ]),
  userController.updateProfile
);
router.post(
  '/avatar',
  isAuthenticated as any,
  uploadToS3.single('avatar'),
  userController.uploadAvatar
);
router.put(
  '/preferences',
  isAuthenticated as any,
  validate([
    body('notifications.email').optional().isBoolean(),
    body('notifications.push').optional().isBoolean(),
    body('theme').optional().isIn(['light', 'dark']),
  ]),
  userController.updatePreferences
);
router.delete('/account', isAuthenticated as any, userController.deleteAccount);

export default router;

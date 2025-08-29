import { Response } from 'express';
import User from '../models/User';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { deleteFromS3, uploadBufferToS3 } from '../config/s3';
import path from 'path';

class UserController {
  getAllUsers = asyncHandler(async (_req: AuthRequest, res: Response) => {
    const users = await User.find().select('-password');
    res.json({ users });
  });

  getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('User not found', 404);
    }

    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  });

  updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('User not found', 404);
    }

    const allowedUpdates = ['firstName', 'lastName', 'phone', 'profile', 'preferences'];
    const updates = Object.keys(req.body)
      .filter((key) => allowedUpdates.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.json({ user });
  });

  uploadAvatar = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('User not found', 404);
    }

    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Delete old avatar if it exists
    if (user.profile.avatar) {
      try {
        const url = new URL(user.profile.avatar);
        const oldKey = url.pathname.substring(1); // Remove leading slash
        if (oldKey.startsWith('avatars/')) {
          await deleteFromS3(oldKey);
        }
      } catch (error) {
        console.error('Error deleting old avatar:', error);
      }
    }

    // Generate unique filename
    const fileExtension = path.extname(req.file.originalname);
    const fileName = `avatars/${req.user._id}-${Date.now()}${fileExtension}`;

    // Upload to S3
    const avatarUrl = await uploadBufferToS3(req.file.buffer, fileName, req.file.mimetype);
    
    // Update user with new avatar URL
    user.profile.avatar = avatarUrl;
    await user.save();

    const updatedUser = await User.findById(user._id).select('-password');
    res.json({ user: updatedUser, avatarUrl });
  });

  updatePreferences = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('User not found', 404);
    }

    const { notifications, theme } = req.body;
    const updates: any = {};

    if (notifications) {
      updates['preferences.notifications'] = notifications;
    }
    
    if (theme) {
      updates['preferences.theme'] = theme;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.json({ user });
  });

  deleteAccount = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('User not found', 404);
    }

    await User.findByIdAndDelete(req.user._id);

    req.logout((err) => {
      if (err) {
        throw new AppError('Logout failed', 500);
      }
      req.session.destroy((_err) => {
        res.clearCookie('connect.sid');
        res.json({ message: 'Account deleted successfully' });
      });
    });
  });
}

export const userController = new UserController();

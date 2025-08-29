import { Response } from 'express';
import User from '../models/User';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

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
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj: any, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

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
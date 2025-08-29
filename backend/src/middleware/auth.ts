import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const isAuthenticated = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'Authentication required' });
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  return next();
};

export const isVerified = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!req.user?.isEmailVerified) {
    return res.status(403).json({ error: 'Email verification required' });
  }

  return next();
};

export const hasActiveSubscription = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const subscription = req.user?.subscription;

  if (!subscription || subscription.status !== 'active') {
    return res.status(403).json({ error: 'Active subscription required' });
  }

  if (new Date(subscription.currentPeriodEnd) < new Date()) {
    return res.status(403).json({ error: 'Subscription has expired' });
  }

  return next();
};

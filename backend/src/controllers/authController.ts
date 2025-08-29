import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import crypto from 'crypto';
import User from '../models/User';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { stripeService } from '../services/stripeService';
import { emailService } from '../services/emailService';
import { AuthRequest } from '../middleware/auth';

class AuthController {
  register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, firstName, lastName } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    
    const stripeCustomer = await stripeService.createCustomer(
      email,
      `${firstName} ${lastName}`
    );

    const user = await User.create({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      emailVerificationToken,
      stripeCustomerId: stripeCustomer.id,
    });

    await emailService.sendVerificationEmail(user.email, emailVerificationToken);

    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  });

  login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(401).json({ error: info?.message || 'Authentication failed' });
      }

      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }

        res.json({
          message: 'Login successful',
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
        });
      });
    })(req, res, next);
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        throw new AppError('Logout failed', 500);
      }
      req.session.destroy((err) => {
        if (err) {
          throw new AppError('Session destruction failed', 500);
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Logout successful' });
      });
    });
  });

  getCurrentUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        role: req.user.role,
        isEmailVerified: req.user.isEmailVerified,
        subscription: req.user.subscription,
      },
    });
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.json({ message: 'If an account exists, a password reset email has been sent.' });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 3600000);
    await user.save();

    await emailService.sendPasswordResetEmail(user.email, resetToken);

    res.json({ message: 'If an account exists, a password reset email has been sent.' });
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  });

  verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body;

    const user = await User.findOne({ emailVerificationToken: token });
    if (!user) {
      throw new AppError('Invalid verification token', 400);
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  });

  resendVerification = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('User not found', 404);
    }

    if (req.user.isEmailVerified) {
      throw new AppError('Email already verified', 400);
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    req.user.emailVerificationToken = verificationToken;
    await req.user.save();

    await emailService.sendVerificationEmail(req.user.email, verificationToken);

    res.json({ message: 'Verification email sent' });
  });
}

export const authController = new AuthController();
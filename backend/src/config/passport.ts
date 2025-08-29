import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import User from '../models/User';
import { logger } from '../utils/logger';

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        if (user.isLocked) {
          return done(null, false, { message: 'Account is locked due to too many failed login attempts' });
        }

        if (!user.isEmailVerified) {
          return done(null, false, { message: 'Please verify your email before logging in' });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
          user.loginAttempts += 1;

          if (user.loginAttempts >= 5) {
            user.lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000);
          }

          await user.save();
          return done(null, false, { message: 'Invalid email or password' });
        }

        user.loginAttempts = 0;
        user.lockUntil = undefined;
        user.lastLogin = new Date();
        await user.save();

        return done(null, user);
      } catch (error) {
        logger.error('Passport authentication error:', error);
        return done(error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
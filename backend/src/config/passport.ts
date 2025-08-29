import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as AppleStrategy } from '@nicokaiser/passport-apple';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import fs from 'fs';
import path from 'path';
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
          return done(null, false, {
            message: 'Account is locked due to too many failed login attempts',
          });
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

// Apple Strategy
if (process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID && process.env.APPLE_PRIVATE_KEY_PATH) {
  passport.use(
    new AppleStrategy(
      {
        clientID: process.env.APPLE_CLIENT_ID,
        teamID: process.env.APPLE_TEAM_ID,
        keyID: process.env.APPLE_KEY_ID,
        key: fs.readFileSync(path.join(process.cwd(), process.env.APPLE_PRIVATE_KEY_PATH)),
        scope: ['name', 'email'],
        callbackURL: process.env.APPLE_CALLBACK_URL || '/auth/apple/callback',
      },
      async (_accessToken: any, _refreshToken: any, profile: any, done: any) => {
        try {
          logger.info('Apple profile received:', profile);

          // Check if user already exists with this Apple ID
          let user = await User.findOne({ 'socialLogins.apple.id': profile.id });

          if (user) {
            // Update last login
            user.lastLogin = new Date();
            await user.save();
            return done(null, user);
          }

          // Check if user exists with the same email
          const normalizedAppleEmail = profile.email ? profile.email.toLowerCase().trim() : null;
          if (normalizedAppleEmail) {
            user = await User.findOne({ email: normalizedAppleEmail });
            
            if (user) {
              // Link Apple account to existing user
              if (!user.socialLogins) user.socialLogins = {};
              user.socialLogins.apple = {
                id: profile.id,
                email: normalizedAppleEmail,
              };
              user.lastLogin = new Date();
              await user.save();
              return done(null, user);
            }
          }

          // Create new user
          const newUser = new User({
            email: normalizedAppleEmail || `apple_${profile.id}@placeholder.com`,
            firstName: profile.name?.firstName || 'Apple',
            lastName: profile.name?.lastName || 'User',
            isEmailVerified: profile.emailVerified || false,
            socialLogins: {
              apple: {
                id: profile.id,
                email: normalizedAppleEmail,
              },
            },
            lastLogin: new Date(),
          });

          await newUser.save();
          return done(null, newUser);
        } catch (error) {
          logger.error('Apple authentication error:', error);
          return done(error);
        }
      }
    )
  );
}

// Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback',
      },
      async (_accessToken: any, _refreshToken: any, profile: any, done: any) => {
        try {
          logger.info('Google profile received:', { id: profile.id, email: profile.emails?.[0]?.value });

          // Check if user already exists with this Google ID
          let user = await User.findOne({ 'socialLogins.google.id': profile.id });

          if (user) {
            // Update last login
            user.lastLogin = new Date();
            await user.save();
            return done(null, user);
          }

          // Extract email from profile
          const email = profile.emails?.[0]?.value;
          const normalizedEmail = email ? email.toLowerCase().trim() : null;

          // Check if user exists with the same email
          if (normalizedEmail) {
            user = await User.findOne({ email: normalizedEmail });
            
            if (user) {
              // Link Google account to existing user
              if (!user.socialLogins) user.socialLogins = {};
              user.socialLogins.google = {
                id: profile.id,
                email: normalizedEmail,
              };
              user.lastLogin = new Date();
              await user.save();
              return done(null, user);
            }
          }

          // Create new user
          const newUser = new User({
            email: normalizedEmail || `google_${profile.id}@placeholder.com`,
            firstName: profile.name?.givenName || 'Google',
            lastName: profile.name?.familyName || 'User',
            isEmailVerified: profile.emails?.[0]?.verified || true, // Google emails are typically verified
            socialLogins: {
              google: {
                id: profile.id,
                email: normalizedEmail,
              },
            },
            lastLogin: new Date(),
          });

          await newUser.save();
          return done(null, newUser);
        } catch (error) {
          logger.error('Google authentication error:', error);
          return done(error);
        }
      }
    )
  );
}

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

import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  stripeCustomerId?: string;
  socialLogins?: {
    apple?: {
      id: string;
      email?: string;
    };
    google?: {
      id: string;
      email?: string;
    };
    facebook?: {
      id: string;
      email?: string;
    };
  };
  subscription?: {
    id: string;
    status: string;
    currentPeriodEnd: Date;
    plan: string;
  };
  profile: {
    avatar?: string;
    bio?: string;
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
    };
  };
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
    };
    theme: 'light' | 'dark';
    language: string;
  };
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  readonly isLocked: boolean;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: function(this: IUser) { 
        return !this.socialLogins?.apple && !this.socialLogins?.google && !this.socialLogins?.facebook;
      },
      minlength: 8,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    stripeCustomerId: {
      type: String,
      sparse: true,
      index: true,
    },
    subscription: {
      id: String,
      status: String,
      currentPeriodEnd: {
        type: Date,
        required: false,
      },
      plan: String,
    },
    profile: {
      avatar: String,
      bio: String,
      phone: String,
      address: {
        street: String,
        city: String,
        state: String,
        country: String,
        postalCode: String,
      },
    },
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
      },
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light',
      },
      language: {
        type: String,
        default: 'en',
      },
    },
    lastLogin: Date,
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
    socialLogins: {
      apple: {
        id: String,
        email: String,
      },
      google: {
        id: String,
        email: String,
      },
      facebook: {
        id: String,
        email: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ email: 1, isEmailVerified: 1 });
userSchema.index({ 'subscription.status': 1 });

userSchema.virtual('isLocked').get(function (this: IUser) {
  return !!(this.lockUntil && this.lockUntil > new Date());
});

userSchema.pre('save', async function (this: IUser, next) {
  if (!this.isModified('password') || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

userSchema.methods.comparePassword = async function (
  this: IUser,
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;

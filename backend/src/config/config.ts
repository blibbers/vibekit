import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

interface Config {
  env: string;
  port: number;
  isProduction: boolean;
  isDevelopment: boolean;
  mongodb: {
    uri: string;
  };
  session: {
    secret: string;
  };
  cors: {
    origins: string[];
  };
  stripe: {
    secretKey: string;
    publishableKey: string;
    webhookSecret: string;
  };
  email: {
    provider: 'aws-ses' | 'sendgrid' | 'smtp';
    from: string;
    // SMTP settings (fallback)
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    // AWS SES settings
    awsRegion?: string;
    awsAccessKeyId?: string;
    awsSecretAccessKey?: string;
    // SendGrid settings
    sendgridApiKey?: string;
  };
  frontend: {
    url: string;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  upload: {
    maxFileSize: number;
  };
  redis: {
    url?: string;
  };
  logging: {
    level: string;
  };
}

export const config: Config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',

  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/backend-app',
  },

  session: {
    secret: process.env.SESSION_SECRET || 'default-secret-change-this',
  },

  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },

  email: {
    provider: (process.env.EMAIL_PROVIDER as 'aws-ses' | 'sendgrid' | 'smtp') || 'smtp',
    from: process.env.EMAIL_FROM || 'noreply@app.com',
    // SMTP settings (fallback)
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
    // AWS SES settings
    awsRegion: process.env.AWS_SES_REGION || 'us-east-1',
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    // SendGrid settings
    sendgridApiKey: process.env.SENDGRID_API_KEY || '',
  },

  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
  },

  redis: {
    url: process.env.REDIS_URL,
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

export const validateConfig = () => {
  const requiredEnvVars = ['MONGODB_URI', 'SESSION_SECRET'];

  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  if (config.isProduction) {
    const productionRequiredVars = ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'];

    const missingProdVars = productionRequiredVars.filter((varName) => !process.env[varName]);

    if (missingProdVars.length > 0) {
      throw new Error(
        `Missing required production environment variables: ${missingProdVars.join(', ')}`
      );
    }
  }
};

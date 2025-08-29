# Backend - Production Express.js Server

A production-ready Express.js backend with TypeScript, MongoDB, Passport.js session-based authentication, and Stripe integration.

## Features

- **TypeScript** - Full type safety and modern JavaScript features
- **Express.js** - Fast, unopinionated web framework
- **MongoDB/Mongoose** - Document database with elegant object modeling
- **Passport.js** - Session-based authentication with local strategy
- **Stripe Integration** - Payment processing and subscription management
- **Security** - Helmet, CORS, rate limiting, and input validation
- **Email Service** - Nodemailer for transactional emails
- **Logging** - Winston logger with file and console transports
- **Development** - Nodemon for hot reloading during development

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── services/       # Business logic services
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── validators/     # Input validators
│   └── server.ts       # Express server setup
├── tests/              # Test files
├── scripts/            # Utility scripts
├── .env.example        # Environment variables template
├── nodemon.json        # Nodemon configuration
├── tsconfig.json       # TypeScript configuration
├── .eslintrc.json      # ESLint configuration
└── package.json        # Dependencies and scripts
```

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB running locally or MongoDB Atlas account
- Stripe account for payment processing

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Configure your `.env` file with your credentials:
   - MongoDB connection string
   - Session secret
   - Stripe API keys
   - Email service credentials

## Development

Start the development server with hot reloading:
```bash
npm run dev
```

The server will start on `http://localhost:5000` (or the PORT specified in .env)

## Scripts

- `npm run dev` - Start development server with nodemon
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled JavaScript (production)
- `npm run start:prod` - Run in production mode
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run typecheck` - Check TypeScript types

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout current session
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/verify-email` - Verify email with token
- `POST /api/auth/resend-verification` - Resend verification email

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `DELETE /api/users/account` - Delete user account

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Orders
- `GET /api/orders` - Get user orders
- `GET /api/orders/all` - Get all orders (admin only)
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status (admin only)
- `POST /api/orders/:id/cancel` - Cancel order

### Payments
- `POST /api/payments/create-payment-intent` - Create Stripe payment intent
- `POST /api/payments/create-checkout-session` - Create Stripe checkout session
- `POST /api/payments/create-subscription` - Create subscription
- `POST /api/payments/cancel-subscription` - Cancel subscription

### Webhooks
- `POST /api/webhooks/stripe` - Stripe webhook endpoint

### Health Check
- `GET /health` - Server health status

## Security Features

- **Helmet** - Sets various HTTP headers
- **CORS** - Configurable cross-origin resource sharing
- **Rate Limiting** - Prevents abuse and brute force attacks
- **Input Validation** - express-validator for request validation
- **Password Hashing** - bcrypt for secure password storage
- **Session Security** - Secure session configuration with MongoDB store
- **Environment Variables** - Sensitive data in environment variables

## Database Models

- **User** - User accounts with profile, preferences, and subscription data
- **Product** - Products with Stripe integration
- **Order** - Order management with status tracking

## Error Handling

Centralized error handling with:
- Custom AppError class for operational errors
- Global error handler middleware
- Async error catching wrapper
- Detailed error logging with Winston

## Production Deployment

1. Build the TypeScript code:
```bash
npm run build
```

2. Set NODE_ENV to production:
```bash
export NODE_ENV=production
```

3. Start the server:
```bash
npm run start:prod
```

## Environment Variables

See `.env.example` for all required environment variables.

Key variables:
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port
- `MONGODB_URI` - MongoDB connection string
- `SESSION_SECRET` - Express session secret
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret

## Testing

Run tests with Jest:
```bash
npm test
```

Generate coverage report:
```bash
npm run test:coverage
```

## License

MIT
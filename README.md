# VibeKit 🚀

> A fully functional full-stack application template for vibe coding. Complete with authentication, email service, S3 uploads, Stripe integration, and modern tech stack. Perfect for rapid prototyping and production-ready applications.

![VibeKit](https://img.shields.io/badge/VibeKit-Full%20Stack%20Template-blue)
![React](https://img.shields.io/badge/React-19-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![Express](https://img.shields.io/badge/Express.js-4.21-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green)

## 🌟 What is VibeKit?

VibeKit is a comprehensive, production-ready full-stack application template that eliminates the repetitive setup work of building modern web applications. Whether you're prototyping your next big idea or building a production SaaS, VibeKit provides all the essential features you need to get started immediately.

### ✨ Key Features

- 🔐 **Complete Authentication System** - Local auth, social logins (Google, Apple), email verification
- 💳 **Stripe Payment Integration** - Subscriptions, one-time payments, webhooks, invoice management
- 📧 **Multi-Provider Email Service** - AWS SES, SendGrid, SMTP support with templates
- ☁️ **AWS S3 File Storage** - Image uploads, profile avatars, secure file management
- 🎨 **Modern UI with shadcn/ui** - Beautiful, responsive design with dark/light mode
- 🛡️ **Production-Grade Security** - Rate limiting, CORS, input validation, session management
- 👥 **User & Admin Management** - Role-based access control, user preferences
- 📊 **Product Management** - Create Stripe products and subscriptions from the dashboard 

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Modern component library
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Backend
- **Express.js** with TypeScript
- **MongoDB** with Mongoose ODM
- **Passport.js** - Authentication strategies
- **Winston** - Comprehensive logging
- **Express Validator** - Input validation
- **Jest** - Testing framework

### Integrations
- **Stripe** - Payment processing
- **AWS S3** - File storage
- **AWS SES / SendGrid** - Email delivery
- **Google OAuth 2.0** - Social authentication
- **Apple Sign In** - iOS authentication

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB
- AWS Account (for S3 and SES)
- Stripe Account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vibekit/vibekit.git
   cd vibekit
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   
   Copy the example environment files and configure:
   ```bash
   # Backend
   cd backend
   cp .env.example .env
   
   # Frontend
   cd ../frontend
   cp .env.example .env
   ```

4. **Configure Environment Variables**
   
   **Backend (.env):**
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/vibekit
   
   # Session
   SESSION_SECRET=your-super-secret-session-key
   
   # Stripe
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   
   # AWS S3
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=your-bucket-name
   
   # Email Provider (choose one)
   EMAIL_PROVIDER=ses # or 'sendgrid' or 'smtp'
   
   # AWS SES
   SES_ACCESS_KEY_ID=your-ses-access-key
   SES_SECRET_ACCESS_KEY=your-ses-secret-key
   SES_REGION=us-east-1
   FROM_EMAIL=noreply@yourdomain.com
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   
   # Apple Sign In
   APPLE_CLIENT_ID=your-apple-client-id
   APPLE_TEAM_ID=your-apple-team-id
   APPLE_KEY_ID=your-apple-key-id
   ```
   
   **Frontend (.env):**
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

5. **Start Development Servers**
   ```bash
   # Backend (Terminal 1)
   cd backend
   npm run dev
   
   # Frontend (Terminal 2)
   cd frontend
   npm run dev
   ```

6. **Visit the application**
   - Frontend: http://localhost:5333
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
vibekit/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── server.ts       # Server entry point
│   ├── tests/              # Test files
│   └── package.json
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── config/         # Site configuration
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utility libraries
│   │   ├── pages/          # Page components
│   │   └── main.tsx        # App entry point
│   └── package.json
└── README.md
```

## 🔐 Authentication Features

### Local Authentication
- Email/password registration and login
- Secure password hashing with bcrypt
- Account lockout protection (5 failed attempts = 2-hour lock)
- Email verification required for new accounts
- Password reset with secure email tokens

### Social Authentication
- **Google OAuth 2.0** - Ready to use
- **Apple Sign In** - iOS/macOS integration
- **Facebook Login** - Configuration ready

### Session Management
- MongoDB session store for scalability
- Secure session cookies
- Automatic session cleanup

## 💳 Payment Integration

### Stripe Features
- **Subscription Management** - Recurring billing with multiple plans
- **One-time Payments** - Product purchases
- **Payment Methods** - Add/remove credit cards
- **Invoice Access** - Billing history
- **Webhook Handling** - Automatic status updates
- **Plan Changes** - Upgrade/downgrade subscriptions
- **Cancellations** - Graceful subscription termination

### Payment Flow
1. User selects a plan
2. Redirected to Stripe Checkout
3. Payment processed securely
4. Webhook updates subscription status
5. User gains access to premium features

## 📧 Email System

### Supported Providers
- **AWS SES** - Scalable email service
- **SendGrid** - Alternative email provider  
- **SMTP** - Generic SMTP support (Gmail, etc.)

### Email Templates
- Welcome emails
- Email verification
- Password reset
- Order confirmations
- Subscription notifications

## ☁️ File Storage

### AWS S3 Integration
- Profile avatar uploads
- Product image management
- Secure file URLs with expiration
- File type and size validation
- Direct browser-to-S3 uploads

## 🎨 UI/UX Features

### Modern Design System
- **shadcn/ui** components
- **Tailwind CSS** styling
- **Dark/Light mode** toggle
- **Responsive design** (mobile-first)
- **Loading states** and error handling
- **Toast notifications**

### Pages Included
- Landing page
- Authentication (login/signup)
- User dashboard
- Account settings
- Subscription management
- Admin panel
- Product catalog
- Order history

## 🛡️ Security Features

- **Helmet.js** security headers
- **CORS** configuration
- **Rate limiting** (general + auth-specific)
- **Input validation** with express-validator
- **Session security** with secure cookies
- **Environment variable validation**
- **SQL injection protection**

## 🔧 Development

### Available Scripts

**Backend:**
```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run start       # Start production server
npm test            # Run tests
npm run lint        # Run ESLint
```

**Frontend:**
```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
```

### Testing
```bash
# Backend tests
cd backend
npm test

# Frontend tests  
cd frontend
npm test
```

## 📚 Configuration Guides

### Social Login Setup
Detailed guides available in `/backend/docs/`:
- [Apple Sign In Setup](./backend/docs/apple_setup.md)
- [Google OAuth Setup](./backend/docs/social-login-setup.md)

### Environment Configuration
Each service requires specific environment variables:
- MongoDB connection
- Stripe API keys and webhooks
- AWS credentials for S3 and SES
- Social authentication credentials
- SMTP settings (if using email)

## 🚀 Deployment

### Production Checklist
- [ ] Set production environment variables
- [ ] Configure MongoDB (Atlas recommended)
- [ ] Set up AWS S3 bucket with proper permissions
- [ ] Configure AWS SES for email delivery
- [ ] Set up Stripe webhooks for production
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure CORS for production domains

### Deployment Options
- **Vercel** (Frontend) + **Railway/Render** (Backend)
- **AWS EC2** with PM2
- **Docker** containers
- **Heroku** (hobby projects)

## 🤝 Contributing

We welcome contributions! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License - see the [LICENSE](./LICENSE) file for details.

## 🆘 Support

- 📖 **Documentation**: Check the `/docs` folder for detailed guides
- 🐛 **Issues**: Report bugs on GitHub Issues
- 💬 **Discussions**: Join our GitHub Discussions
- 📧 **Email**: support@vibekit.dev

## 🎉 What's Next?

VibeKit gives you a solid foundation, but the possibilities are endless:
- Add real-time features with Socket.io
- Implement push notifications
- Add multi-tenancy support
- Integrate additional payment providers
- Add advanced analytics
- Build mobile apps with React Native

---

**Built with ❤️ for developers who want to focus on building amazing products, not boilerplate.**

Start your next project with VibeKit and turn your ideas into reality faster than ever before!
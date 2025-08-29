import nodemailer from 'nodemailer';
import { config } from '../config/config';
import { logger } from '../utils/logger';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      const mailOptions = {
        from: config.email.from,
        to,
        subject,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Email sending failed:', error);
      throw error;
    }
  }

  async sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${config.frontend.url}/verify-email?token=${token}`;
    
    const html = `
      <h1>Email Verification</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>Or copy and paste this URL into your browser:</p>
      <p>${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
    `;

    return this.sendEmail(email, 'Verify Your Email', html);
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${config.frontend.url}/reset-password?token=${token}`;
    
    const html = `
      <h1>Password Reset</h1>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>Or copy and paste this URL into your browser:</p>
      <p>${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    return this.sendEmail(email, 'Password Reset Request', html);
  }

  async sendOrderConfirmation(email: string, orderDetails: any) {
    const html = `
      <h1>Order Confirmation</h1>
      <p>Thank you for your order!</p>
      <h2>Order Number: ${orderDetails.orderNumber}</h2>
      <p>Total: $${orderDetails.total.toFixed(2)}</p>
      <p>We'll send you an update when your order ships.</p>
    `;

    return this.sendEmail(email, 'Order Confirmation', html);
  }
}

export const emailService = new EmailService();
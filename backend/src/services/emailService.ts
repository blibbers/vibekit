import nodemailer from 'nodemailer';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import sgMail from '@sendgrid/mail';
import { config } from '../config/config';
import { logger } from '../utils/logger';

class EmailService {
  private transporter?: nodemailer.Transporter;
  private sesClient?: SESv2Client;

  constructor() {
    this.initializeProvider();
  }

  private initializeProvider() {
    switch (config.email.provider) {
      case 'aws-ses':
        this.sesClient = new SESv2Client({
          region: config.email.awsRegion,
          credentials: {
            accessKeyId: config.email.awsAccessKeyId!,
            secretAccessKey: config.email.awsSecretAccessKey!,
          },
        });
        logger.info('Email service initialized with AWS SES');
        break;

      case 'sendgrid':
        sgMail.setApiKey(config.email.sendgridApiKey!);
        logger.info('Email service initialized with SendGrid');
        break;

      case 'smtp':
      default:
        this.transporter = nodemailer.createTransport({
          host: config.email.host,
          port: config.email.port,
          secure: config.email.port === 465,
          auth: {
            user: config.email.user,
            pass: config.email.password,
          },
        });
        logger.info('Email service initialized with SMTP');
        break;
    }
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      switch (config.email.provider) {
        case 'aws-ses':
          return await this.sendWithSES(to, subject, html);

        case 'sendgrid':
          return await this.sendWithSendGrid(to, subject, html);

        case 'smtp':
        default:
          return await this.sendWithSMTP(to, subject, html);
      }
    } catch (error) {
      logger.error('Email sending failed:', error);
      throw error;
    }
  }

  private async sendWithSES(to: string, subject: string, html: string) {
    const command = new SendEmailCommand({
      FromEmailAddress: config.email.from,
      Destination: {
        ToAddresses: [to],
      },
      Content: {
        Simple: {
          Subject: {
            Data: subject,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: html,
              Charset: 'UTF-8',
            },
          },
        },
      },
    });

    const response = await this.sesClient!.send(command);
    logger.info(`Email sent via AWS SES: ${response.MessageId}`);
    return { messageId: response.MessageId };
  }

  private async sendWithSendGrid(to: string, subject: string, html: string) {
    const msg = {
      to,
      from: config.email.from,
      subject,
      html,
    };

    const response = await sgMail.send(msg);
    logger.info(`Email sent via SendGrid: ${response[0].headers['x-message-id']}`);
    return { messageId: response[0].headers['x-message-id'] };
  }

  private async sendWithSMTP(to: string, subject: string, html: string) {
    const mailOptions = {
      from: config.email.from,
      to,
      subject,
      html,
    };

    const info = await this.transporter!.sendMail(mailOptions);
    logger.info(`Email sent via SMTP: ${info.messageId}`);
    return info;
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

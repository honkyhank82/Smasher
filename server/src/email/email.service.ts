import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend?: Resend;
  private readonly from: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.from = process.env.RESEND_FROM ?? 'no-reply@smasher.app';
    
    if (!apiKey || apiKey.trim() === '') {
      this.logger.warn('RESEND_API_KEY not set. Email sending is disabled.');
      this.resend = undefined;
    } else {
      try {
        this.resend = new Resend(apiKey);
        this.logger.log('Email service initialized successfully');
      } catch (error) {
        this.logger.error('Failed to initialize Resend with API key', error);
        this.resend = undefined;
      }
    }
  }

  async sendVerificationEmail(to: string, codeOrLink: string): Promise<boolean> {
    if (!this.hasKey() || !this.resend) {
      this.logger.warn(`Skipping verification email to ${to}; missing RESEND_API_KEY`);
      return false;
    }
    try {
      const subject = 'Verify your smasher account';
      const html = `<p>Welcome to smasher!</p><p>Complete verification: <a href="${codeOrLink}">${codeOrLink}</a></p>`;
      await this.resend.emails.send({ from: this.from, to, subject, html });
      return true;
    } catch (err) {
      this.logger.error('Failed to send verification email', err as any);
      return false;
    }
  }

  async sendVerificationCode(to: string, code: string): Promise<boolean> {
    // Always log the code in development for easy testing
    this.logger.log(`📧 VERIFICATION CODE for ${to}: ${code}`);
    
    if (!this.hasKey() || !this.resend) {
      this.logger.warn(`⚠️  Email not sent - RESEND_API_KEY not configured. Use the code above.`);
      return false;
    }
    try {
      const subject = 'Your SMASHER verification code';
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #FF6B35;">SMASHER</h1>
          <h2>Your Verification Code</h2>
          <p>Enter this code to complete your registration:</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${code}
          </div>
          <p style="color: #666;">This code will expire in 15 minutes.</p>
          <p style="color: #666; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `;
      await this.resend.emails.send({ from: this.from, to, subject, html });
      this.logger.log(`✅ Email also sent to ${to}`);
      return true;
    } catch (err) {
      this.logger.error('Failed to send verification code email', err as any);
      return false;
    }
  }

  async sendNotificationEmail(to: string, subject: string, html: string): Promise<boolean> {
    if (!this.hasKey() || !this.resend) {
      this.logger.warn(`Skipping notification email to ${to}; missing RESEND_API_KEY`);
      return false;
    }
    try {
      await this.resend.emails.send({ from: this.from, to, subject, html });
      return true;
    } catch (err) {
      this.logger.error('Failed to send notification email', err as any);
      return false;
    }
  }

  private hasKey(): boolean {
    const apiKey = process.env.RESEND_API_KEY;
    return Boolean(apiKey && apiKey.length > 0);
  }
}

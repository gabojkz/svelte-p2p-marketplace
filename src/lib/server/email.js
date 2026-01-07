/**
 * Email service for sending transactional emails
 * Supports multiple providers: Resend, SendGrid, Postmark, etc.
 */

import { APP_NAME } from '../utils/constants.js';

const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'resend'; // 'resend' | 'sendgrid' | 'postmark'
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@yourdomain.com';
const FROM_NAME = process.env.FROM_NAME || APP_NAME;

/**
 * Send email using the configured provider
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} [options.text] - Plain text content (optional)
 * @returns {Promise<{success: boolean, messageId?: string, error?: string}>}
 */
export async function sendEmail({ to, subject, html, text }) {
  try {
    switch (EMAIL_PROVIDER) {
      case 'resend':
        return await sendWithResend({ to, subject, html, text });
      case 'sendgrid':
        return await sendWithSendGrid({ to, subject, html, text });
      case 'postmark':
        return await sendWithPostmark({ to, subject, html, text });
      default:
        throw new Error(`Unknown email provider: ${EMAIL_PROVIDER}`);
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error.message || 'Failed to send email'
    };
  }
}

/**
 * Send email using Resend (Recommended)
 * Get API key from: https://resend.com/api-keys
 * Free tier: 100 emails/day, 3,000 emails/month
 */
async function sendWithResend({ to, subject, html, text }) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to send email via Resend');
  }

  return {
    success: true,
    messageId: data.id,
  };
}

/**
 * Send email using SendGrid
 * Get API key from: https://app.sendgrid.com/settings/api_keys
 * Free tier: 100 emails/day forever
 */
async function sendWithSendGrid({ to, subject, html, text }) {
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  
  if (!SENDGRID_API_KEY) {
    throw new Error('SENDGRID_API_KEY environment variable is not set');
  }

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: to }],
        },
      ],
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      subject,
      content: [
        {
          type: 'text/html',
          value: html,
        },
        ...(text ? [{
          type: 'text/plain',
          value: text,
        }] : []),
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to send email via SendGrid');
  }

  return {
    success: true,
    messageId: response.headers.get('x-message-id') || 'unknown',
  };
}

/**
 * Send email using Postmark
 * Get API key from: https://account.postmarkapp.com/servers
 * Free tier: 100 emails/month
 * Best deliverability rates
 */
async function sendWithPostmark({ to, subject, html, text }) {
  const POSTMARK_API_KEY = process.env.POSTMARK_API_KEY;
  const POSTMARK_SERVER_TOKEN = process.env.POSTMARK_SERVER_TOKEN || POSTMARK_API_KEY;
  
  if (!POSTMARK_SERVER_TOKEN) {
    throw new Error('POSTMARK_SERVER_TOKEN environment variable is not set');
  }

  const response = await fetch('https://api.postmarkapp.com/email', {
    method: 'POST',
    headers: {
      'X-Postmark-Server-Token': POSTMARK_SERVER_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      From: `${FROM_NAME} <${FROM_EMAIL}>`,
      To: to,
      Subject: subject,
      HtmlBody: html,
      TextBody: text || html.replace(/<[^>]*>/g, ''),
      MessageStream: 'outbound',
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.Message || 'Failed to send email via Postmark');
  }

  return {
    success: true,
    messageId: data.MessageID,
  };
}

/**
 * Send email verification email
 * @param {string} email - User email
 * @param {string} verificationUrl - Verification link URL
 */
export async function sendVerificationEmail(email, verificationUrl) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #00247d 0%, #003893 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Verify Your Email</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e9ecef; border-top: none; border-radius: 0 0 8px 8px;">
          <p>Hello,</p>
          <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="display: inline-block; background: #00247d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">Verify Email</a>
          </div>
          <p style="font-size: 14px; color: #666;">Or copy and paste this link into your browser:</p>
          <p style="font-size: 12px; color: #999; word-break: break-all;">${verificationUrl}</p>
          <p style="font-size: 14px; color: #666; margin-top: 30px;">This link will expire in 24 hours.</p>
          <p style="font-size: 14px; color: #666;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
        <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
          <p>© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject: 'Verify Your Email Address',
    html,
  });
}

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {string} resetUrl - Password reset link URL
 */
export async function sendPasswordResetEmail(email, resetUrl) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #00247d 0%, #003893 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Reset Your Password</h1>
        </div>
        <div style="background: white; padding: 30px; border: 1px solid #e9ecef; border-top: none; border-radius: 0 0 8px 8px;">
          <p>Hello,</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; background: #00247d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">Reset Password</a>
          </div>
          <p style="font-size: 14px; color: #666;">Or copy and paste this link into your browser:</p>
          <p style="font-size: 12px; color: #999; word-break: break-all;">${resetUrl}</p>
          <p style="font-size: 14px; color: #666; margin-top: 30px;">This link will expire in 1 hour.</p>
          <p style="font-size: 14px; color: #666;">If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</p>
        </div>
        <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
          <p>© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
        </div>
      </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject: 'Reset Your Password',
    html,
  });
}


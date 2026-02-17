import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@dumbbellflow.com';

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Send email using Resend
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  // If no API key is set, log to console (development mode)
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️  Resend API key not configured - Email not sent in development mode');
    return;
  }

  try {
    if (!options.html && !options.text) {
      throw new Error('Either html or text must be provided');
    }

    if (options.html) {
      await resend.emails.send({
        from: fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
        ...(options.text && { text: options.text }),
      });
    } else if (options.text) {
      await resend.emails.send({
        from: fromEmail,
        to: options.to,
        subject: options.subject,
        text: options.text,
      });
    }
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error('Failed to send email');
  }
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(
  to: string,
  name: string | null,
  token: string
): Promise<void> {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/user/verify-email?token=${token}`;

  await sendEmail({
    to,
    subject: 'Verify your email - Dumbbellflow',
    text: `Hello ${name || 'there'},\n\nPlease verify your email by clicking this link:\n${verificationUrl}\n\nThis link expires in 24 hours.\n\nThanks,\nDumbbellflow Team`,
    html: `
      <h2>Hello ${name || 'there'},</h2>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p><small>This link expires in 24 hours.</small></p>
      <p>Thanks,<br/>Dumbbellflow Team</p>
    `,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  to: string,
  name: string | null,
  token: string
): Promise<void> {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

  await sendEmail({
    to,
    subject: 'Reset your password - Dumbbellflow',
    text: `Hello ${name || 'there'},\n\nYou requested to reset your password. Click this link:\n${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nThanks,\nDumbbellflow Team`,
    html: `
      <h2>Hello ${name || 'there'},</h2>
      <p>You requested to reset your password. Click the link below:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p><small>This link expires in 1 hour.</small></p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Thanks,<br/>Dumbbellflow Team</p>
    `,
  });
}

/**
 * Send welcome email with license key
 */
export async function sendWelcomeEmail(
  to: string,
  name: string | null,
  licenseKey: string
): Promise<void> {
  const dashboardUrl = `${process.env.NEXTAUTH_URL}/dashboard`;

  await sendEmail({
    to,
    subject: 'Welcome to Dumbbellflow - Your License Key',
    text: `Hello ${name || 'there'},\n\nWelcome to Dumbbellflow! Your account has been verified.\n\nYour License Key: ${licenseKey}\n\nYou can now download the app and start your 30-day free trial.\n\nVisit your dashboard: ${dashboardUrl}\n\nThanks,\nDumbbellflow Team`,
    html: `
      <h2>Hello ${name || 'there'},</h2>
      <p>Welcome to Dumbbellflow! Your account has been verified.</p>
      <h3>Your License Key:</h3>
      <p style="font-family: monospace; font-size: 18px; font-weight: bold; background: #f0f0f0; padding: 10px; border-radius: 5px;">${licenseKey}</p>
      <p>You can now download the app and start your 30-day free trial.</p>
      <a href="${dashboardUrl}">Visit your dashboard</a>
      <p>Thanks,<br/>Dumbbellflow Team</p>
    `,
  });
}

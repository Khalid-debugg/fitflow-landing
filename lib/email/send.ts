import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@fitflow.com';

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
  console.log('\n========== ATTEMPTING TO SEND EMAIL ==========');
  console.log('Resend API Key present:', !!process.env.RESEND_API_KEY);
  console.log('From Email:', fromEmail);
  console.log('To:', options.to);
  console.log('Subject:', options.subject);

  // If no API key is set, log to console (development mode)
  if (!process.env.RESEND_API_KEY) {
    console.log('⚠️  NO API KEY - Development mode');
    console.log('---');
    if (options.text) {
      console.log('Text:', options.text);
    }
    if (options.html) {
      console.log('HTML:', options.html);
    }
    console.log('=========================================\n');
    return;
  }

  try {
    console.log('📧 Sending email via Resend...');
    const result = await resend.emails.send({
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log('✅ Email sent successfully!');
    console.log('Result:', JSON.stringify(result, null, 2));
    console.log('=========================================\n');
  } catch (error) {
    console.error('❌ Failed to send email:');
    console.error('Error details:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    console.log('=========================================\n');
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
    subject: 'Verify your email - FitFlow',
    text: `Hello ${name || 'there'},\n\nPlease verify your email by clicking this link:\n${verificationUrl}\n\nThis link expires in 24 hours.\n\nThanks,\nFitFlow Team`,
    html: `
      <h2>Hello ${name || 'there'},</h2>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p><small>This link expires in 24 hours.</small></p>
      <p>Thanks,<br/>FitFlow Team</p>
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
    subject: 'Reset your password - FitFlow',
    text: `Hello ${name || 'there'},\n\nYou requested to reset your password. Click this link:\n${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nThanks,\nFitFlow Team`,
    html: `
      <h2>Hello ${name || 'there'},</h2>
      <p>You requested to reset your password. Click the link below:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p><small>This link expires in 1 hour.</small></p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Thanks,<br/>FitFlow Team</p>
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
    subject: 'Welcome to FitFlow - Your License Key',
    text: `Hello ${name || 'there'},\n\nWelcome to FitFlow! Your account has been verified.\n\nYour License Key: ${licenseKey}\n\nYou can now download the app and start your 30-day free trial.\n\nVisit your dashboard: ${dashboardUrl}\n\nThanks,\nFitFlow Team`,
    html: `
      <h2>Hello ${name || 'there'},</h2>
      <p>Welcome to FitFlow! Your account has been verified.</p>
      <h3>Your License Key:</h3>
      <p style="font-family: monospace; font-size: 18px; font-weight: bold; background: #f0f0f0; padding: 10px; border-radius: 5px;">${licenseKey}</p>
      <p>You can now download the app and start your 30-day free trial.</p>
      <a href="${dashboardUrl}">Visit your dashboard</a>
      <p>Thanks,<br/>FitFlow Team</p>
    `,
  });
}

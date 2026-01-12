/**
 * Email sending stub for Phase 7
 * Will be replaced with actual email service (Resend) in Phase 17
 *
 * For now, all emails are logged to console
 */

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Send email (stub implementation)
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  console.log('\n========== EMAIL SENT ==========');
  console.log('To:', options.to);
  console.log('Subject:', options.subject);
  console.log('---');
  if (options.text) {
    console.log('Text:', options.text);
  }
  if (options.html) {
    console.log('HTML:', options.html);
  }
  console.log('================================\n');
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

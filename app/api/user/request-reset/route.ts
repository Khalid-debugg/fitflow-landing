import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { generateToken, generateTokenExpiry } from '@/lib/utils/tokens';
import { sendPasswordResetEmail } from '@/lib/email/send';

/**
 * POST /api/user/request-reset
 * Request password reset - send email with reset token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success even if user doesn't exist (security best practice)
    // This prevents email enumeration attacks
    if (!user) {
      return NextResponse.json(
        {
          success: true,
          message:
            'If an account exists with this email, a password reset link has been sent.',
        },
        { status: 200 }
      );
    }

    // Generate reset token (expires in 1 hour)
    const resetToken = generateToken(32);
    const resetTokenExpiry = generateTokenExpiry(1); // 1 hour

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send password reset email
    await sendPasswordResetEmail(user.email, user.name, resetToken);

    return NextResponse.json(
      {
        success: true,
        message:
          'If an account exists with this email, a password reset link has been sent.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

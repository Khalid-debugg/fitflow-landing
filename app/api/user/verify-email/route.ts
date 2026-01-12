import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { isTokenExpired } from '@/lib/utils/tokens';
import { sendWelcomeEmail } from '@/lib/email/send';

/**
 * GET /api/user/verify-email?token=xxx
 * Verify user email with token
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Find user with this verification token
    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid verification token' },
        { status: 400 }
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email already verified' },
        { status: 400 }
      );
    }

    // Check if token expired
    if (isTokenExpired(user.verificationTokenExpiry)) {
      return NextResponse.json(
        { error: 'Verification token has expired' },
        { status: 400 }
      );
    }

    // Update user - mark email as verified and clear token
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
        verificationTokenExpiry: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        licenseKey: true,
      },
    });

    // Send welcome email with license key
    if (updatedUser.licenseKey) {
      await sendWelcomeEmail(
        updatedUser.email,
        updatedUser.name,
        updatedUser.licenseKey
      );
    }

    // Return success response with redirect URL
    return NextResponse.json(
      {
        success: true,
        message: 'Email verified successfully! You can now sign in.',
        redirectUrl: '/auth/signin',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import {
  hashPassword,
  validatePassword,
} from '@/lib/utils/password';
import { generateToken, generateTokenExpiry } from '@/lib/utils/tokens';
import { generateLicenseKey } from '@/lib/license';
import { sendVerificationEmail } from '@/lib/email/send';

/**
 * POST /api/user/register
 * Register a new user and create trial account
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: 'Invalid password', details: passwordValidation.errors },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Generate verification token
    const verificationToken = generateToken(32);
    const verificationTokenExpiry = generateTokenExpiry(24); // 24 hours

    // Generate license key (crypto-based, with DB uniqueness check)
    const licenseKey = await generateLicenseKey();

    // Calculate trial period (30 days from now)
    const trialStartAt = new Date();
    const trialEndAt = new Date();
    trialEndAt.setDate(trialEndAt.getDate() + 30);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: name || null,
        passwordHash,
        verificationToken,
        verificationTokenExpiry,
        licenseKey,
        trialStartAt,
        trialEndAt,
        subscriptionStatus: 'trial',
        deviceLimit: 1,
      },
      select: {
        id: true,
        email: true,
        name: true,
        licenseKey: true,
        trialStartAt: true,
        trialEndAt: true,
      },
    });

    // Send verification email
    try {
      console.log('🔔 Attempting to send verification email to:', user.email);
      await sendVerificationEmail(user.email, user.name, verificationToken);
      console.log('✅ Verification email sent successfully');
    } catch (emailError) {
      console.error('❌ Failed to send verification email:', emailError);
      // Don't fail registration if email fails, just log it
      // User can still resend verification email later
    }

    return NextResponse.json(
      {
        success: true,
        message:
          'Account created successfully. Please check your email to verify your account.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          trialEndsAt: user.trialEndAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { checkRateLimit } from '@/lib/utils/rate-limit';

/**
 * Zod schema for license validation request
 */
const validationSchema = z.object({
  licenseKey: z.string().min(1, 'License key is required'),
  deviceId: z.string().min(1, 'Device ID is required'),
});

type ValidationRequest = z.infer<typeof validationSchema>;

/**
 * POST /api/license/validate
 * Validate a license and device combination
 * Used for periodic online checks by the Electron app
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting: max 10 validations per hour per IP
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = await checkRateLimit(ip, 'license-validation', 10, 3600);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many validation attempts. Try again in ${Math.ceil(rateLimitResult.retryAfter / 60)} minutes.`,
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = validationSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid request data',
          errors: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { licenseKey, deviceId }: ValidationRequest = validationResult.data;

    // Find user by license key
    const user = await prisma.user.findUnique({
      where: { licenseKey },
      include: {
        ActivatedDevice: {
          where: {
            deviceId,
            isActive: true
          },
        },
      },
    });

    // Check if license key exists
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          message: 'Invalid license key',
        },
        { status: 401 }
      );
    }

    // Check if device is activated
    const device = user.ActivatedDevice[0];
    if (!device) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          message: 'Device not activated with this license',
        },
        { status: 403 }
      );
    }

    // Update last validated timestamp
    await prisma.activatedDevice.update({
      where: { id: device.id },
      data: { lastValidatedAt: new Date() }
    });

    // Check trial status
    const now = new Date();
    const isTrialActive = device.trialEndsAt ? now < device.trialEndsAt : false;
    const isTrialExpired = device.trialEndsAt ? now >= device.trialEndsAt : false;

    // Check subscription status
    const hasActiveSubscription = user.subscriptionStatus === 'active' ||
                                   user.subscriptionStatus === 'paid' ||
                                   user.perpetualLicensePurchasedAt !== null;

    // Determine if license is valid
    const isValid = isTrialActive || hasActiveSubscription;

    // Calculate days remaining in trial
    let trialDaysRemaining = 0;
    if (device.trialEndsAt && isTrialActive) {
      const msRemaining = device.trialEndsAt.getTime() - now.getTime();
      trialDaysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
    }

    return NextResponse.json(
      {
        success: true,
        valid: isValid,
        message: isValid ? 'License is valid' : 'License expired or subscription required',
        data: {
          deviceId: device.deviceId,
          deviceName: device.deviceName,
          activatedAt: device.activatedAt.toISOString(),
          lastValidatedAt: device.lastValidatedAt.toISOString(),
          subscriptionStatus: user.subscriptionStatus,
          isTrialActive,
          isTrialExpired,
          trialEndsAt: device.trialEndsAt?.toISOString() || null,
          trialDaysRemaining,
          hasActiveSubscription,
          requiresPayment: isTrialExpired && !hasActiveSubscription,
          dashboardUrl: `${process.env.NEXTAUTH_URL || 'https://fitflow.com'}/dashboard`,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('License validation error:', error);
    return NextResponse.json(
      {
        success: false,
        valid: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

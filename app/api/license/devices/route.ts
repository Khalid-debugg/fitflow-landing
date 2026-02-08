import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

/**
 * GET /api/license/devices
 * Get all devices (active and inactive) for the authenticated user
 */
export async function GET() {
  try {
    // Check authentication
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required',
        },
        { status: 401 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        ActivatedDevice: {
          orderBy: { activatedAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    // Process devices with trial status
    const now = new Date();
    const devices = user.ActivatedDevice.map(device => {
      const isTrialActive = device.trialEndsAt ? now < device.trialEndsAt : false;
      const isTrialExpired = device.trialEndsAt && now >= device.trialEndsAt;

      let trialDaysRemaining = 0;
      if (device.trialEndsAt && isTrialActive) {
        const msRemaining = device.trialEndsAt.getTime() - now.getTime();
        trialDaysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
      }

      return {
        id: device.id,
        deviceId: device.deviceId,
        deviceName: device.deviceName,
        platform: device.platform,
        appVersion: device.appVersion,
        activatedAt: device.activatedAt.toISOString(),
        lastValidatedAt: device.lastValidatedAt.toISOString(),
        isActive: device.isActive,
        trialStartedAt: device.trialStartedAt?.toISOString() || null,
        trialEndsAt: device.trialEndsAt?.toISOString() || null,
        trialUsed: device.trialUsed,
        isTrialActive,
        isTrialExpired,
        trialDaysRemaining,
      };
    });

    // Count active devices
    const activeDeviceCount = devices.filter(d => d.isActive).length;

    // Check if user has active subscription
    const hasActiveSubscription = user.subscriptionStatus === 'active' ||
                                   user.subscriptionStatus === 'paid' ||
                                   user.perpetualLicensePurchasedAt !== null;

    return NextResponse.json(
      {
        success: true,
        data: {
          licenseKey: user.licenseKey,
          devices,
          deviceLimit: user.deviceLimit,
          devicesUsed: activeDeviceCount,
          subscriptionStatus: user.subscriptionStatus,
          hasActiveSubscription,
          planTier: user.planTier,
          subscriptionType: user.subscriptionType,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get devices error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

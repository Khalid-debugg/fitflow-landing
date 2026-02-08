import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '@/lib/db/prisma';
import { checkRateLimit } from '@/lib/utils/rate-limit';
import { signLicenseData } from '@/lib/license/signing';

/**
 * Zod schema for device activation request
 */
const activationSchema = z.object({
  licenseKey: z.string().min(1, 'License key is required'),
  deviceId: z.string().min(1, 'Device ID is required'),
  deviceName: z.string().optional(),
  platform: z.enum(['windows', 'mac', 'linux', 'win32', 'darwin']),
  appVersion: z.string().min(1, 'App version is required'),
});

type ActivationRequest = z.infer<typeof activationSchema>;

/**
 * POST /api/license/activate
 * Activate a device with a license key
 *
 * Hard block policy:
 * - Device limit enforced strictly
 * - No auto-deactivation of old devices
 * - User must manually deactivate from dashboard
 * - Same deviceId cannot re-activate (must deactivate first)
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting: max 5 attempts per hour per IP
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = await checkRateLimit(ip, 'license-activation', 5, 3600);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many activation attempts. Try again in ${Math.ceil(rateLimitResult.retryAfter / 60)} minutes.`,
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = activationSchema.safeParse(body);

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

    const { licenseKey, deviceId, deviceName, platform, appVersion }: ActivationRequest = validationResult.data;

    // Normalize platform names (win32 -> windows, darwin -> mac)
    const normalizedPlatform = platform === 'win32' ? 'windows' : platform === 'darwin' ? 'mac' : platform;

    // Find user by license key
    const user = await prisma.user.findUnique({
      where: { licenseKey },
      include: {
        ActivatedDevice: {
          orderBy: { lastValidatedAt: 'asc' },
        },
      },
    });

    // Check if license key exists
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid license key',
        },
        { status: 401 }
      );
    }

    // Check if user's email is verified
    if (!user.emailVerified) {
      return NextResponse.json(
        {
          success: false,
          message: 'Please verify your email before activating devices',
        },
        { status: 403 }
      );
    }

    // Check subscription status
    if (user.subscriptionStatus === 'expired' || user.subscriptionStatus === 'cancelled') {
      return NextResponse.json(
        {
          success: false,
          message: 'Your subscription has expired. Please renew to activate devices.',
        },
        { status: 403 }
      );
    }
    
    // Check if trial has expired
    if (user.subscriptionStatus === 'trial' && new Date() > user.trialEndAt) {
      return NextResponse.json(
        {
          success: false,
          message: 'Your trial has expired. Please upgrade to continue using FitFlow.',
        },
        { status: 403 }
      );
    }

    // Check if this device already exists (active or inactive)
    const existingDevice = user.ActivatedDevice.find((device) => device.deviceId === deviceId);
    const activeDeviceCount = user.ActivatedDevice.filter((device) => device.isActive).length;

    if (existingDevice) {
      // If device exists but is inactive, reactivate it
      if (!existingDevice.isActive) {
        const reactivatedDevice = await prisma.activatedDevice.update({
          where: { id: existingDevice.id },
          data: {
            isActive: true,
            lastValidatedAt: new Date(),
            deviceName: deviceName || existingDevice.deviceName,
            platform: normalizedPlatform,
            appVersion
          }
        });

        // Generate signed license data for offline validation
        const signedLicense = signLicenseData({
          licenseKey: user.licenseKey!,
          deviceId: reactivatedDevice.deviceId,
          trialEndsAt: reactivatedDevice.trialEndsAt,
          subscriptionStatus: user.subscriptionStatus,
        });

        return NextResponse.json(
          {
            success: true,
            message: 'Device reactivated successfully',
            data: {
              deviceId: reactivatedDevice.deviceId,
              deviceName: reactivatedDevice.deviceName,
              activatedAt: reactivatedDevice.activatedAt.toISOString(),
              devicesUsed: activeDeviceCount + 1,
              deviceLimit: user.deviceLimit,
              trialEndsAt: reactivatedDevice.trialEndsAt?.toISOString() || null,
              trialUsed: reactivatedDevice.trialUsed,
              subscriptionStatus: user.subscriptionStatus,
              isTrialActive: reactivatedDevice.trialEndsAt ? new Date() < reactivatedDevice.trialEndsAt : false,
              signedLicense,
            },
          },
          { status: 200 }
        );
      }

      // Device is already active, just update last validated timestamp
      await prisma.activatedDevice.update({
        where: { id: existingDevice.id },
        data: { lastValidatedAt: new Date() }
      });

      // Generate signed license data for offline validation
      const signedLicense = signLicenseData({
        licenseKey: user.licenseKey!,
        deviceId: existingDevice.deviceId,
        trialEndsAt: existingDevice.trialEndsAt,
        subscriptionStatus: user.subscriptionStatus,
      });

      return NextResponse.json(
        {
          success: true,
          message: 'Device already activated',
          data: {
            deviceId: existingDevice.deviceId,
            deviceName: existingDevice.deviceName,
            activatedAt: existingDevice.activatedAt.toISOString(),
            devicesUsed: activeDeviceCount,
            deviceLimit: user.deviceLimit,
            trialEndsAt: existingDevice.trialEndsAt?.toISOString() || null,
            trialUsed: existingDevice.trialUsed,
            subscriptionStatus: user.subscriptionStatus,
            isTrialActive: existingDevice.trialEndsAt ? new Date() < existingDevice.trialEndsAt : false,
            signedLicense,
          },
        },
        { status: 200 }
      );
    }
    

    // Check device limit (HARD BLOCK)
    if (activeDeviceCount >= user.deviceLimit) {
      return NextResponse.json(
        {
          success: false,
          message: `Device limit reached (${activeDeviceCount}/${user.deviceLimit}). Please deactivate a device from your dashboard to activate a new one.`,
          dashboardUrl: `${process.env.NEXTAUTH_URL || 'https://fitflow.com'}/dashboard`,
          devicesUsed: activeDeviceCount,
          deviceLimit: user.deviceLimit,
        },
        { status: 403 }
      );
    }

    // Calculate trial dates - 30 days from activation
    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Activate the device
    const activatedDevice = await prisma.activatedDevice.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        deviceId,
        deviceName: deviceName || null,
        platform: normalizedPlatform,
        appVersion,
        isActive: true,
        trialStartedAt: now,
        trialEndsAt: trialEndsAt,
        trialUsed: true, // Mark trial as used for this device
      },
    });

    // Generate signed license data for offline validation
    const signedLicense = signLicenseData({
      licenseKey: user.licenseKey!,
      deviceId: activatedDevice.deviceId,
      trialEndsAt: activatedDevice.trialEndsAt,
      subscriptionStatus: user.subscriptionStatus,
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Device activated successfully! 30-day trial started.',
        data: {
          deviceId: activatedDevice.deviceId,
          deviceName: activatedDevice.deviceName,
          activatedAt: activatedDevice.activatedAt.toISOString(),
          devicesUsed: activeDeviceCount + 1,
          deviceLimit: user.deviceLimit,
          trialEndsAt: activatedDevice.trialEndsAt?.toISOString(),
          trialUsed: activatedDevice.trialUsed,
          subscriptionStatus: user.subscriptionStatus,
          isTrialActive: true,
          signedLicense, // For offline validation
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Device activation error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

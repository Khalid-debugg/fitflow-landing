import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

/**
 * Zod schema for device deactivation request
 */
const deactivationSchema = z.object({
  deviceId: z.string().min(1, 'Device ID is required'),
  licenseKey: z.string().optional(), // Optional for backward compatibility with web dashboard
});

type DeactivationRequest = z.infer<typeof deactivationSchema>;

/**
 * POST /api/license/deactivate
 * Deactivate a device
 * - Can be called from desktop app with licenseKey + deviceId
 * - Can be called from web dashboard with session authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = deactivationSchema.safeParse(body);

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

    const { deviceId, licenseKey }: DeactivationRequest = validationResult.data;

    let user;

    // Check if licenseKey is provided (desktop app authentication)
    if (licenseKey) {
      user = await prisma.user.findUnique({
        where: { licenseKey },
      });

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            message: 'Invalid license key',
          },
          { status: 404 }
        );
      }
    } else {
      // Fall back to session authentication (web dashboard)
      const session = await auth();

      if (!session || !session.user?.email) {
        return NextResponse.json(
          {
            success: false,
            message: 'Authentication required. Provide either licenseKey or valid session.',
          },
          { status: 401 }
        );
      }

      user = await prisma.user.findUnique({
        where: { email: session.user.email },
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
    }

    // Find the device
    const device = await prisma.activatedDevice.findFirst({
      where: {
        userId: user.id,
        deviceId,
        isActive: true,
      },
    });

    if (!device) {
      return NextResponse.json(
        {
          success: false,
          message: 'Device not found or already deactivated',
        },
        { status: 404 }
      );
    }

    // Deactivate the device
    await prisma.activatedDevice.update({
      where: { id: device.id },
      data: { isActive: false },
    });

    // Get updated device count
    const activeDeviceCount = await prisma.activatedDevice.count({
      where: {
        userId: user.id,
        isActive: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Device deactivated successfully',
        data: {
          deviceId: device.deviceId,
          deviceName: device.deviceName,
          devicesUsed: activeDeviceCount,
          deviceLimit: user.deviceLimit,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Device deactivation error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

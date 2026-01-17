import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

/**
 * Zod schema for device deactivation request
 */
const deactivationSchema = z.object({
  deviceId: z.string().min(1, 'Device ID is required'),
});

type DeactivationRequest = z.infer<typeof deactivationSchema>;

/**
 * POST /api/license/deactivate
 * Deactivate a device (requires authentication)
 * Users can deactivate their own devices from the dashboard
 */
export async function POST(request: NextRequest) {
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

    const { deviceId }: DeactivationRequest = validationResult.data;

    // Find user
    const user = await prisma.user.findUnique({
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

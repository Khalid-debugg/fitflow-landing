import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { checkRateLimit } from '@/lib/utils/rate-limit'

/**
 * Zod schema for backup list request
 */
const listSchema = z.object({
  licenseKey: z.string().min(1, 'License key is required'),
  deviceId: z.string().min(1, 'Device ID is required'),
})

type ListRequest = z.infer<typeof listSchema>

/**
 * POST /api/backups/list
 * Get list of backups for authenticated user/device
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting: max 60 list requests per hour per IP
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rateLimitResult = await checkRateLimit(ip, 'backup-list', 60, 3600)

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many requests. Try again in ${Math.ceil(rateLimitResult.retryAfter / 60)} minutes.`,
        },
        { status: 429 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = listSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid request data',
          errors: validationResult.error.errors,
        },
        { status: 400 }
      )
    }

    const { licenseKey, deviceId }: ListRequest = validationResult.data

    // Find user by license key
    const user = await prisma.user.findUnique({
      where: { licenseKey },
      include: {
        ActivatedDevice: {
          where: {
            deviceId,
            isActive: true,
          },
        },
      },
    })

    // Check if license key exists
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid license key',
        },
        { status: 401 }
      )
    }

    // Check if device is activated
    const device = user.ActivatedDevice[0]
    if (!device) {
      return NextResponse.json(
        {
          success: false,
          message: 'Device not activated with this license',
        },
        { status: 403 }
      )
    }

    // Get all backups for this user (across all devices)
    const backups = await prisma.backup.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        deviceId: true,
        deviceName: true,
        fileName: true,
        fileSize: true,
        checksum: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          backups: backups.map((backup) => ({
            id: backup.id,
            deviceId: backup.deviceId,
            deviceName: backup.deviceName,
            fileName: backup.fileName,
            fileSize: backup.fileSize,
            checksum: backup.checksum,
            createdAt: backup.createdAt.toISOString(),
            isCurrentDevice: backup.deviceId === deviceId,
          })),
          totalCount: backups.length,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Backup list error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

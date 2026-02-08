import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

/**
 * List all cloud backups for a user (web dashboard version)
 * Only requires license key, returns all backups across all devices
 * Supports pagination, filtering by deviceId, and sorting
 */
export async function POST(request: NextRequest) {
  try {
    const { licenseKey, page = 1, limit = 5, deviceId, sortOrder = 'desc' } = await request.json()

    if (!licenseKey) {
      return NextResponse.json(
        {
          success: false,
          message: 'License key is required'
        },
        { status: 400 }
      )
    }

    // Find user by license key
    const user = await prisma.user.findUnique({
      where: { licenseKey }
    })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid license key'
        },
        { status: 403 }
      )
    }

    // Build where clause
    const whereClause: { userId: string; deviceId?: string } = {
      userId: user.id
    }

    // Add device filter if provided
    if (deviceId && deviceId !== 'all') {
      whereClause.deviceId = deviceId
    }

    // Get total count for pagination
    const totalCount = await prisma.backup.count({
      where: whereClause
    })

    // Calculate pagination
    const skip = (page - 1) * limit
    const totalPages = Math.ceil(totalCount / limit)

    // Get paginated backups
    const backups = await prisma.backup.findMany({
      where: whereClause,
      orderBy: {
        createdAt: sortOrder === 'asc' ? 'asc' : 'desc'
      },
      skip,
      take: limit
    })

    // Get unique devices for filter dropdown
    const devices = await prisma.backup.findMany({
      where: {
        userId: user.id
      },
      select: {
        deviceId: true,
        deviceName: true
      },
      distinct: ['deviceId']
    })

    // Format backups for response (we can't determine isCurrentDevice from web)
    const formattedBackups = backups.map((backup) => ({
      id: backup.id,
      deviceId: backup.deviceId,
      deviceName: backup.deviceName || 'Unknown Device',
      fileName: backup.fileName,
      fileSize: backup.fileSize,
      checksum: backup.checksum,
      createdAt: backup.createdAt.toISOString(),
      isCurrentDevice: false // Can't determine from web dashboard
    }))

    return NextResponse.json({
      success: true,
      data: {
        backups: formattedBackups,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        },
        devices: devices.map(d => ({
          deviceId: d.deviceId,
          deviceName: d.deviceName || 'Unknown Device'
        }))
      }
    })
  } catch (error) {
    console.error('List backups error (web):', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to list backups'
      },
      { status: 500 }
    )
  }
}

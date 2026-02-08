import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { checkRateLimit } from '@/lib/utils/rate-limit'
import { supabase } from '@/lib/supabase'

/**
 * Zod schema for backup delete request
 */
const deleteSchema = z.object({
  licenseKey: z.string().min(1, 'License key is required'),
  deviceId: z.string().min(1, 'Device ID is required'),
  backupId: z.string().min(1, 'Backup ID is required'),
})

type DeleteRequest = z.infer<typeof deleteSchema>

/**
 * POST /api/backups/delete
 * Delete a backup file
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting: max 30 deletes per hour per IP
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rateLimitResult = await checkRateLimit(ip, 'backup-delete', 30, 3600)

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many delete attempts. Try again in ${Math.ceil(rateLimitResult.retryAfter / 60)} minutes.`,
        },
        { status: 429 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = deleteSchema.safeParse(body)

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

    const { licenseKey, deviceId, backupId }: DeleteRequest = validationResult.data

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

    // Find the backup
    const backup = await prisma.backup.findUnique({
      where: { id: backupId },
    })

    if (!backup) {
      return NextResponse.json(
        {
          success: false,
          message: 'Backup not found',
        },
        { status: 404 }
      )
    }

    // Verify backup belongs to this user
    if (backup.userId !== user.id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized access to backup',
        },
        { status: 403 }
      )
    }

    // Extract storage path from fileUrl
    // Assuming fileUrl format: https://[project].supabase.co/storage/v1/object/public/backups/[path]
    const urlParts = backup.fileUrl.split('/backups/')
    if (urlParts.length > 1) {
      const storagePath = urlParts[1]

      // Delete file from Supabase Storage
      const { error: deleteError } = await supabase.storage
        .from('backups')
        .remove([storagePath])

      if (deleteError) {
        console.error('Supabase storage delete error:', deleteError)
        // Continue even if file doesn't exist in storage
      }
    }

    // Delete the backup record from database
    await prisma.backup.delete({
      where: { id: backupId },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Backup deleted successfully',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Backup delete error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

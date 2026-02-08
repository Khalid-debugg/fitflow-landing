import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db/prisma'
import { checkRateLimit } from '@/lib/utils/rate-limit'
import { createHash } from 'crypto'
import { supabase } from '@/lib/supabase'

/**
 * Zod schema for backup upload request
 */
const uploadSchema = z.object({
  licenseKey: z.string().min(1, 'License key is required'),
  deviceId: z.string().min(1, 'Device ID is required'),
  deviceName: z.string().optional(),
  fileName: z.string().min(1, 'File name is required'),
})

// Maximum file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024

/**
 * POST /api/backups/upload
 * Upload a backup file to the cloud
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting: max 20 uploads per hour per IP
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rateLimitResult = await checkRateLimit(ip, 'backup-upload', 20, 3600)

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many upload attempts. Try again in ${Math.ceil(rateLimitResult.retryAfter / 60)} minutes.`,
        },
        { status: 429 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const licenseKey = formData.get('licenseKey') as string
    const deviceId = formData.get('deviceId') as string
    const deviceName = formData.get('deviceName') as string | null
    const fileName = formData.get('fileName') as string

    // Validate required fields
    const validationResult = uploadSchema.safeParse({
      licenseKey,
      deviceId,
      deviceName: deviceName || undefined,
      fileName,
    })

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

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: 'No file provided',
        },
        { status: 400 }
      )
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: 'File size exceeds 50MB limit',
        },
        { status: 413 }
      )
    }

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

    // Read file buffer and calculate checksum
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const checksum = createHash('sha256').update(buffer).digest('hex')

    // Generate unique file name with timestamp
    const timestamp = new Date().getTime()
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
    const uniqueFileName = `${timestamp}-${sanitizedFileName}`

    // Upload to Supabase Storage
    // Path structure: userId/deviceId/uniqueFileName
    const storagePath = `${user.id}/${deviceId}/${uniqueFileName}`

    const { error: uploadError } = await supabase.storage
      .from('backups')
      .upload(storagePath, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to upload backup to storage',
        },
        { status: 500 }
      )
    }

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('backups')
      .getPublicUrl(storagePath)

    // Store backup metadata in database
    const backup = await prisma.backup.create({
      data: {
        userId: user.id,
        deviceId,
        deviceName: deviceName || device.deviceName || 'Unknown Device',
        fileName: sanitizedFileName,
        fileSize: file.size,
        fileUrl: urlData.publicUrl,
        checksum,
      },
    })

    // Keep only the 10 most recent backups per device
    const allBackups = await prisma.backup.findMany({
      where: {
        userId: user.id,
        deviceId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Delete old backups if more than 10
    if (allBackups.length > 10) {
      const backupsToDelete = allBackups.slice(10)
      for (const oldBackup of backupsToDelete) {
        // Extract storage path from fileUrl
        // Assuming fileUrl format: https://[project].supabase.co/storage/v1/object/public/backups/[path]
        const urlParts = oldBackup.fileUrl.split('/backups/')
        if (urlParts.length > 1) {
          const storagePath = urlParts[1]
          // Delete from Supabase Storage
          await supabase.storage.from('backups').remove([storagePath])
        }

        // Delete from database
        await prisma.backup.delete({
          where: { id: oldBackup.id },
        })
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Backup uploaded successfully',
        data: {
          id: backup.id,
          fileName: backup.fileName,
          fileSize: backup.fileSize,
          checksum: backup.checksum,
          createdAt: backup.createdAt.toISOString(),
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Backup upload error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    )
  }
}

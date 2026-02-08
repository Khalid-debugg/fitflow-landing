import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { supabase } from '@/lib/supabase'

/**
 * Download backup from cloud (web dashboard version)
 * Only requires license key and backup ID
 */
export async function POST(request: NextRequest) {
  try {
    const { licenseKey, backupId } = await request.json()

    if (!licenseKey || !backupId) {
      return NextResponse.json(
        {
          success: false,
          message: 'License key and backup ID are required'
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

    // Find backup and verify ownership
    const backup = await prisma.backup.findFirst({
      where: {
        id: backupId,
        userId: user.id
      }
    })

    if (!backup) {
      return NextResponse.json(
        {
          success: false,
          message: 'Backup not found'
        },
        { status: 404 }
      )
    }

    // Extract storage path from fileUrl
    const urlParts = backup.fileUrl.split('/backups/')
    if (urlParts.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid backup file URL'
        },
        { status: 500 }
      )
    }

    const storagePath = urlParts[1]

    // Download file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('backups')
      .download(storagePath)

    if (downloadError || !fileData) {
      console.error('Supabase download error:', downloadError)
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to download backup from storage'
        },
        { status: 404 }
      )
    }

    // Convert Blob to Buffer
    const arrayBuffer = await fileData.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${backup.fileName}"`,
        'Content-Length': buffer.length.toString()
      }
    })
  } catch (error) {
    console.error('Download backup error (web):', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to download backup'
      },
      { status: 500 }
    )
  }
}

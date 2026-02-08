import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { supabase } from '@/lib/supabase'

/**
 * Delete cloud backup (web dashboard version)
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
    if (urlParts.length > 1) {
      const storagePath = urlParts[1]

      // Delete file from Supabase Storage
      const { error: deleteError } = await supabase.storage
        .from('backups')
        .remove([storagePath])

      if (deleteError) {
        console.error('Supabase storage delete error:', deleteError)
      } else {
        console.log('Deleted backup file from Supabase Storage:', storagePath)
      }
    }

    // Delete from database
    await prisma.backup.delete({
      where: { id: backup.id }
    })

    console.log('Deleted backup from database:', backup.id)

    return NextResponse.json({
      success: true,
      message: 'Backup deleted successfully'
    })
  } catch (error) {
    console.error('Delete backup error (web):', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete backup'
      },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/dev/recent-signups
 * Shows recent signups with verification links (DEVELOPMENT ONLY)
 */
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  try {
    // Get recent unverified users
    const users = await prisma.user.findMany({
      where: {
        emailVerified: null,
        verificationToken: { not: null },
      },
      select: {
        id: true,
        email: true,
        name: true,
        verificationToken: true,
        verificationTokenExpiry: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    const usersWithLinks = users.map((user) => ({
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
      tokenExpiry: user.verificationTokenExpiry?.toISOString(),
      verificationLink: `${baseUrl}/api/user/verify-email?token=${user.verificationToken}`,
      isExpired: user.verificationTokenExpiry
        ? new Date() > user.verificationTokenExpiry
        : false,
    }));

    return NextResponse.json(
      {
        success: true,
        count: usersWithLinks.length,
        users: usersWithLinks,
        note: 'Click the verificationLink to verify an account manually',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching recent signups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent signups' },
      { status: 500 }
    );
  }
}

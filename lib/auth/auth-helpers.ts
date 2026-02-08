import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';

/**
 * Get the current authenticated user session
 * Returns null if not authenticated
 */
export async function getServerSession() {
  return await auth();
}

/**
 * Get the current user from database
 * Returns null if not authenticated
 */
export async function getServerUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      emailVerified: true,
      language: true,
      preferredCurrency: true,
      detectedCountry: true,
      trialStartAt: true,
      trialEndAt: true,
      subscriptionStatus: true,
      subscriptionType: true,
      planTier: true,
      deviceLimit: true,
      licenseKey: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}

/**
 * Require authentication - redirect to signin if not authenticated
 * Use this in server components and route handlers
 */
export async function requireAuth(redirectTo: string = '/auth/signin') {
  const session = await auth();

  if (!session?.user) {
    redirect(redirectTo as any);
  }

  return session;
}

/**
 * Require verified email - redirect if email not verified
 */
export async function requireVerifiedEmail(
  redirectTo: string = '/auth/verify-email'
) {
  const user = await getServerUser();

  if (!user) {
    redirect('/auth/signin' as any);
  }

  if (!user.emailVerified) {
    redirect(redirectTo as any);
  }

  return user;
}

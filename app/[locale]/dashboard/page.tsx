import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { getTranslations } from 'next-intl/server'
import { Header } from '@/components/landing/Header'
import { DashboardContent } from '@/components/dashboard/DashboardContent'

export default async function DashboardPage({
  params,
}: {
  params: { locale: string };
}) {
  // Get current session
  const session = await auth()

  // Redirect to signin if not authenticated
  if (!session?.user?.email) {
    redirect(`/${params.locale}/auth/signin` as any)
  }

  // Fetch user details including license key and devices
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      emailVerified: true,
      licenseKey: true,
      subscriptionStatus: true,
      subscriptionType: true,
      planTier: true,
      trialStartAt: true,
      trialEndAt: true,
      deviceLimit: true,
      ActivatedDevice: {
        where: { isActive: true },
        orderBy: { activatedAt: 'desc' }
      }
    }
  })

  const t = await getTranslations('dashboard')

  if (!user || !user.licenseKey) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header
          user={user ? {
            name: user.name,
            email: user.email
          } : null}
        />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">{t('error')}</h1>
            <p className="text-muted-foreground">
              {t('errorMessage')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Calculate trial days remaining
  const trialDaysRemaining =
    user.subscriptionStatus === 'trial'
      ? Math.max(
          0,
          Math.ceil(
            (user.trialEndAt.getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0

  // Process devices
  const now = new Date()
  const devicesWithTrialStatus = user.ActivatedDevice.map((device) => {
    const isTrialActive = device.trialEndsAt ? now < device.trialEndsAt : false
    const isTrialExpired = device.trialEndsAt ? now >= device.trialEndsAt : false

    let trialDaysRemaining = 0
    if (device.trialEndsAt && isTrialActive) {
      const msRemaining = device.trialEndsAt.getTime() - now.getTime()
      trialDaysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24))
    }

    return {
      ...device,
      activatedAt: device.activatedAt.toISOString(),
      lastValidatedAt: device.lastValidatedAt.toISOString(),
      trialStartedAt: device.trialStartedAt?.toISOString() || null,
      trialEndsAt: device.trialEndsAt?.toISOString() || null,
      isTrialActive,
      isTrialExpired,
      trialDaysRemaining
    }
  })

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/20">
      <Header
        user={{
          name: user.name,
          email: user.email
        }}
      />
      <DashboardContent
        user={{
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          licenseKey: user.licenseKey,
          subscriptionStatus: user.subscriptionStatus,
          planTier: user.planTier,
          deviceLimit: user.deviceLimit,
          trialDaysRemaining
        }}
        devices={devicesWithTrialStatus}
      />
    </div>
  )
}

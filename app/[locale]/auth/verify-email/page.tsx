'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Loader2, CheckCircle2, Mail, PartyPopper } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

type VerificationStatus = 'verifying' | 'success' | 'error'

export default function VerifyEmailPage() {
  const t = useTranslations('auth.verifyEmail')
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<VerificationStatus>('verifying')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error')
        setErrorMessage(t('error.invalidToken'))
        return
      }

      try {
        const res = await fetch(`/api/user/verify-email?token=${encodeURIComponent(token)}`)
        const data = await res.json()

        if (!res.ok) {
          setStatus('error')
          if (res.status === 400) {
            setErrorMessage(t('error.invalidToken'))
          } else if (data.message?.includes('already verified')) {
            setErrorMessage(t('error.alreadyVerified'))
          } else {
            setErrorMessage(t('error.serverError'))
          }
          return
        }

        setStatus('success')
      } catch {
        setStatus('error')
        setErrorMessage(t('error.serverError'))
      }
    }

    verifyEmail()
  }, [token, t])

  // Verifying state
  if (status === 'verifying') {
    return (
      <AuthLayout
        brandTitle={t('title')}
        brandDescription={t('verifying')}
        showBrandPanel={false}
      >
        <div className="text-center space-y-6 animate-in fade-in duration-500">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{t('title')}</h1>
            <p className="text-muted-foreground">{t('verifying')}</p>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </AuthLayout>
    )
  }

  // Success state
  if (status === 'success') {
    return (
      <AuthLayout
        brandTitle={t('success.title')}
        brandDescription={t('success.welcome')}
        showBrandPanel={false}
      >
        <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
          {/* Success Icon with Animation */}
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-green-100 dark:bg-green-900/20 animate-ping opacity-75" />
            <div className="relative w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
          </div>

          {/* Success Content */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-bold">{t('success.title')}</h1>
              <PartyPopper className="w-6 h-6 text-yellow-500" />
            </div>
            <p className="text-muted-foreground">{t('success.message')}</p>
          </div>

          {/* Welcome Message */}
          <Alert variant="success" className="text-left">
            <Mail className="h-4 w-4" />
            <AlertTitle className="text-base font-semibold">
              {t('success.welcome')}
            </AlertTitle>
            <AlertDescription className="text-sm">
              {t('success.message')}
            </AlertDescription>
          </Alert>

          {/* Sign In Button */}
          <Button asChild className="w-full" size="lg">
            <Link href="/auth/signin">{t('success.signIn')}</Link>
          </Button>

          {/* Decorative Elements */}
          <div className="flex items-center justify-center gap-8 pt-4 opacity-50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <div className="w-3 h-3 rounded-full bg-accent" />
              <div className="w-2 h-2 rounded-full bg-accent" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <div className="w-3 h-3 rounded-full bg-primary" />
            </div>
          </div>
        </div>
      </AuthLayout>
    )
  }

  // Error state
  return (
    <AuthLayout
      brandTitle={t('error.title')}
      brandDescription={errorMessage}
      showBrandPanel={false}
    >
      <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Error Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>

        {/* Error Content */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{t('error.title')}</h1>
          <p className="text-muted-foreground">{errorMessage}</p>
        </div>

        {/* Error Alert */}
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>

        {/* Actions */}
        <div className="space-y-2">
          <Button asChild className="w-full">
            <Link href="/auth/signup">{t('error.requestNew')}</Link>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/auth/signin">Go to Sign In</Link>
          </Button>
        </div>
      </div>
    </AuthLayout>
  )
}

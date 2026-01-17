'use client'

import { useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Mail, X, Loader2, CheckCircle2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface VerificationBannerProps {
  email: string
  onDismiss?: () => void
}

export function VerificationBanner({ email, onDismiss }: VerificationBannerProps) {
  const t = useTranslations('auth.verification')
  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendError, setResendError] = useState<string | null>(null)
  const [isDismissed, setIsDismissed] = useState(false)

  const handleResend = async () => {
    setIsResending(true)
    setResendError(null)
    setResendSuccess(false)

    try {
      const res = await fetch('/api/user/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to resend verification email')
      }

      setResendSuccess(true)
      setTimeout(() => setResendSuccess(false), 5000)
    } catch (error) {
      setResendError(error instanceof Error ? error.message : 'Failed to resend email')
    } finally {
      setIsResending(false)
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss?.()
  }

  if (isDismissed) return null

  return (
    <Alert className="relative border-amber-500/50 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-100">
      <Mail className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertTitle className="flex items-center justify-between pr-6">
        <span>Verify your email address</span>
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-amber-100 dark:hover:bg-amber-900"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertTitle>
      <AlertDescription className="space-y-3">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          A verification email has been sent to <strong>{email}</strong>.
          Please check your inbox and click the verification link to activate your account.
        </p>

        {resendSuccess ? (
          <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>Verification email sent! Check your inbox.</span>
          </div>
        ) : resendError ? (
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
            <X className="h-4 w-4" />
            <span>{resendError}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-amber-700 dark:text-amber-300">
              Didn&apos;t receive it?
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResend}
              disabled={isResending}
              className="h-8 border-amber-300 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Sending...
                </>
              ) : (
                'Resend email'
              )}
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  )
}

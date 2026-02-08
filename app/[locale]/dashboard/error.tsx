'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { Link } from '@/i18n/routing'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('errors')

  useEffect(() => {
    // Log error to error reporting service
    console.error('Dashboard error:', error)
  }, [error])

  // Check if this is a database connection error
  const isDatabaseError =
    error.message.includes('database') ||
    error.message.includes('Can\'t reach database') ||
    error.message.includes('PrismaClient') ||
    error.message.includes('connection')

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-2xl px-4">
        <div className="rounded-lg border bg-card p-8 shadow-lg">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold">
                {isDatabaseError ? t('database.title') : t('general.title')}
              </h1>
              <p className="text-muted-foreground">
                {isDatabaseError ? t('database.message') : t('general.message')}
              </p>
            </div>

            <div className="w-full space-y-3 pt-4">
              <Button
                onClick={reset}
                className="w-full"
                size="lg"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {isDatabaseError ? t('database.tryAgain') : t('database.tryAgain')}
              </Button>

              <Link href="/" className="block">
                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Home className="mr-2 h-4 w-4" />
                  {t('actions.goHome')}
                </Button>
              </Link>

              <p className="text-xs text-muted-foreground">
                {t('actions.contactSupport')}
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details className="w-full mt-4 text-left">
                <summary className="cursor-pointer text-sm font-medium">
                  {t('actions.technicalDetails')} (Development Only)
                </summary>
                <pre className="mt-2 text-xs bg-muted p-4 rounded overflow-auto max-h-60">
                  {error.message}
                  {error.stack && `\n\n${error.stack}`}
                </pre>
              </details>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

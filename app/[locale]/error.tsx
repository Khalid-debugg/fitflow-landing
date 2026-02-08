'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { Link } from '@/i18n/routing'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('errors')

  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  const isDatabaseError =
    error.message.includes('database') ||
    error.message.includes('Can\'t reach database') ||
    error.message.includes('PrismaClient') ||
    error.message.includes('connection') ||
    error.message.toLowerCase().includes('econnrefused')

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
          <div className="container max-w-2xl">
            <div className="rounded-lg border bg-card p-8 shadow-lg">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="rounded-full bg-destructive/10 p-3">
                  <AlertCircle className="h-10 w-10 text-destructive" />
                </div>

                <div className="space-y-2">
                  <h1 className="text-2xl font-bold">
                    {isDatabaseError ? t('database.title') : t('general.applicationError')}
                  </h1>
                  <p className="text-muted-foreground">
                    {isDatabaseError ? t('database.message') : t('general.message')}
                  </p>
                </div>

                <div className="w-full space-y-3 pt-4">
                  <Button onClick={reset} className="w-full" size="lg">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {t('database.retry')}
                  </Button>

                  <Link href="/">
                    <Button variant="outline" className="w-full" size="lg">
                      <Home className="mr-2 h-4 w-4" />
                      {t('actions.goHome')}
                    </Button>
                  </Link>

                  {isDatabaseError && (
                    <p className="text-sm text-muted-foreground pt-2">
                      {t('database.supabaseNote')}
                    </p>
                  )}
                </div>

                {process.env.NODE_ENV === 'development' && (
                  <details className="w-full mt-4 text-left">
                    <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                      {t('actions.technicalDetails')}
                    </summary>
                    <div className="mt-2 p-4 bg-muted rounded text-xs space-y-2">
                      <div>
                        <strong>Error:</strong> {error.message}
                      </div>
                      {error.digest && (
                        <div>
                          <strong>Digest:</strong> {error.digest}
                        </div>
                      )}
                      {error.stack && (
                        <pre className="mt-2 overflow-auto max-h-60 text-[10px]">
                          {error.stack}
                        </pre>
                      )}
                    </div>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}

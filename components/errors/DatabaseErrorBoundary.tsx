'use client'

import { Component, ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

// Wrapper component to use hooks
function ErrorDisplay({ error, onReset }: { error: Error; onReset: () => void }) {
  const t = useTranslations('errors')

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-2xl px-4">
        <div className="rounded-lg border bg-card p-8 shadow-lg">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold">{t('database.title')}</h1>
              <p className="text-muted-foreground">{t('database.message')}</p>
            </div>

            <div className="w-full space-y-3 pt-4">
              <Button onClick={onReset} className="w-full" size="lg">
                <RefreshCw className="mr-2 h-4 w-4" />
                {t('database.retry')}
              </Button>

              <p className="text-xs text-muted-foreground">
                {t('actions.contactSupport')}
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && error && (
              <details className="w-full mt-4 text-left">
                <summary className="cursor-pointer text-sm font-medium">
                  {t('actions.technicalDetails')} (Development Only)
                </summary>
                <pre className="mt-2 text-xs bg-muted p-4 rounded overflow-auto">
                  {error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export class DatabaseErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    // Log to error reporting service in production
    console.error('Database error caught by boundary:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorDisplay error={this.state.error!} onReset={this.handleReset} />
      )
    }

    return this.props.children
  }
}

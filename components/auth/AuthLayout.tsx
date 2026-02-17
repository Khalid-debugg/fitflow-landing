'use client'

import { ReactNode } from 'react'
import { Link } from '@/i18n/routing'
import { LanguageSelector } from '@/components/LanguageSelector'
import { useTheme } from 'next-themes'
import { Moon, Sun, Dumbbell } from 'lucide-react'

interface AuthLayoutProps {
  children: ReactNode
  brandTitle: string
  brandDescription: string
  brandFeatures?: string[]
  showBrandPanel?: boolean
}

export function AuthLayout({
  children,
  brandTitle,
  brandDescription,
  brandFeatures,
  showBrandPanel = true,
}: AuthLayoutProps) {
  const { theme, setTheme } = useTheme()

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col">
        {/* Header with Logo and Language Selector */}
        <header className="flex items-center justify-between p-4 md:p-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="font-display text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent group-hover:opacity-80 transition-opacity">
              Dumbbellflow
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <LanguageSelector />
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </button>
          </div>
        </header>

        {/* Form Content */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-6">
          <div className="w-full max-w-md">{children}</div>
        </div>

        {/* Footer */}
        <footer className="p-4 md:p-6 text-center text-xs text-muted-foreground">
          <p>© 2026 Dumbbellflow. All rights reserved.</p>
        </footer>
      </div>

      {/* Right Panel - Brand Message (Desktop Only) */}
      {showBrandPanel && (
        <div className="hidden md:flex md:w-[45%] lg:w-[50%] relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
              backgroundSize: '32px 32px'
            }} />
          </div>

          {/* Gradient Orbs */}
          <div className="absolute top-20 right-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-start justify-center p-12 lg:p-16">
            {/* Icon */}
            <div className="mb-8 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <Dumbbell className="w-8 h-8 text-white" />
            </div>

            {/* Text Content */}
            <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4 text-foreground">
              {brandTitle}
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-md leading-relaxed">
              {brandDescription}
            </p>

            {/* Features */}
            {brandFeatures && brandFeatures.length > 0 && (
              <ul className="space-y-3">
                {brandFeatures.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Decorative Element */}
            <div className="absolute bottom-12 right-12 opacity-10">
              <Dumbbell className="w-32 h-32 text-primary" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

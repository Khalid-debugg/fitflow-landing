'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Menu, X, Moon, Sun, User, LayoutDashboard, LogOut } from 'lucide-react'
import { useTheme } from 'next-themes'
import { LanguageSelector } from '@/components/LanguageSelector'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogoutButton } from '@/components/LogoutButton'

interface HeaderProps {
  user?: {
    name: string | null
    email: string
  } | null
}

export function Header({ user }: HeaderProps = {}) {
  const t = useTranslations('landing')
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const isOnDashboard = pathname?.includes('/dashboard')

  const navigation = [
    { name: t('nav.features'), href: '/#features' },
    { name: t('nav.pricing'), href: '/#pricing' },
    { name: t('nav.testimonials'), href: '/#testimonials' },
    { name: t('nav.download'), href: '/download' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2"
        >
          <div className="font-display text-2xl font-black tracking-tight relative group cursor-default" dir='ltr'>
            <span className="relative inline-block bg-gradient-to-r from-primary via-primary/90 to-primary bg-clip-text text-transparent drop-shadow-[0_0_30px_hsl(var(--primary)/0.5)] animate-pulse-subtle">
              Fit
            </span>
            <span className="relative inline-block text-foreground drop-shadow-[0_4px_20px_hsl(var(--foreground)/0.3)] group-hover:drop-shadow-[0_4px_30px_hsl(var(--foreground)/0.5)] transition-all duration-300">
              Flow
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.name}
            </a>
          ))}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {/* Language & Currency Selectors - Desktop */}
          <div className="hidden lg:flex items-center gap-2">
            <LanguageSelector />
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
            aria-label="Toggle theme"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </button>

          {/* Desktop CTA buttons or User Menu */}
          {user ? (
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent text-white font-semibold hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                    {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-semibold">{user.name || t('nav.myAccount')}</span>
                      <span className="text-xs text-muted-foreground font-normal">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {!isOnDashboard && (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        {t('nav.dashboard')}
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <LogoutButton className="cursor-pointer flex items-center gap-2 text-destructive focus:text-destructive w-full">
                      <LogOut className="h-4 w-4" />
                      {t('nav.logout')}
                    </LogoutButton>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Button asChild variant="ghost" size="sm">
                <Link href="/auth/signin">{t('nav.signIn')}</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/signup">{t('nav.startFreeTrial')}</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}

            <div className="pt-4 border-t border-border">
              <div className="grid grid-cols-2 gap-2 mb-4">
                <LanguageSelector />
              </div>
            </div>

            <div className="pt-2 border-t border-border space-y-2">
              {user ? (
                <>
                  <div className="px-2 py-2 mb-2">
                    <div className="font-semibold">{user.name || t('nav.myAccount')}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </div>
                  {!isOnDashboard && (
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link href="/dashboard" className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        {t('nav.dashboard')}
                      </Link>
                    </Button>
                  )}
                  <LogoutButton className="w-full">
                    <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive flex items-center gap-2">
                      <LogOut className="h-4 w-4" />
                      {t('nav.logout')}
                    </Button>
                  </LogoutButton>
                </>
              ) : (
                <>
                  <Button asChild variant="ghost" className="w-full">
                    <Link href="/auth/signin">{t('nav.signIn')}</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/auth/signup">{t('nav.startFreeTrial')}</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

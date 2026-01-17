'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle, Loader2, Check } from 'lucide-react'

export default function SignUpPage() {
  const t = useTranslations('auth.signup')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)

  // Password validation helpers
  const passwordValidation = {
    minLength: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
  }
  const isPasswordValid = Object.values(passwordValidation).every(Boolean)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = t('errors.nameRequired')
    }

    if (!formData.email.trim()) {
      newErrors.email = t('errors.emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('errors.emailInvalid')
    }

    if (!formData.password) {
      newErrors.password = t('errors.passwordRequired')
    } else if (!isPasswordValid) {
      newErrors.password = t('errors.passwordWeak')
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('errors.confirmRequired')
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('errors.passwordMismatch')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const res = await fetch('/api/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 409) {
          setErrors({ email: t('errors.emailExists') })
        } else {
          setErrors({ general: data.message || t('errors.serverError') })
        }
        return
      }

      setSuccess(true)
    } catch {
      setErrors({ general: t('errors.serverError') })
    } finally {
      setIsLoading(false)
    }
  }

  const brandFeatures = [
    t('brandMessage.features.feature1'),
    t('brandMessage.features.feature2'),
    t('brandMessage.features.feature3'),
    t('brandMessage.features.feature4'),
  ]

  if (success) {
    return (
      <AuthLayout
        brandTitle={t('brandMessage.title')}
        brandDescription={t('brandMessage.description')}
        brandFeatures={brandFeatures}
      >
        <div className="text-center space-y-6 animate-in fade-in duration-500">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{t('success.title')}</h1>
            <p className="text-muted-foreground">{t('success.message')}</p>
            <p className="text-sm text-muted-foreground pt-2">
              {t('success.checkEmail', { email: formData.email })}
            </p>
          </div>

          <Button asChild className="w-full">
            <Link href="/auth/signin">{t('signinLink')}</Link>
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      brandTitle={t('brandMessage.title')}
      brandDescription={t('brandMessage.description')}
      brandFeatures={brandFeatures}
    >
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-display font-bold tracking-tight">
            {t('title')}
          </h1>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        {/* Error Alert */}
        {errors.general && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.general}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">{t('name')}</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? 'border-destructive' : ''}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={errors.email ? 'border-destructive' : ''}
              disabled={isLoading}
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">{t('password')}</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              onFocus={() => setPasswordFocused(true)}
              className={errors.password ? 'border-destructive' : ''}
              disabled={isLoading}
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className={errors.confirmPassword ? 'border-destructive' : ''}
              disabled={isLoading}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Password Requirements */}
          {(passwordFocused || formData.password) && (
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-sm font-medium">{t('passwordRequirements.title')}</p>
              <div className="grid grid-cols-2 gap-2">
                <div className={`flex items-center gap-2 text-sm ${passwordValidation.minLength ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                  <Check className={`w-4 h-4 ${passwordValidation.minLength ? 'opacity-100' : 'opacity-30'}`} />
                  <span>{t('passwordRequirements.minLength')}</span>
                </div>
                <div className={`flex items-center gap-2 text-sm ${passwordValidation.uppercase ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                  <Check className={`w-4 h-4 ${passwordValidation.uppercase ? 'opacity-100' : 'opacity-30'}`} />
                  <span>{t('passwordRequirements.uppercase')}</span>
                </div>
                <div className={`flex items-center gap-2 text-sm ${passwordValidation.lowercase ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                  <Check className={`w-4 h-4 ${passwordValidation.lowercase ? 'opacity-100' : 'opacity-30'}`} />
                  <span>{t('passwordRequirements.lowercase')}</span>
                </div>
                <div className={`flex items-center gap-2 text-sm ${passwordValidation.number ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                  <Check className={`w-4 h-4 ${passwordValidation.number ? 'opacity-100' : 'opacity-30'}`} />
                  <span>{t('passwordRequirements.number')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('submitting')}
              </>
            ) : (
              t('submit')
            )}
          </Button>
        </form>

        {/* Sign In Link */}
        <div className="text-center text-sm">
          <span className="text-muted-foreground">{t('hasAccount')} </span>
          <Link
            href="/auth/signin"
            className="font-medium text-primary hover:underline underline-offset-4"
          >
            {t('signinLink')}
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}

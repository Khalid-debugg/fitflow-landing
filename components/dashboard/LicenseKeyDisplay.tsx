'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { useTranslations } from 'next-intl'

interface LicenseKeyDisplayProps {
  licenseKey: string
}

export function LicenseKeyDisplay({ licenseKey }: LicenseKeyDisplayProps) {
  const [copied, setCopied] = useState(false)
  const t = useTranslations('dashboard')

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(licenseKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('licenseKey.title')}</CardTitle>
        <CardDescription>{t('licenseKey.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-muted px-4 py-3 rounded-md font-mono text-sm select-all">
            {licenseKey}
          </div>
          <Button
            onClick={handleCopy}
            variant="outline"
            size="icon"
            className="shrink-0"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          {t('licenseKey.info')}
        </p>
      </CardContent>
    </Card>
  )
}

import { useTranslations } from 'next-intl'

export default function HomePage() {
  const t = useTranslations('home')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          {t('title')}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          {t('subtitle')}
        </p>
        <div className="mt-8">
          <p className="text-sm text-muted-foreground">
            🌍 Multilingual support: English, Arabic, Spanish, Portuguese, French, German
          </p>
        </div>
      </div>
    </div>
  )
}

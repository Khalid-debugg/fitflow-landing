import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'
import { auth } from '@/lib/auth/auth'
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('policies.privacy')

  return {
    title: `${t('title')} - Dumbbellflow`,
    description: t('title'),
  }
}

export default async function PrivacyPage() {
  const session = await auth()
  const t = await getTranslations('policies.privacy')

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={session?.user} />
      <main className="flex-1 container mx-auto px-4 py-12 md:py-20 max-w-3xl">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-2">{t('title')}</h1>
          <p className="text-muted-foreground mb-8">{t('lastUpdated')}</p>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">{t('sections.infoCollect.title')}</h2>
            <p>{t('sections.infoCollect.content')}</p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">{t('sections.howWeUse.title')}</h2>
            <p>{t('sections.howWeUse.content')}</p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">{t('sections.dataSharing.title')}</h2>
            <p>{t('sections.dataSharing.content')}</p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">{t('sections.security.title')}</h2>
            <p>{t('sections.security.content')}</p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">{t('sections.yourRights.title')}</h2>
            <p>{t('sections.yourRights.content')}</p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">{t('sections.cookies.title')}</h2>
            <p>{t('sections.cookies.content')}</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}

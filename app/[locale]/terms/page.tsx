import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'
import { auth } from '@/lib/auth/auth'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('policies.terms')

  return {
    title: `${t('title')} - Dumbbellflow`,
    description: t('title'),
  }
}

export default async function TermsPage() {
  const session = await auth()
  const t = await getTranslations('policies.terms')

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={session?.user} />
      <main className="flex-1 container mx-auto px-4 py-12 md:py-20 max-w-3xl">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-2">{t('title')}</h1>
          <p className="text-muted-foreground mb-8">{t('lastUpdated')}</p>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">{t('sections.acceptance.title')}</h2>
            <p>{t('sections.acceptance.content')}</p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">{t('sections.service.title')}</h2>
            <p>{t('sections.service.content')}</p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">{t('sections.billing.title')}</h2>
            <p>{t('sections.billing.content')}</p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">{t('sections.cancellation.title')}</h2>
            <p>{t('sections.cancellation.content')}</p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">{t('sections.yourData.title')}</h2>
            <p>{t('sections.yourData.content')}</p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">{t('sections.acceptableUse.title')}</h2>
            <p>{t('sections.acceptableUse.content')}</p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">{t('sections.intellectualProperty.title')}</h2>
            <p>{t('sections.intellectualProperty.content')}</p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">{t('sections.liability.title')}</h2>
            <p>{t('sections.liability.content')}</p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">{t('sections.termination.title')}</h2>
            <p>{t('sections.termination.content')}</p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">{t('sections.changes.title')}</h2>
            <p>{t('sections.changes.content')}</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}

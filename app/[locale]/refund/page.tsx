import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'
import { auth } from '@/lib/auth/auth'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('policies.refund')

  return {
    title: `${t('title')} - FitFlow`,
    description: t('title'),
  }
}

export default async function RefundPage() {
  const session = await auth()
  const t = await getTranslations('policies.refund')

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={session?.user} />
      <main className="flex-1 container mx-auto px-4 py-12 md:py-20 max-w-3xl">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-2">{t('title')}</h1>
          <p className="text-muted-foreground mb-8">{t('lastUpdated')}</p>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">{t('sections.guarantee.title')}</h2>
            <p>{t('sections.guarantee.content')}</p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">{t('sections.renewals.title')}</h2>
            <p>{t('sections.renewals.content')}</p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">{t('sections.cancellations.title')}</h2>
            <p>{t('sections.cancellations.content')}</p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">{t('sections.exceptions.title')}</h2>
            <p>{t('sections.exceptions.content')}</p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">{t('sections.howToRequest.title')}</h2>
            <p>{t('sections.howToRequest.content')}</p>
          </section>

          <section className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">{t('sections.dataAfter.title')}</h2>
            <p>{t('sections.dataAfter.content')}</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}

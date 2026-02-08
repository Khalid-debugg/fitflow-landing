import { auth } from '@/lib/auth/auth'
import { Header } from '@/components/landing/Header'
import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { Pricing } from '@/components/landing/Pricing'
import { Testimonials } from '@/components/landing/Testimonials'
import { Footer } from '@/components/landing/Footer'

export default async function HomePage() {
  const session = await auth()

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={session?.user} />
      <main className="flex-1">
        <Hero user={session?.user} />
        <Features />
        <Pricing user={session?.user} />
        <Testimonials />
      </main>
      <Footer />
    </div>
  )
}

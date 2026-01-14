'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Users,
  CreditCard,
  BarChart3,
  Globe,
  Smartphone,
  DollarSign,
} from 'lucide-react'

const features = [
  {
    icon: Users,
    key: 'members',
  },
  {
    icon: CreditCard,
    key: 'payments',
  },
  {
    icon: BarChart3,
    key: 'analytics',
  },
  {
    icon: Globe,
    key: 'multilingual',
  },
  {
    icon: Smartphone,
    key: 'devices',
  },
  {
    icon: DollarSign,
    key: 'currency',
  },
]

export function Features() {
  const t = useTranslations('landing.features')

  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container px-4 mx-auto">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            {t('heading')}
          </h2>
          <p className="text-xl text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card
                key={feature.key}
                className="group hover:shadow-lg hover:border-primary/50 transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">
                    {t(`items.${feature.key}.title`)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {t(`items.${feature.key}.description`)}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            And many more features to help you manage your gym efficiently
          </p>
          <a
            href="#pricing"
            className="text-primary hover:text-primary/80 font-semibold inline-flex items-center gap-2 group"
          >
            View Pricing Plans
            <svg
              className="w-4 h-4 group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}

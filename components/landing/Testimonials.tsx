'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { Quote } from 'lucide-react'

const testimonials = [
  {
    key: 'testimonial1',
    avatar: 'SJ',
    color: 'bg-primary',
  },
  {
    key: 'testimonial2',
    avatar: 'MR',
    color: 'bg-accent',
  },
  {
    key: 'testimonial3',
    avatar: 'EC',
    color: 'bg-secondary',
  },
]

export function Testimonials() {
  const t = useTranslations('landing.testimonials')

  return (
    <section id="testimonials" className="py-24 bg-muted/30">
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

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.key} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 space-y-4">
                {/* Quote icon */}
                <Quote className="w-10 h-10 text-primary/20" />

                {/* Testimonial content */}
                <p className="text-muted-foreground leading-relaxed">
                  &ldquo;{t(`items.${testimonial.key}.content`)}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div
                    className={`w-12 h-12 rounded-full ${testimonial.color} flex items-center justify-center text-white font-semibold`}
                  >
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">
                      {t(`items.${testimonial.key}.name`)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t(`items.${testimonial.key}.role`)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Rating stars */}
        <div className="mt-16 text-center space-y-4">
          <div className="flex justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="w-6 h-6 text-yellow-400 fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
            ))}
          </div>
          <p className="text-muted-foreground">
            Rated 4.9/5 from over 200+ reviews
          </p>
        </div>
      </div>
    </section>
  )
}

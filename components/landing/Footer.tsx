'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { Github, Twitter, Linkedin, Mail } from 'lucide-react'

export function Footer() {
  const t = useTranslations('landing.footer')

  const footerSections = [
    {
      key: 'product',
      links: [
        { key: 'features', href: '#features' },
        { key: 'pricing', href: '#pricing' },
        { key: 'download', href: '/download' },
        { key: 'changelog', href: '/changelog' },
      ],
    },
    {
      key: 'company',
      links: [
        { key: 'about', href: '/about' },
        { key: 'blog', href: '/blog' },
        { key: 'careers', href: '/careers' },
        { key: 'contact', href: '/contact' },
      ],
    },
    {
      key: 'resources',
      links: [
        { key: 'documentation', href: '/docs' },
        { key: 'support', href: '/support' },
        { key: 'api', href: '/docs/api' },
        { key: 'community', href: '/community' },
      ],
    },
    {
      key: 'legal',
      links: [
        { key: 'privacy', href: '/privacy' },
        { key: 'terms', href: '/terms' },
        { key: 'refund', href: '/refund' },
        { key: 'license', href: '/license' },
        { key: 'security', href: '/security' },
      ],
    },
  ]

  const socialLinks = [
    { icon: Twitter, href: 'https://twitter.com/fitflow', label: 'Twitter' },
    { icon: Github, href: 'https://github.com/fitflow', label: 'GitHub' },
    { icon: Linkedin, href: 'https://linkedin.com/company/fitflow', label: 'LinkedIn' },
    { icon: Mail, href: 'mailto:hello@fitflow.com', label: 'Email' },
  ]

  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="container px-4 mx-auto py-12 md:py-16">
        {/* Main footer content */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand column */}
          <div className="col-span-2">
            <Link href="/" className="inline-block mb-4">
              <div className="font-display text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                FitFlow
              </div>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-xs">
              {t('tagline')}
            </p>

            {/* Social links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Footer sections */}
          {footerSections.map((section) => (
            <div key={section.key}>
              <h3 className="font-semibold text-foreground mb-4">
                {t(`sections.${section.key}.title`)}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.key}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                    >
                      {t(`sections.${section.key}.${link.key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {t('copyright')}
          </p>

          {/* Language/Currency selector placeholder - will be added in Phase 9 */}
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Made with ❤️ for gym owners worldwide
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

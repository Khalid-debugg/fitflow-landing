import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'

export const routing = defineRouting({
  // All supported locales
  locales: ['en', 'ar', 'es', 'pt', 'fr', 'de'],

  // Default locale
  defaultLocale: 'en',

  // Locale prefix strategy
  localePrefix: 'as-needed',
})

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)

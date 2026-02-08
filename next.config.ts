import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {
  // Typed routes (moved out of experimental in Next.js 16)
  typedRoutes: true,
}

export default withNextIntl(nextConfig)

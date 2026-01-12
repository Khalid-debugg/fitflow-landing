import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { auth } from '@/lib/auth/auth';
import { NextRequest, NextResponse } from 'next/server';

// Create i18n middleware
const intlMiddleware = createMiddleware(routing);

// Protected routes that require authentication
const protectedRoutes = ['/dashboard'];

// Auth routes (redirect to dashboard if already logged in)
const authRoutes = ['/auth/signin', '/auth/signup'];

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the locale from the pathname
  const pathnameHasLocale = routing.locales.some(
    (locale) =>
      pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // Extract the path without locale
  let pathWithoutLocale = pathname;
  if (pathnameHasLocale) {
    const locale = pathname.split('/')[1];
    pathWithoutLocale = pathname.slice(locale.length + 1) || '/';
  }

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathWithoutLocale.startsWith(route)
  );

  // Check if route is an auth route
  const isAuthRoute = authRoutes.some((route) =>
    pathWithoutLocale.startsWith(route)
  );

  // Get session
  const session = await auth();

  // Redirect to signin if trying to access protected route without auth
  if (isProtectedRoute && !session) {
    const locale = pathnameHasLocale ? pathname.split('/')[1] : routing.defaultLocale;
    const signInUrl = new URL(`/${locale}/auth/signin`, request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Redirect to dashboard if trying to access auth routes while logged in
  if (isAuthRoute && session) {
    const locale = pathnameHasLocale ? pathname.split('/')[1] : routing.defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  // Run i18n middleware
  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames and exclude API routes
  matcher: ['/', '/(ar|de|en|es|fr|pt)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
}

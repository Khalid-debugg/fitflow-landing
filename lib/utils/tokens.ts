import { nanoid } from 'nanoid';

/**
 * Generate a secure random token for email verification or password reset
 * @param length - Length of the token (default: 32)
 * @returns URL-safe random token
 */
export function generateToken(length: number = 32): string {
  return nanoid(length);
}

/**
 * Generate token expiry time
 * @param hours - Hours until expiry (default: 24)
 * @returns Date object for expiry time
 */
export function generateTokenExpiry(hours: number = 24): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + hours);
  return expiry;
}

/**
 * Check if a token has expired
 * @param expiryDate - Token expiry date from database
 * @returns True if token is expired
 */
export function isTokenExpired(expiryDate: Date | null): boolean {
  if (!expiryDate) return true;
  return new Date() > expiryDate;
}

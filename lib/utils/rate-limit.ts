/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or a dedicated rate limiting service
 */

interface RateLimitEntry {
  count: number;
  resetAt: number; // Unix timestamp in milliseconds
}

// In-memory store for rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 10 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter: number; // seconds until reset
}

/**
 * Check if a request should be rate limited
 *
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param action - Action being rate limited (e.g., "license-activation", "login")
 * @param maxRequests - Maximum number of requests allowed
 * @param windowSeconds - Time window in seconds
 * @returns RateLimitResult
 *
 * @example
 * const result = await checkRateLimit('192.168.1.1', 'license-activation', 5, 3600);
 * if (!result.allowed) {
 *   return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
 * }
 */
export async function checkRateLimit(
  identifier: string,
  action: string,
  maxRequests: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const key = `${action}:${identifier}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  // Get existing entry or create new one
  let entry = rateLimitStore.get(key);

  // If entry doesn't exist or window has expired, create new entry
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 1,
      resetAt: now + windowMs,
    };
    rateLimitStore.set(key, entry);

    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: entry.resetAt,
      retryAfter: 0,
    };
  }

  // Increment count
  entry.count++;

  // Check if limit exceeded
  if (entry.count > maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter,
    };
  }

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
    retryAfter: 0,
  };
}

/**
 * Reset rate limit for a specific identifier and action
 * Useful for testing or manual override
 *
 * @param identifier - Unique identifier
 * @param action - Action being rate limited
 */
export function resetRateLimit(identifier: string, action: string): void {
  const key = `${action}:${identifier}`;
  rateLimitStore.delete(key);
}

/**
 * Clear all rate limit entries
 * Useful for testing
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
}

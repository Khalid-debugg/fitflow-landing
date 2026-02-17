/**
 * Currency Detection System
 * Detects user's currency based on IP geolocation
 */

import { CurrencyCode, getCurrencyForCountry, isSupportedCurrency } from "./constants";

const IPAPI_URL = "https://ipapi.co/json/";

export interface GeoLocation {
  country: string; // ISO 3166-1 alpha-2 code (e.g., "EG")
  countryName: string; // Full name (e.g., "Egypt")
  currency: CurrencyCode;
  ip: string;
}

/**
 * Detect user's country and currency from IP address
 *
 * Uses ipapi.co free tier (1,000 requests/day)
 * Falls back to USD if detection fails
 */
export async function detectCurrencyFromIP(
  ipAddress?: string
): Promise<GeoLocation> {
  try {
    // Build URL with IP address if provided, otherwise use requester's IP
    const url = ipAddress ? `https://ipapi.co/${ipAddress}/json/` : IPAPI_URL;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Dumbbellflow-Landing/1.0",
      },
      // Don't cache this request since IP addresses vary
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`IP API error: ${response.status}`);
    }

    const data = await response.json();

    // Check if we hit rate limit
    if (data.error) {
      console.error("IP API error:", data.reason);
      return getFallbackGeoLocation();
    }

    const countryCode = data.country_code || data.country || "US";
    const currency = getCurrencyForCountry(countryCode);

    return {
      country: countryCode,
      countryName: data.country_name || "United States",
      currency,
      ip: data.ip || "unknown",
    };
  } catch (error) {
    console.error("Failed to detect currency from IP:", error);
    return getFallbackGeoLocation();
  }
}

/**
 * Detect currency from request headers (Next.js API route)
 *
 * Extracts IP from x-forwarded-for or x-real-ip headers
 * Falls back to USD if detection fails
 */
export async function detectCurrencyFromRequest(
  headers: Headers
): Promise<GeoLocation> {
  // Try to get IP from headers (Vercel, Cloudflare, etc.)
  const forwardedFor = headers.get("x-forwarded-for");
  const realIp = headers.get("x-real-ip");
  const cfConnectingIp = headers.get("cf-connecting-ip");

  // Get the first IP if multiple are present
  const ipAddress =
    cfConnectingIp ||
    realIp ||
    (forwardedFor ? forwardedFor.split(",")[0].trim() : undefined);

  // Detect using IP address
  return detectCurrencyFromIP(ipAddress);
}

/**
 * Fallback geolocation when detection fails
 * Returns USD as default
 */
function getFallbackGeoLocation(): GeoLocation {
  return {
    country: "US",
    countryName: "United States",
    currency: "USD",
    ip: "unknown",
  };
}

/**
 * Validate and sanitize currency preference
 * Ensures user-provided currency is supported
 */
export function validateCurrencyPreference(
  currency: string | null | undefined
): CurrencyCode {
  if (!currency) {
    return "USD";
  }

  const upperCurrency = currency.toUpperCase();

  return isSupportedCurrency(upperCurrency) ? (upperCurrency as CurrencyCode) : "USD";
}

/**
 * Exchange Rate Management System
 * Fetches rates from exchangerate-api.com and caches them for 24 hours
 */

import { prisma } from "@/lib/db/prisma";
import { CurrencyCode, getSupportedCurrencies } from "./constants";

const EXCHANGE_RATE_API_URL = "https://api.exchangerate-api.com/v4/latest/USD";
const CACHE_TTL_HOURS = 24;

/**
 * Fetch fresh exchange rates from API
 * Returns rates with USD as base (1 USD = X currency)
 */
async function fetchExchangeRates(): Promise<Record<CurrencyCode, number>> {
  try {
    const response = await fetch(EXCHANGE_RATE_API_URL, {
      next: { revalidate: 3600 }, // Cache for 1 hour at Next.js level too
    });

    if (!response.ok) {
      throw new Error(`Exchange rate API error: ${response.status}`);
    }

    const data = await response.json();
    const rates: Record<string, number> = data.rates;

    // Filter to only our supported currencies
    const supportedCurrencies = getSupportedCurrencies();
    const filteredRates: Record<CurrencyCode, number> = { USD: 1.0 } as Record<CurrencyCode, number>;

    supportedCurrencies.forEach((currency) => {
      if (currency === "USD") {
        filteredRates[currency] = 1.0;
      } else if (rates[currency]) {
        filteredRates[currency] = rates[currency];
      }
    });

    return filteredRates;
  } catch (error) {
    console.error("Failed to fetch exchange rates:", error);
    // Fallback: return USD = 1.0
    return { USD: 1.0 } as Record<CurrencyCode, number>;
  }
}

/**
 * Check if cached rates are still valid (less than 24 hours old)
 */
async function areCachedRatesValid(): Promise<boolean> {
  try {
    const latestRate = await prisma.currencyRate.findFirst({
      orderBy: { lastUpdated: "desc" },
      select: { lastUpdated: true },
    });

    if (!latestRate) {
      return false;
    }

    const hoursSinceUpdate =
      (Date.now() - latestRate.lastUpdated.getTime()) / (1000 * 60 * 60);

    return hoursSinceUpdate < CACHE_TTL_HOURS;
  } catch (error) {
    console.error("Error checking cached rates:", error);
    return false;
  }
}

/**
 * Update currency rates in database
 */
async function updateCachedRates(
  rates: Record<CurrencyCode, number>
): Promise<void> {
  try {
    const now = new Date();

    // Use upsert to update or create each rate
    const updatePromises = Object.entries(rates).map(([currency, rate]) =>
      prisma.currencyRate.upsert({
        where: { currency },
        update: {
          rateToUSD: rate,
          lastUpdated: now,
        },
        create: {
          currency,
          rateToUSD: rate,
          lastUpdated: now,
        },
      })
    );

    await Promise.all(updatePromises);
    console.log(`Updated ${updatePromises.length} currency rates in cache`);
  } catch (error) {
    console.error("Failed to update cached rates:", error);
  }
}

/**
 * Get exchange rates from cache
 */
async function getCachedRates(): Promise<Record<CurrencyCode, number> | null> {
  try {
    const rates = await prisma.currencyRate.findMany({
      select: {
        currency: true,
        rateToUSD: true,
      },
    });

    if (rates.length === 0) {
      return null;
    }

    const ratesMap: Record<string, number> = {};
    rates.forEach((rate) => {
      ratesMap[rate.currency] = rate.rateToUSD;
    });

    return ratesMap as Record<CurrencyCode, number>;
  } catch (error) {
    console.error("Error fetching cached rates:", error);
    return null;
  }
}

/**
 * Get exchange rates (lazy loading with 24-hour cache)
 *
 * Flow:
 * 1. Check if cached rates are valid (less than 24 hours old)
 * 2. If valid, return cached rates
 * 3. If not, fetch fresh rates from API
 * 4. Update cache and return fresh rates
 * 5. If API fails, fallback to USD = 1.0
 */
export async function getExchangeRates(): Promise<Record<CurrencyCode, number>> {
  // Check if cached rates are still valid
  const cacheValid = await areCachedRatesValid();

  if (cacheValid) {
    console.log("Using cached exchange rates");
    const cachedRates = await getCachedRates();
    if (cachedRates) {
      return cachedRates;
    }
  }

  // Cache is invalid or doesn't exist, fetch fresh rates
  console.log("Fetching fresh exchange rates from API");
  const freshRates = await fetchExchangeRates();

  // Update cache in background (don't await to avoid blocking)
  updateCachedRates(freshRates).catch((error) => {
    console.error("Background cache update failed:", error);
  });

  return freshRates;
}

/**
 * Get rate for a specific currency
 * Returns how many units of target currency = 1 USD
 */
export async function getExchangeRate(
  currencyCode: CurrencyCode
): Promise<number> {
  if (currencyCode === "USD") {
    return 1.0;
  }

  const rates = await getExchangeRates();
  return rates[currencyCode] || 1.0; // Fallback to 1.0 if not found
}

/**
 * Manually refresh exchange rates (admin use)
 */
export async function refreshExchangeRates(): Promise<{
  success: boolean;
  ratesUpdated: number;
}> {
  try {
    const freshRates = await fetchExchangeRates();
    await updateCachedRates(freshRates);

    return {
      success: true,
      ratesUpdated: Object.keys(freshRates).length,
    };
  } catch (error) {
    console.error("Failed to refresh exchange rates:", error);
    return {
      success: false,
      ratesUpdated: 0,
    };
  }
}

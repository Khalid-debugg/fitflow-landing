/**
 * Currency Conversion with Smart Rounding
 * Implements psychological pricing strategies for different currencies
 */

import { CurrencyCode, CURRENCY_CONFIGS, RoundingStrategy } from "./constants";
import { getExchangeRate } from "./rates";

export interface ConvertedPrice {
  amount: number; // Rounded amount in target currency
  originalUSD: number; // Original USD amount
  currency: CurrencyCode;
  exchangeRate: number; // Rate used for conversion
  rawAmount: number; // Pre-rounding converted amount
}

/**
 * Apply smart rounding based on currency strategy
 */
function applySmartRounding(
  amount: number,
  strategy: RoundingStrategy,
  decimals: number
): number {
  switch (strategy) {
    case "point99":
      // Round to .99 (e.g., 28.73 → 28.99, 142.15 → 142.99)
      return Math.floor(amount) + 0.99;

    case "point95":
      // Round to .95 (e.g., 28.73 → 28.95, 142.15 → 142.95)
      return Math.floor(amount) + 0.95;

    case "whole99":
      // For larger amounts, round to 99/499/999 endings
      // For smaller amounts (< 100), use .99
      if (amount < 100) {
        return Math.floor(amount) + 0.99;
      } else if (amount < 1000) {
        // Round to nearest 99 (e.g., 438 → 499, 650 → 699)
        const hundreds = Math.floor(amount / 100);
        return hundreds * 100 + 99;
      } else {
        // Round to nearest 999 (e.g., 2438 → 2499, 4200 → 4299)
        const thousands = Math.floor(amount / 1000);
        return thousands * 1000 + 999;
      }

    case "whole":
      // Round to nearest whole number (e.g., 28.73 → 29)
      return Math.round(amount);

    case "hundred":
      // Round to nearest hundred (e.g., 4237 → 4200, 4680 → 4700)
      return Math.round(amount / 100) * 100;

    default:
      // Fallback to standard rounding with decimals
      return Math.round(amount * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }
}

/**
 * Convert USD amount to target currency with smart rounding
 *
 * @param usdAmount - Amount in USD
 * @param targetCurrency - Target currency code
 * @returns Converted and rounded price
 */
export async function convertPrice(
  usdAmount: number,
  targetCurrency: CurrencyCode
): Promise<ConvertedPrice> {
  // If already USD, no conversion needed
  if (targetCurrency === "USD") {
    const config = CURRENCY_CONFIGS.USD;
    const rounded = applySmartRounding(
      usdAmount,
      config.roundingStrategy,
      config.decimals
    );

    return {
      amount: rounded,
      originalUSD: usdAmount,
      currency: "USD",
      exchangeRate: 1.0,
      rawAmount: usdAmount,
    };
  }

  // Get exchange rate
  const exchangeRate = await getExchangeRate(targetCurrency);

  // Convert amount
  const rawAmount = usdAmount * exchangeRate;

  // Get currency config
  const config = CURRENCY_CONFIGS[targetCurrency];

  // Apply smart rounding
  const roundedAmount = applySmartRounding(
    rawAmount,
    config.roundingStrategy,
    config.decimals
  );

  return {
    amount: roundedAmount,
    originalUSD: usdAmount,
    currency: targetCurrency,
    exchangeRate,
    rawAmount,
  };
}

/**
 * Convert multiple prices at once (batch conversion)
 * Useful for pricing tables with multiple tiers
 *
 * @param usdAmounts - Array of USD amounts
 * @param targetCurrency - Target currency code
 * @returns Array of converted prices
 */
export async function convertPrices(
  usdAmounts: number[],
  targetCurrency: CurrencyCode
): Promise<ConvertedPrice[]> {
  // Get exchange rate once for all conversions
  const exchangeRate = await getExchangeRate(targetCurrency);
  const config = CURRENCY_CONFIGS[targetCurrency];

  return usdAmounts.map((usdAmount) => {
    const rawAmount = usdAmount * exchangeRate;
    const roundedAmount = applySmartRounding(
      rawAmount,
      config.roundingStrategy,
      config.decimals
    );

    return {
      amount: roundedAmount,
      originalUSD: usdAmount,
      currency: targetCurrency,
      exchangeRate,
      rawAmount,
    };
  });
}

/**
 * Get pricing for all tiers in a target currency
 * Helper for pricing page
 */
export async function getPricingTiers(targetCurrency: CurrencyCode): Promise<{
  trial: { duration: string; price: ConvertedPrice };
  basic: {
    subscription: ConvertedPrice;
    perpetual: ConvertedPrice;
  };
  pro: {
    subscription: ConvertedPrice;
    perpetual: ConvertedPrice;
  };
  enterprise: {
    subscription: ConvertedPrice;
    perpetual: ConvertedPrice;
  };
}> {
  const [
    basicSub,
    basicPerp,
    proSub,
    proPerp,
    enterpriseSub,
    enterprisePerp,
  ] = await convertPrices(
    [29, 299, 59, 599, 99, 999],
    targetCurrency
  );

  return {
    trial: {
      duration: "30 days",
      price: {
        amount: 0,
        originalUSD: 0,
        currency: targetCurrency,
        exchangeRate: 1,
        rawAmount: 0,
      },
    },
    basic: {
      subscription: basicSub,
      perpetual: basicPerp,
    },
    pro: {
      subscription: proSub,
      perpetual: proPerp,
    },
    enterprise: {
      subscription: enterpriseSub,
      perpetual: enterprisePerp,
    },
  };
}

/**
 * Format converted price for display
 */
export function formatConvertedPrice(convertedPrice: ConvertedPrice): string {
  const config = CURRENCY_CONFIGS[convertedPrice.currency];

  return `${config.symbol}${convertedPrice.amount.toLocaleString("en-US", {
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  })}`;
}

/**
 * Calculate savings percentage between subscription and perpetual
 * Useful for showing "Save X%" badges
 */
export function calculateSavings(
  monthlyPrice: number,
  perpetualPrice: number,
  months: number = 12
): number {
  const totalSubscriptionCost = monthlyPrice * months;
  const savings = ((totalSubscriptionCost - perpetualPrice) / totalSubscriptionCost) * 100;
  return Math.round(savings);
}

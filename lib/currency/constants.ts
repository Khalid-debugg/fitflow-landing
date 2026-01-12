/**
 * Currency Configuration Constants
 * Defines symbols, decimal places, rounding rules, and country mappings
 */

export type CurrencyCode =
  | "USD" | "EUR" | "GBP" | "EGP" | "SAR" | "AED"
  | "KWD" | "QAR" | "MAD" | "BRL" | "MXN" | "ARS"
  | "COP" | "CLP" | "INR" | "TRY";

export type RoundingStrategy = "point99" | "point95" | "whole99" | "whole" | "hundred";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  decimals: number; // Number of decimal places
  roundingStrategy: RoundingStrategy;
}

/**
 * Currency configurations with display and rounding rules
 */
export const CURRENCY_CONFIGS: Record<CurrencyCode, CurrencyConfig> = {
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    decimals: 2,
    roundingStrategy: "point99",
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    decimals: 2,
    roundingStrategy: "point99",
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    decimals: 2,
    roundingStrategy: "point99",
  },
  EGP: {
    code: "EGP",
    symbol: "E£",
    name: "Egyptian Pound",
    decimals: 2,
    roundingStrategy: "point99",
  },
  SAR: {
    code: "SAR",
    symbol: "SR",
    name: "Saudi Riyal",
    decimals: 2,
    roundingStrategy: "point95",
  },
  AED: {
    code: "AED",
    symbol: "AED",
    name: "UAE Dirham",
    decimals: 2,
    roundingStrategy: "point95",
  },
  KWD: {
    code: "KWD",
    symbol: "KD",
    name: "Kuwaiti Dinar",
    decimals: 3,
    roundingStrategy: "point99",
  },
  QAR: {
    code: "QAR",
    symbol: "QR",
    name: "Qatari Riyal",
    decimals: 2,
    roundingStrategy: "point95",
  },
  MAD: {
    code: "MAD",
    symbol: "MAD",
    name: "Moroccan Dirham",
    decimals: 2,
    roundingStrategy: "point99",
  },
  BRL: {
    code: "BRL",
    symbol: "R$",
    name: "Brazilian Real",
    decimals: 2,
    roundingStrategy: "whole99", // 49.99, 99.99
  },
  MXN: {
    code: "MXN",
    symbol: "MX$",
    name: "Mexican Peso",
    decimals: 2,
    roundingStrategy: "whole99",
  },
  ARS: {
    code: "ARS",
    symbol: "ARS$",
    name: "Argentine Peso",
    decimals: 2,
    roundingStrategy: "whole",
  },
  COP: {
    code: "COP",
    symbol: "COP$",
    name: "Colombian Peso",
    decimals: 0,
    roundingStrategy: "hundred", // Round to nearest hundred
  },
  CLP: {
    code: "CLP",
    symbol: "CLP$",
    name: "Chilean Peso",
    decimals: 0,
    roundingStrategy: "hundred",
  },
  INR: {
    code: "INR",
    symbol: "₹",
    name: "Indian Rupee",
    decimals: 2,
    roundingStrategy: "whole99", // 499, 999, 2499
  },
  TRY: {
    code: "TRY",
    symbol: "₺",
    name: "Turkish Lira",
    decimals: 2,
    roundingStrategy: "point99",
  },
};

/**
 * Country to Currency mapping
 * Maps ISO 3166-1 alpha-2 country codes to currency codes
 */
export const COUNTRY_TO_CURRENCY: Record<string, CurrencyCode> = {
  // North America
  US: "USD",
  CA: "USD", // Show USD for Canada as fallback
  MX: "MXN",

  // Europe
  AT: "EUR", // Austria
  BE: "EUR", // Belgium
  CY: "EUR", // Cyprus
  EE: "EUR", // Estonia
  FI: "EUR", // Finland
  FR: "EUR", // France
  DE: "EUR", // Germany
  GR: "EUR", // Greece
  IE: "EUR", // Ireland
  IT: "EUR", // Italy
  LV: "EUR", // Latvia
  LT: "EUR", // Lithuania
  LU: "EUR", // Luxembourg
  MT: "EUR", // Malta
  NL: "EUR", // Netherlands
  PT: "EUR", // Portugal
  SK: "EUR", // Slovakia
  SI: "EUR", // Slovenia
  ES: "EUR", // Spain
  GB: "GBP", // United Kingdom

  // Middle East & North Africa
  EG: "EGP", // Egypt
  SA: "SAR", // Saudi Arabia
  AE: "AED", // United Arab Emirates
  KW: "KWD", // Kuwait
  QA: "QAR", // Qatar
  MA: "MAD", // Morocco
  BH: "USD", // Bahrain - fallback to USD
  OM: "USD", // Oman - fallback to USD
  JO: "USD", // Jordan - fallback to USD
  LB: "USD", // Lebanon - fallback to USD

  // Latin America
  BR: "BRL", // Brazil
  AR: "ARS", // Argentina
  CO: "COP", // Colombia
  CL: "CLP", // Chile
  PE: "USD", // Peru - fallback to USD
  VE: "USD", // Venezuela - fallback to USD
  EC: "USD", // Ecuador - uses USD
  UY: "USD", // Uruguay - fallback to USD

  // Asia
  IN: "INR", // India
  TR: "TRY", // Turkey

  // Add more countries as needed
};

/**
 * Get currency for a country code
 * Falls back to USD if country not found
 */
export function getCurrencyForCountry(countryCode: string): CurrencyCode {
  return COUNTRY_TO_CURRENCY[countryCode.toUpperCase()] || "USD";
}

/**
 * Get all supported currency codes
 */
export function getSupportedCurrencies(): CurrencyCode[] {
  return Object.keys(CURRENCY_CONFIGS) as CurrencyCode[];
}

/**
 * Check if a currency is supported
 */
export function isSupportedCurrency(code: string): code is CurrencyCode {
  return code in CURRENCY_CONFIGS;
}

/**
 * Format currency amount for display
 */
export function formatCurrency(amount: number, currencyCode: CurrencyCode): string {
  const config = CURRENCY_CONFIGS[currencyCode];

  return `${config.symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  })}`;
}

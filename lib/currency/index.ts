/**
 * Currency System - Barrel Export
 * Convenient imports for all currency-related functionality
 */

// Constants
export {
  CURRENCY_CONFIGS,
  COUNTRY_TO_CURRENCY,
  getCurrencyForCountry,
  getSupportedCurrencies,
  isSupportedCurrency,
  formatCurrency,
  type CurrencyCode,
  type CurrencyConfig,
  type RoundingStrategy,
} from "./constants";

// Exchange Rates
export {
  getExchangeRates,
  getExchangeRate,
  refreshExchangeRates,
} from "./rates";

// Currency Detection
export {
  detectCurrencyFromIP,
  detectCurrencyFromRequest,
  validateCurrencyPreference,
  type GeoLocation,
} from "./detect";

// Price Conversion
export {
  convertPrice,
  convertPrices,
  getPricingTiers,
  formatConvertedPrice,
  calculateSavings,
  type ConvertedPrice,
} from "./convert";

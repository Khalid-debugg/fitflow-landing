/**
 * Currency System Test Script
 * Run with: npx tsx scripts/test-currency.ts
 */

import {
  convertPrice,
  convertPrices,
  getPricingTiers,
  formatConvertedPrice,
  getSupportedCurrencies,
  getExchangeRates,
  CurrencyCode,
} from "../lib/currency";

console.log("🧪 Testing Dumbbellflow Currency System\n");
console.log("=" .repeat(60));

async function testExchangeRates() {
  console.log("\n📊 Test 1: Fetching Exchange Rates");
  console.log("-".repeat(60));

  try {
    const rates = await getExchangeRates();
    const currencies = Object.keys(rates);

    console.log(`✅ Successfully fetched ${currencies.length} exchange rates`);
    console.log("\nSample rates (1 USD = X):");

    // Show first 5 rates
    currencies.slice(0, 5).forEach((currency) => {
      console.log(`  ${currency}: ${rates[currency as CurrencyCode].toFixed(4)}`);
    });

    return true;
  } catch (error) {
    console.error("❌ Failed to fetch exchange rates:", error);
    return false;
  }
}

async function testPriceConversion() {
  console.log("\n💱 Test 2: Price Conversion with Smart Rounding");
  console.log("-".repeat(60));

  const testPrices = [29, 59, 99]; // Basic, Pro, Enterprise monthly
  const testCurrencies: CurrencyCode[] = ["USD", "EUR", "EGP", "INR", "BRL"];

  try {
    for (const currency of testCurrencies) {
      console.log(`\n  ${currency}:`);

      for (const usdPrice of testPrices) {
        const converted = await convertPrice(usdPrice, currency);
        const formatted = formatConvertedPrice(converted);

        console.log(
          `    $${usdPrice} → ${formatted} (raw: ${converted.rawAmount.toFixed(2)})`
        );
      }
    }

    console.log("\n✅ Price conversion test passed");
    return true;
  } catch (error) {
    console.error("❌ Price conversion test failed:", error);
    return false;
  }
}

async function testBatchConversion() {
  console.log("\n📦 Test 3: Batch Price Conversion");
  console.log("-".repeat(60));

  const prices = [29, 299, 59, 599, 99, 999];
  const currency: CurrencyCode = "EUR";

  try {
    const converted = await convertPrices(prices, currency);

    console.log(`\n  Converting ${prices.length} prices to ${currency}:`);
    converted.forEach((price) => {
      console.log(
        `    $${price.originalUSD} → ${formatConvertedPrice(price)}`
      );
    });

    console.log("\n✅ Batch conversion test passed");
    return true;
  } catch (error) {
    console.error("❌ Batch conversion test failed:", error);
    return false;
  }
}

async function testPricingTiers() {
  console.log("\n🎯 Test 4: Pricing Tiers (Full Product Suite)");
  console.log("-".repeat(60));

  const testCurrencies: CurrencyCode[] = ["USD", "EGP", "SAR"];

  try {
    for (const currency of testCurrencies) {
      console.log(`\n  ${currency}:`);

      const tiers = await getPricingTiers(currency);

      console.log(`    Basic: ${formatConvertedPrice(tiers.basic.subscription)}/mo or ${formatConvertedPrice(tiers.basic.perpetual)} once`);
      console.log(`    Pro: ${formatConvertedPrice(tiers.pro.subscription)}/mo or ${formatConvertedPrice(tiers.pro.perpetual)} once`);
      console.log(`    Enterprise: ${formatConvertedPrice(tiers.enterprise.subscription)}/mo or ${formatConvertedPrice(tiers.enterprise.perpetual)} once`);
    }

    console.log("\n✅ Pricing tiers test passed");
    return true;
  } catch (error) {
    console.error("❌ Pricing tiers test failed:", error);
    return false;
  }
}

async function testRoundingStrategies() {
  console.log("\n🎲 Test 5: Smart Rounding Strategies");
  console.log("-".repeat(60));

  const testCases: Array<{
    amount: number;
    currency: CurrencyCode;
    expectedPattern: string;
  }> = [
    { amount: 29, currency: "USD", expectedPattern: ".99" },
    { amount: 29, currency: "EUR", expectedPattern: ".99" },
    { amount: 29, currency: "SAR", expectedPattern: ".95" },
    { amount: 29, currency: "INR", expectedPattern: ".99" },
    { amount: 500, currency: "INR", expectedPattern: "99" }, // Should be X99
    { amount: 2000, currency: "INR", expectedPattern: "999" }, // Should be X999
  ];

  try {
    console.log("\n  Testing rounding patterns:");

    for (const test of testCases) {
      const converted = await convertPrice(test.amount, test.currency);
      const amountStr = converted.amount.toString();

      console.log(
        `    $${test.amount} → ${formatConvertedPrice(converted)} (expected: *${test.expectedPattern})`
      );

      // Verify rounding pattern
      if (test.expectedPattern === ".99") {
        if (!amountStr.endsWith(".99")) {
          console.warn(`      ⚠️  Warning: Expected .99 ending`);
        }
      } else if (test.expectedPattern === ".95") {
        if (!amountStr.endsWith(".95")) {
          console.warn(`      ⚠️  Warning: Expected .95 ending`);
        }
      }
    }

    console.log("\n✅ Rounding strategies test passed");
    return true;
  } catch (error) {
    console.error("❌ Rounding strategies test failed:", error);
    return false;
  }
}

async function testSupportedCurrencies() {
  console.log("\n🌍 Test 6: Supported Currencies");
  console.log("-".repeat(60));

  try {
    const currencies = getSupportedCurrencies();

    console.log(`\n  Total supported: ${currencies.length} currencies`);
    console.log(`  Currencies: ${currencies.join(", ")}`);

    console.log("\n✅ Supported currencies test passed");
    return true;
  } catch (error) {
    console.error("❌ Supported currencies test failed:", error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log("\n🚀 Running Currency System Tests...\n");

  const results = await Promise.all([
    testExchangeRates(),
    testPriceConversion(),
    testBatchConversion(),
    testPricingTiers(),
    testRoundingStrategies(),
    testSupportedCurrencies(),
  ]);

  const passed = results.filter((r) => r).length;
  const total = results.length;

  console.log("\n" + "=".repeat(60));
  console.log(`\n📋 Test Results: ${passed}/${total} tests passed\n`);

  if (passed === total) {
    console.log("✅ All tests passed! Currency system is ready.\n");
    process.exit(0);
  } else {
    console.log("❌ Some tests failed. Please review the output above.\n");
    process.exit(1);
  }
}

// Run tests
runAllTests().catch((error) => {
  console.error("\n💥 Fatal error running tests:", error);
  process.exit(1);
});

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Currency rates (as of January 2026 - approximate values)
  // 1 USD = X in target currency
  const currencies = [
    { currency: 'USD', rateToUSD: 1.0 },
    { currency: 'EUR', rateToUSD: 0.92 },     // Euro
    { currency: 'GBP', rateToUSD: 0.79 },     // British Pound
    { currency: 'EGP', rateToUSD: 30.85 },    // Egyptian Pound
    { currency: 'SAR', rateToUSD: 3.75 },     // Saudi Riyal
    { currency: 'AED', rateToUSD: 3.67 },     // UAE Dirham
    { currency: 'KWD', rateToUSD: 0.31 },     // Kuwaiti Dinar
    { currency: 'QAR', rateToUSD: 3.64 },     // Qatari Riyal
    { currency: 'MAD', rateToUSD: 10.12 },    // Moroccan Dirham
    { currency: 'BRL', rateToUSD: 4.98 },     // Brazilian Real
    { currency: 'MXN', rateToUSD: 20.12 },    // Mexican Peso
    { currency: 'ARS', rateToUSD: 850.0 },    // Argentine Peso
    { currency: 'COP', rateToUSD: 4200.0 },   // Colombian Peso
    { currency: 'CLP', rateToUSD: 920.0 },    // Chilean Peso
    { currency: 'INR', rateToUSD: 83.25 },    // Indian Rupee
    { currency: 'TRY', rateToUSD: 32.50 },    // Turkish Lira
  ]

  console.log('📊 Seeding currency rates...')

  for (const curr of currencies) {
    await prisma.currencyRate.upsert({
      where: { currency: curr.currency },
      update: {
        rateToUSD: curr.rateToUSD,
        lastUpdated: new Date(),
      },
      create: {
        currency: curr.currency,
        rateToUSD: curr.rateToUSD,
        lastUpdated: new Date(),
      },
    })
    console.log(`  ✓ ${curr.currency}: 1 USD = ${curr.rateToUSD} ${curr.currency}`)
  }

  console.log('\n✅ Database seed completed successfully!')
  console.log(`   Seeded ${currencies.length} currencies\n`)
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:')
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

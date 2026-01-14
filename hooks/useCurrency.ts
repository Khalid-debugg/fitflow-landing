'use client'

import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'

const CURRENCY_COOKIE = 'preferred-currency'

export interface CurrencyInfo {
  code: string
  symbol: string
  rate: number // Conversion rate from USD
}

const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  EGP: 'E£',
  SAR: 'SR',
  AED: 'AED',
  KWD: 'KD',
  QAR: 'QR',
  MAD: 'MAD',
  BRL: 'R$',
  MXN: 'MX$',
  ARS: 'ARS$',
  COP: 'COP$',
  CLP: 'CLP$',
  INR: '₹',
  TRY: '₺',
}

export function useCurrency() {
  const [currency, setCurrency] = useState<CurrencyInfo>({
    code: 'USD',
    symbol: '$',
    rate: 1,
  })
  const [isLoading, setIsLoading] = useState(false)

  // Fetch pricing tiers from API
  const fetchPricingTiers = async (currencyCode: string) => {
    if (currencyCode === 'USD') {
      return 1 // USD has 1:1 exchange rate
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/currency/convert?currency=${currencyCode}`)

      if (!response.ok) {
        console.error('Failed to fetch pricing tiers')
        return 1
      }

      const result = await response.json()
      if (!result.success || !result.data) {
        console.error('Invalid API response')
        return 1
      }

      // The API returns pricing tiers with conversion data
      // Extract exchange rate from basic subscription tier
      const exchangeRate = result.data?.basic?.subscription?.exchangeRate

      if (!exchangeRate || typeof exchangeRate !== 'number') {
        console.error('No exchange rate found in API response')
        return 1
      }

      return exchangeRate
    } catch (error) {
      console.error('Error fetching pricing tiers:', error)
      return 1
    } finally {
      setIsLoading(false)
    }
  }

  // Update currency state
  const updateCurrency = async (currencyCode: string) => {
    const rate = await fetchPricingTiers(currencyCode)

    setCurrency({
      code: currencyCode,
      symbol: currencySymbols[currencyCode] || currencyCode,
      rate: rate,
    })
  }

  // Load currency from cookie on mount
  useEffect(() => {
    const savedCurrency = Cookies.get(CURRENCY_COOKIE) || 'USD'
    updateCurrency(savedCurrency)

    // Listen for currency changes
    const handleCurrencyChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ currency: string }>
      updateCurrency(customEvent.detail.currency)
    }

    window.addEventListener('currencyChange', handleCurrencyChange)

    return () => {
      window.removeEventListener('currencyChange', handleCurrencyChange)
    }
  }, [])

  // Convert USD price to selected currency
  const convertPrice = (usdPrice: number): number => {
    return Math.round(usdPrice * currency.rate)
  }

  // Format price with currency symbol
  const formatPrice = (usdPrice: number): string => {
    const convertedPrice = convertPrice(usdPrice)
    return `${currency.symbol}${convertedPrice.toLocaleString()}`
  }

  return {
    currency,
    isLoading,
    convertPrice,
    formatPrice,
  }
}

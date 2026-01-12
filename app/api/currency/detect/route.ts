/**
 * Currency Detection API Endpoint
 * POST /api/currency/detect
 *
 * Detects user's currency based on IP address
 * Returns currency code, country, and geolocation data
 */

import { NextRequest, NextResponse } from "next/server";
import { detectCurrencyFromRequest } from "@/lib/currency/detect";

export async function POST(request: NextRequest) {
  try {
    // Detect currency from request headers (IP address)
    const geoLocation = await detectCurrencyFromRequest(request.headers);

    return NextResponse.json({
      success: true,
      data: {
        currency: geoLocation.currency,
        country: geoLocation.country,
        countryName: geoLocation.countryName,
        ip: geoLocation.ip,
      },
    });
  } catch (error) {
    console.error("Currency detection error:", error);

    // Return fallback (USD) on error
    return NextResponse.json({
      success: true,
      data: {
        currency: "USD",
        country: "US",
        countryName: "United States",
        ip: "unknown",
      },
    });
  }
}

// Also support GET method for simpler client usage
export async function GET(request: NextRequest) {
  return POST(request);
}

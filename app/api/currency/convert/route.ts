/**
 * Currency Conversion API Endpoint
 * POST /api/currency/convert
 *
 * Converts USD prices to target currency with smart rounding
 * Supports single price or batch conversion
 */

import { NextRequest, NextResponse } from "next/server";
import { convertPrice, convertPrices, getPricingTiers } from "@/lib/currency/convert";
import { isSupportedCurrency, CurrencyCode } from "@/lib/currency/constants";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate target currency
    const targetCurrency = body.targetCurrency?.toUpperCase();
    if (!targetCurrency || !isSupportedCurrency(targetCurrency)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or unsupported target currency",
        },
        { status: 400 }
      );
    }

    // Handle different conversion types

    // 1. Get all pricing tiers
    if (body.getPricingTiers) {
      const tiers = await getPricingTiers(targetCurrency as CurrencyCode);
      return NextResponse.json({
        success: true,
        data: tiers,
      });
    }

    // 2. Batch conversion
    if (body.amounts && Array.isArray(body.amounts)) {
      const amounts = body.amounts as number[];

      // Validate amounts
      if (amounts.some((amt) => typeof amt !== "number" || amt < 0)) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid amounts array. All amounts must be positive numbers.",
          },
          { status: 400 }
        );
      }

      const convertedPrices = await convertPrices(
        amounts,
        targetCurrency as CurrencyCode
      );

      return NextResponse.json({
        success: true,
        data: convertedPrices,
      });
    }

    // 3. Single conversion
    if (typeof body.amount === "number") {
      const amount = body.amount as number;

      // Validate amount
      if (amount < 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Amount must be a positive number",
          },
          { status: 400 }
        );
      }

      const convertedPrice = await convertPrice(
        amount,
        targetCurrency as CurrencyCode
      );

      return NextResponse.json({
        success: true,
        data: convertedPrice,
      });
    }

    // No valid conversion type provided
    return NextResponse.json(
      {
        success: false,
        error:
          "Invalid request. Provide either 'amount', 'amounts', or 'getPricingTiers: true'",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Currency conversion error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to convert currency",
      },
      { status: 500 }
    );
  }
}

// Support GET for pricing tiers
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const targetCurrency = searchParams.get("currency")?.toUpperCase() || "USD";

    if (!isSupportedCurrency(targetCurrency)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or unsupported target currency",
        },
        { status: 400 }
      );
    }

    const tiers = await getPricingTiers(targetCurrency as CurrencyCode);

    return NextResponse.json({
      success: true,
      data: tiers,
    });
  } catch (error) {
    console.error("Currency conversion error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to get pricing tiers",
      },
      { status: 500 }
    );
  }
}

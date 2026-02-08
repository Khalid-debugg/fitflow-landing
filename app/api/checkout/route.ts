import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import {
  createLemonSqueezyCheckout,
  getVariantId,
  type PlanTier,
  type BillingInterval,
} from "@/lib/payments/lemonsqueezy";

export const runtime = "nodejs";

interface CheckoutRequestBody {
  planTier: PlanTier;
  billingInterval: BillingInterval;
}

/**
 * POST /api/checkout
 * Create a LemonSqueezy checkout session
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();

    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    // Parse request body
    const body: CheckoutRequestBody = await request.json();
    const { planTier, billingInterval } = body;

    // Validate plan tier
    if (!["basic", "pro", "enterprise"].includes(planTier)) {
      return NextResponse.json(
        { error: "Invalid plan tier" },
        { status: 400 }
      );
    }

    // Validate billing interval
    if (!["monthly", "annually", "perpetual"].includes(billingInterval)) {
      return NextResponse.json(
        { error: "Invalid billing interval" },
        { status: 400 }
      );
    }

    // Get variant ID for the selected plan and billing interval
    let variantId: string;
    try {
      variantId = getVariantId(planTier, billingInterval);
    } catch (error) {
      console.error("Error getting variant ID:", error);
      return NextResponse.json(
        {
          error:
            "Product variant not configured. Please contact support or check environment variables.",
        },
        { status: 500 }
      );
    }
    console.log(variantId);
    
    // Create checkout session
    const { checkoutUrl, checkoutId } = await createLemonSqueezyCheckout({
      variantId,
      userId: session.user.id,
      userEmail: session.user.email,
      planTier,
      billingInterval,
    });

    return NextResponse.json({
      success: true,
      checkoutUrl,
      checkoutId,
    });
  } catch (error) {
    console.error("Checkout API error:", error);

    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

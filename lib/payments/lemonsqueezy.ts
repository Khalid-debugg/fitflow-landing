import {
  lemonSqueezySetup,
  createCheckout,
  getSubscription,
  cancelSubscription,
  updateSubscription,
} from "@lemonsqueezy/lemonsqueezy.js";

// Initialize LemonSqueezy with API key
export function initializeLemonSqueezy() {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;

  if (!apiKey) {
    throw new Error("LEMONSQUEEZY_API_KEY is not set in environment variables");
  }

  lemonSqueezySetup({ apiKey });
}

/**
 * Product variant IDs from LemonSqueezy dashboard
 * You'll need to update these after creating products in LemonSqueezy
 */
export const PRODUCT_VARIANTS = {
  // Subscription products
  BASIC_MONTHLY: process.env.NEXT_PUBLIC_LS_VARIANT_BASIC_MONTHLY || "",
  BASIC_ANNUALLY: process.env.NEXT_PUBLIC_LS_VARIANT_BASIC_ANNUALLY || "",
  PRO_MONTHLY: process.env.NEXT_PUBLIC_LS_VARIANT_PRO_MONTHLY || "",
  PRO_ANNUALLY: process.env.NEXT_PUBLIC_LS_VARIANT_PRO_ANNUALLY || "",
  ENTERPRISE_MONTHLY: process.env.NEXT_PUBLIC_LS_VARIANT_ENTERPRISE_MONTHLY || "",
  ENTERPRISE_ANNUALLY: process.env.NEXT_PUBLIC_LS_VARIANT_ENTERPRISE_ANNUALLY || "",

  // One-time perpetual licenses
  BASIC_PERPETUAL: process.env.NEXT_PUBLIC_LS_VARIANT_BASIC_PERPETUAL || "",
  PRO_PERPETUAL: process.env.NEXT_PUBLIC_LS_VARIANT_PRO_PERPETUAL || "",
  ENTERPRISE_PERPETUAL: process.env.NEXT_PUBLIC_LS_VARIANT_ENTERPRISE_PERPETUAL || "",
};

/**
 * Plan configuration mapping
 */
export const PLAN_CONFIG = {
  basic: {
    name: "Basic",
    deviceLimit: 1,
    monthly: PRODUCT_VARIANTS.BASIC_MONTHLY,
    ANNUALLY: PRODUCT_VARIANTS.BASIC_ANNUALLY,
    perpetual: PRODUCT_VARIANTS.BASIC_PERPETUAL,
  },
  pro: {
    name: "Pro",
    deviceLimit: 3,
    monthly: PRODUCT_VARIANTS.PRO_MONTHLY,
    ANNUALLY: PRODUCT_VARIANTS.PRO_ANNUALLY,
    perpetual: PRODUCT_VARIANTS.PRO_PERPETUAL,
  },
  enterprise: {
    name: "Enterprise",
    deviceLimit: 999999,
    monthly: PRODUCT_VARIANTS.ENTERPRISE_MONTHLY,
    ANNUALLY: PRODUCT_VARIANTS.ENTERPRISE_ANNUALLY,
    perpetual: PRODUCT_VARIANTS.ENTERPRISE_PERPETUAL,
  },
};

export type PlanTier = keyof typeof PLAN_CONFIG;
export type BillingInterval = "monthly" | "ANNUALLY" | "perpetual";

interface CreateCheckoutParams {
  variantId: string;
  userId: string;
  userEmail: string;
  planTier: PlanTier;
  billingInterval: BillingInterval;
  successUrl?: string;
  cancelUrl?: string;
}

/**
 * Create a LemonSqueezy checkout session
 * Uses the correct API signature: createCheckout(storeId, variantId, options)
 */
export async function createLemonSqueezyCheckout({
  variantId,
  userId,
  userEmail,
  planTier,
  billingInterval,
  successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
}: CreateCheckoutParams) {
  initializeLemonSqueezy();

  const storeId = process.env.LEMONSQUEEZY_STORE_ID;

  if (!storeId) {
    throw new Error("LEMONSQUEEZY_STORE_ID is not set in environment variables");
  }

  // Parse variant ID to number
  const variantIdNumber = parseInt(variantId, 10);

  if (isNaN(variantIdNumber)) {
    throw new Error(`Invalid variant ID: ${variantId}. Must be a number.`);
  }

  // Correct structure for createCheckout: (storeId, variantId, options)
  const checkoutOptions = {
    checkoutOptions: {
      embed: true, // Enable embedded checkout (overlay/modal)
      media: true,
      logo: true,
      discount: true,
      dark: false,
    },
    checkoutData: {
      email: userEmail,
      custom: {
        user_id: userId,
        plan_tier: planTier,
        billing_interval: billingInterval,
      },
    },
    productOptions: {
      enabledVariants: [variantIdNumber],
      redirectUrl: successUrl,
      receiptButtonText: "Go to Dashboard",
      receiptThankYouNote: "Thank you for your purchase!",
    },
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    preview: false,
  };

  try {
    // CORRECT API CALL: createCheckout(storeId, variantId, options)
    const checkout = await createCheckout(storeId, variantIdNumber, checkoutOptions);

    if (checkout.error) {
      throw new Error(`LemonSqueezy API Error: ${checkout.error.message}`);
    }

    if (!checkout.data?.data?.attributes?.url) {
      throw new Error("No checkout URL returned from LemonSqueezy");
    }

    return {
      checkoutUrl: checkout.data.data.attributes.url,
      checkoutId: checkout.data.data.id,
    };
  } catch (error) {
    console.error("Failed to create LemonSqueezy checkout:", error);
    throw error;
  }
}

/**
 * Get subscription details by ID
 */
export async function getLemonSqueezySubscription(subscriptionId: string) {
  initializeLemonSqueezy();

  try {
    const subscription = await getSubscription(subscriptionId);

    if (subscription.error) {
      throw new Error(subscription.error.message);
    }

    return subscription.data?.data;
  } catch (error) {
    console.error("Failed to get LemonSqueezy subscription:", error);
    throw error;
  }
}

/**
 * Cancel a subscription
 */
export async function cancelLemonSqueezySubscription(subscriptionId: string) {
  initializeLemonSqueezy();

  try {
    const result = await cancelSubscription(subscriptionId);

    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.data?.data;
  } catch (error) {
    console.error("Failed to cancel LemonSqueezy subscription:", error);
    throw error;
  }
}

/**
 * Update a subscription (e.g., change plan)
 */
export async function updateLemonSqueezySubscription(
  subscriptionId: string,
  variantId: number
) {
  initializeLemonSqueezy();

  try {
    const result = await updateSubscription(subscriptionId, {
      variantId,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.data?.data;
  } catch (error) {
    console.error("Failed to update LemonSqueezy subscription:", error);
    throw error;
  }
}

/**
 * Get variant ID based on plan and billing interval
 */
export function getVariantId(
  planTier: PlanTier,
  billingInterval: BillingInterval
): string {
  const plan = PLAN_CONFIG[planTier];

  if (!plan) {
    throw new Error(`Invalid plan tier: ${planTier}`);
  }

  const variantId = plan[billingInterval];

  if (!variantId) {
    throw new Error(`No variant ID found for ${planTier} ${billingInterval}`);
  }

  return variantId;
}

/**
 * Get device limit for a plan
 */
export function getDeviceLimit(planTier: PlanTier): number {
  return PLAN_CONFIG[planTier]?.deviceLimit || 1;
}

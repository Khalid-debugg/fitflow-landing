import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/db/prisma";
import { getDeviceLimit } from "@/lib/payments/lemonsqueezy";

export const runtime = "nodejs";

/**
 * Verify LemonSqueezy webhook signature
 */
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

/**
 * POST /api/webhooks/lemonsqueezy
 * Handle LemonSqueezy webhook events
 */
export async function POST(request: NextRequest) {
  try {
    // Get webhook secret
    const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("LEMONSQUEEZY_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    // Get request body as text for signature verification
    const rawBody = await request.text();

    // Get signature from header
    const signature = request.headers.get("x-signature");

    if (!signature) {
      console.error("No signature provided");
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    // Verify signature
    const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);

    if (!isValid) {
      console.error("Invalid webhook signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Parse webhook payload
    const event = JSON.parse(rawBody);
    const { meta, data } = event;
    const eventName = meta?.event_name;

    console.log(`Received LemonSqueezy webhook: ${eventName}`);

    // Extract custom data
    const customData = data?.attributes?.first_order_item?.product_id
      ? meta?.custom_data
      : data?.attributes?.custom_data;

    const userId = customData?.user_id;
    const planTier = customData?.plan_tier;
    const billingInterval = customData?.billing_interval;

    if (!userId) {
      console.error("No user_id in webhook custom data");
      return NextResponse.json(
        { error: "No user_id in custom data" },
        { status: 400 }
      );
    }

    // Handle different webhook events
    switch (eventName) {
      case "order_created":
        await handleOrderCreated(data, userId, planTier, billingInterval);
        break;

      case "subscription_created":
        await handleSubscriptionCreated(data, userId, planTier);
        break;

      case "subscription_updated":
        await handleSubscriptionUpdated(data, userId);
        break;

      case "subscription_cancelled":
        await handleSubscriptionCancelled(data, userId);
        break;

      case "subscription_resumed":
        await handleSubscriptionResumed(data, userId);
        break;

      case "subscription_expired":
        await handleSubscriptionExpired(data, userId);
        break;

      case "subscription_paused":
        await handleSubscriptionPaused(data, userId);
        break;

      case "subscription_unpaused":
        await handleSubscriptionUnpaused(data, userId);
        break;

      case "subscription_payment_failed":
        await handlePaymentFailed(data, userId);
        break;

      case "subscription_payment_success":
        await handlePaymentSuccess(data, userId);
        break;

      case "subscription_payment_recovered":
        await handlePaymentRecovered(data, userId);
        break;

      default:
        console.log(`Unhandled event type: ${eventName}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

interface WebhookData {
  id: string;
  attributes: {
    customer_id?: number;
    status?: string;
    variant_id?: string;
  };
}

/**
 * Handle one-time order created (perpetual licenses)
 */
async function handleOrderCreated(
  data: WebhookData,
  userId: string,
  planTier: string,
  _billingInterval: string
) {
  console.log(`Processing order_created for user ${userId}`);

  const customerId = data.attributes.customer_id?.toString();
  const status = data.attributes.status;

  if (status !== "paid") {
    console.log(`Order not paid yet, status: ${status}`);
    return;
  }

  // For perpetual licenses
  if (_billingInterval === "perpetual") {
    const deviceLimit = getDeviceLimit(planTier as "basic" | "pro" | "enterprise");
    const now = new Date();
    const updatesUntil = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // +1 year

    await prisma.user.update({
      where: { id: userId },
      data: {
        lemonSqueezyCustomerId: customerId,
        subscriptionStatus: "active",
        subscriptionType: "perpetual",
        planTier,
        deviceLimit,
        perpetualLicensePurchasedAt: now,
        perpetualLicenseUpdatesUntil: updatesUntil,
      },
    });

    console.log(`Perpetual license activated for user ${userId}, plan: ${planTier}`);
  }
}

/**
 * Handle subscription created
 */
async function handleSubscriptionCreated(
  data: WebhookData,
  userId: string,
  planTier: string
) {
  console.log(`Processing subscription_created for user ${userId}`);

  const customerId = data.attributes.customer_id?.toString();
  const subscriptionId = data.id;
  const status = data.attributes.status;
  const deviceLimit = getDeviceLimit(planTier as "basic" | "pro" | "enterprise");

  await prisma.user.update({
    where: { id: userId },
    data: {
      lemonSqueezyCustomerId: customerId,
      lemonSqueezySubscriptionId: subscriptionId,
      subscriptionStatus: status === "active" ? "active" : "pending",
      subscriptionType: "subscription",
      planTier,
      deviceLimit,
    },
  });

  console.log(`Subscription created for user ${userId}, plan: ${planTier}, status: ${status}`);
}

/**
 * Handle subscription updated
 */
async function handleSubscriptionUpdated(data: WebhookData, userId: string) {
  console.log(`Processing subscription_updated for user ${userId}`);

  const status = data.attributes.status;

  // Update subscription status
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: status === "active" ? "active" : status,
    },
  });

  console.log(`Subscription updated for user ${userId}, status: ${status}`);
}

/**
 * Handle subscription cancelled
 */
async function handleSubscriptionCancelled(data: WebhookData, userId: string) {
  console.log(`Processing subscription_cancelled for user ${userId}`);

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: "cancelled",
    },
  });

  console.log(`Subscription cancelled for user ${userId}`);
}

/**
 * Handle subscription resumed
 */
async function handleSubscriptionResumed(data: WebhookData, userId: string) {
  console.log(`Processing subscription_resumed for user ${userId}`);

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: "active",
    },
  });

  console.log(`Subscription resumed for user ${userId}`);
}

/**
 * Handle subscription expired
 */
async function handleSubscriptionExpired(data: WebhookData, userId: string) {
  console.log(`Processing subscription_expired for user ${userId}`);

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: "expired",
    },
  });

  console.log(`Subscription expired for user ${userId}`);
}

/**
 * Handle subscription paused
 */
async function handleSubscriptionPaused(data: WebhookData, userId: string) {
  console.log(`Processing subscription_paused for user ${userId}`);

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: "paused",
    },
  });

  console.log(`Subscription paused for user ${userId}`);
}

/**
 * Handle subscription unpaused
 */
async function handleSubscriptionUnpaused(data: WebhookData, userId: string) {
  console.log(`Processing subscription_unpaused for user ${userId}`);

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: "active",
    },
  });

  console.log(`Subscription unpaused for user ${userId}`);
}

/**
 * Handle payment failed
 */
async function handlePaymentFailed(data: WebhookData, userId: string) {
  console.log(`Processing subscription_payment_failed for user ${userId}`);

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: "past_due",
    },
  });

  console.log(`Payment failed for user ${userId}`);
  // TODO: Send email notification about payment failure
}

/**
 * Handle payment success
 */
async function handlePaymentSuccess(data: WebhookData, userId: string) {
  console.log(`Processing subscription_payment_success for user ${userId}`);

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: "active",
    },
  });

  console.log(`Payment successful for user ${userId}`);
}

/**
 * Handle payment recovered
 */
async function handlePaymentRecovered(data: WebhookData, userId: string) {
  console.log(`Processing subscription_payment_recovered for user ${userId}`);

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: "active",
    },
  });

  console.log(`Payment recovered for user ${userId}`);
}

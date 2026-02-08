"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { PlanTier, BillingInterval } from "@/lib/payments/lemonsqueezy";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  planTier: PlanTier;
  billingInterval: BillingInterval;
  planName: string;
  price: string;
}

export function CheckoutModal({
  isOpen,
  onClose,
  planTier,
  billingInterval,
  planName,
  price,
}: CheckoutModalProps) {
  const t = useTranslations('checkout.modal');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planTier,
          billingInterval,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Checkout failed:", {
          status: response.status,
          error: data.error,
          details: data.details,
          fullResponse: data
        });
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.checkoutUrl) {
        setCheckoutUrl(data.checkoutUrl);

        // Open LemonSqueezy checkout in the modal using LemonSqueezy.js
        if (window.createLemonSqueezy) {
          window.createLemonSqueezy();
        }

        // Open the checkout URL in an overlay
        if (window.LemonSqueezy) {
          window.LemonSqueezy.Url.Open(data.checkoutUrl);
        } else {
          // Fallback: open in new tab if LemonSqueezy.js not loaded
          window.open(data.checkoutUrl, "_blank");
        }
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCheckoutUrl(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {planName} - {t(`title.${billingInterval}`)}
          </DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{planName} {t('plan')}</p>
                <p className="text-sm text-muted-foreground">
                  {t(`billing.${billingInterval === "perpetual" ? "oneTime" : billingInterval}`)}
                </p>
              </div>
              <p className="text-2xl font-bold">{price}</p>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {!checkoutUrl ? (
            <Button
              onClick={handleCheckout}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('button.loading')}
                </>
              ) : (
                t('button.proceed')
              )}
            </Button>
          ) : (
            <div className="text-center text-sm text-muted-foreground">
              <p>{t('success.opened')}</p>
              <p>{t('success.popupBlocked')}</p>
            </div>
          )}

          <p className="text-center text-xs text-muted-foreground">
            {t('footer')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// TypeScript declarations for LemonSqueezy global functions
declare global {
  interface Window {
    createLemonSqueezy: () => void;
    LemonSqueezy: {
      Url: {
        Open: (url: string) => void;
        Close: () => void;
      };
      Affiliate: {
        GetID: () => string;
        Build: (config: object) => void;
      };
    };
  }
}

"use client";

import { useEffect } from "react";
import Script from "next/script";

/**
 * Provider component to load LemonSqueezy.js script
 * This enables the embedded checkout overlay
 */
export function LemonSqueezyProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Initialize LemonSqueezy when script loads
    if (window.createLemonSqueezy) {
      window.createLemonSqueezy();
    }
  }, []);

  return (
    <>
      <Script
        src="https://app.lemonsqueezy.com/js/lemon.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.createLemonSqueezy) {
            window.createLemonSqueezy();
          }
        }}
      />
      {children}
    </>
  );
}

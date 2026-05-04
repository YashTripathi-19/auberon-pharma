"use client";
import React, { useEffect, useCallback, useState } from "react";
import LiveSaleBanner from "@/components/layout/LiveSaleBanner";

/**
 * Renders the LiveSaleBanner and keeps --banner-h CSS variable on <body>
 * in sync with whether the banner is visible (44px) or not (0px).
 * The navbar and page-content both read this variable for their offsets.
 */
export default function SaleBannerProvider() {
  const [visible, setVisible] = useState(false);

  // Poll once on mount to set initial state
  const checkSale = useCallback(async () => {
    try {
      const res = await fetch("/api/settings/live-sale");
      if (!res.ok) return;
      const data = await res.json();
      const dismissed = sessionStorage.getItem("liveSaleDismissed") === "true";
      setVisible(data.isActive && !dismissed);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { checkSale(); }, [checkSale]);

  // Keep CSS variable in sync
  useEffect(() => {
    document.body.style.setProperty("--banner-h", visible ? "44px" : "0px");
  }, [visible]);

  const handleDismiss = () => setVisible(false);

  return <LiveSaleBanner onDismiss={handleDismiss} />;
}

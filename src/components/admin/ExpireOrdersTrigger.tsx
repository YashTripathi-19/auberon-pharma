"use client";
import { useEffect } from "react";

// Fire-and-forget: triggers the expiry cron on every admin dashboard mount.
// Replace with a proper Vercel cron job before production deployment.
export default function ExpireOrdersTrigger() {
  useEffect(() => {
    fetch("/api/admin/cron/expire-orders").catch(() => {});
  }, []);
  return null;
}

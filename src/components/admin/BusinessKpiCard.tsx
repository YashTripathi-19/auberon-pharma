"use client";
import React, { useEffect, useState } from "react";
import KpiCard from "@/components/admin/KpiCard";
import { Briefcase } from "lucide-react";

export default function BusinessKpiCard() {
  const [total, setTotal] = useState<number | string>("—");
  const [pending, setPending] = useState<number>(0);

  useEffect(() => {
    fetch("/api/admin/businesses/count")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) { setTotal(data.total); setPending(data.pendingVerification); } })
      .catch(() => {});
  }, []);

  return (
    <KpiCard
      title="Businesses"
      value={total}
      icon={Briefcase}
      subtitle={pending > 0 ? `${pending} pending verification` : undefined}
      trend={pending > 0 ? "down" : "neutral"}
      accentColor="bg-amber-50 text-amber-600"
    />
  );
}

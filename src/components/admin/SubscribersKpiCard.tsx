"use client";
import React, { useEffect, useState } from "react";
import KpiCard from "@/components/admin/KpiCard";
import { Bell } from "lucide-react";

export default function SubscribersKpiCard() {
  const [count, setCount] = useState<number | string>("—");

  useEffect(() => {
    fetch("/api/admin/subscribers/count")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setCount(data.count); })
      .catch(() => {});
  }, []);

  return (
    <KpiCard
      title="Subscribers"
      value={count}
      icon={Bell}
      accentColor="bg-pink-50 text-pink-500"
    />
  );
}

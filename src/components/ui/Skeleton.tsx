import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  variant?: "card" | "table-row" | "text-line";
  className?: string;
  count?: number;
}

export default function Skeleton({ variant = "text-line", className, count = 1 }: SkeletonProps) {
  const items = Array.from({ length: count });

  if (variant === "card") {
    return (
      <div className={cn("space-y-4", className)}>
        {items.map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 space-y-3">
            <div className="skeleton h-48 rounded-lg" />
            <div className="skeleton h-5 rounded w-3/4" />
            <div className="skeleton h-4 rounded w-1/2" />
            <div className="skeleton h-4 rounded w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "table-row") {
    return (
      <div className={cn("space-y-2", className)}>
        {items.map((_, i) => (
          <div key={i} className="flex gap-4 p-3">
            <div className="skeleton h-5 rounded flex-1" />
            <div className="skeleton h-5 rounded flex-1" />
            <div className="skeleton h-5 rounded flex-1" />
            <div className="skeleton h-5 rounded w-20" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {items.map((_, i) => (
        <div key={i} className="skeleton h-4 rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
      ))}
    </div>
  );
}

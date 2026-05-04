"use client";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/layout/AdminSidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#F5F5F7]">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto min-w-0">
        <div style={{ padding: "48px 52px" }}>{children}</div>
      </main>
    </div>
  );
}

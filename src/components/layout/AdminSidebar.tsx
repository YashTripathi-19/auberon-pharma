"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, ClipboardList, BarChart2, LogOut, Menu, X, ArrowLeft, Inbox, Mail, Briefcase, Tag, Building2, Layers, Hospital, Star, PackageSearch, Handshake } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Layers },
  { href: "/admin/restock", label: "Restock", icon: PackageSearch },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/feedback", label: "Feedback", icon: Star },
  { href: "/admin/contacts", label: "Contacts", icon: Inbox },
  { href: "/admin/subscribers", label: "Subscribers", icon: Mail },
  { href: "/admin/businesses", label: "Businesses", icon: Briefcase },
  { href: "/admin/partners", label: "Partners", icon: Handshake },
  { href: "/admin/hospital", label: "Hospital", icon: Building2 },
  { href: "/admin/affiliated-hospitals", label: "Affiliated Hospitals", icon: Hospital },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [contactCount, setContactCount] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const fetchUnread = () => {
      fetch("/api/admin/contacts")
        .then((r) => r.ok ? r.json() : [])
        .then((data: { isRead?: boolean }[]) => {
          const unread = data.filter((c) => !c.isRead).length;
          setContactCount(unread > 0 ? unread : null);
        })
        .catch(() => {});
    };
    fetchUnread();
    window.addEventListener("contact-read", fetchUnread);
    return () => window.removeEventListener("contact-read", fetchUnread);
  }, []);

  if (mounted && pathname === "/admin/login") return null;
  if (!mounted) return <div className="hidden md:block" style={{ width: "240px", flexShrink: 0 }} />;

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div style={{ padding: "32px 28px", borderBottom: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
        <Link href="/admin" onClick={() => setMobileOpen(false)}>
          <p style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "1.3rem", fontWeight: 700, color: "white", letterSpacing: "0.04em" }}>Auberon</p>
          <p style={{ fontSize: "8px", color: "#C9963E", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 600, marginTop: "4px" }}>Admin Panel</p>
        </Link>
      </div>

      {/* Nav links — scrollable */}
      <nav style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "24px 16px", display: "flex", flexDirection: "column", gap: "4px" }} aria-label="Admin navigation">
        {LINKS.map((link) => {
          const isActive = mounted && (link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href));
          const Icon = link.icon;
          const badge = link.href === "/admin/contacts" ? contactCount : null;
          return (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
              style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "13px 16px", borderRadius: "12px",
                fontSize: "13px", fontWeight: 500,
                textDecoration: "none", transition: "all 0.2s",
                background: isActive ? "#C9963E" : "transparent",
                color: isActive ? "white" : "rgba(255,255,255,0.5)",
              }}
              className={!isActive ? "hover:bg-white/[0.08] hover:!text-white" : ""}>
              <Icon size={17} strokeWidth={isActive ? 2 : 1.5} />
              <span style={{ flex: 1 }}>{link.label}</span>
              {badge !== null && badge !== undefined && badge > 0 && (
                <span style={{ fontSize: "10px", fontWeight: 700, minWidth: "18px", height: "18px", borderRadius: "999px", background: isActive ? "rgba(255,255,255,0.3)" : "#C9963E", color: "white", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px", flexShrink: 0 }}>
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions — always visible */}
      <div style={{ padding: "20px 16px 28px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", gap: "4px", flexShrink: 0 }}>
        <button onClick={handleLogout}
          style={{ display: "flex", alignItems: "center", gap: "12px", padding: "13px 16px", borderRadius: "12px", fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.5)", background: "transparent", border: "none", cursor: "pointer", width: "100%", transition: "all 0.2s" }}
          className="hover:bg-white/[0.08] hover:!text-white" aria-label="Logout">
          <LogOut size={17} strokeWidth={1.5} />
          Sign Out
        </button>
        <Link href="/"
          style={{ display: "flex", alignItems: "center", gap: "12px", padding: "13px 16px", borderRadius: "12px", fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.35)", textDecoration: "none", transition: "all 0.2s" }}
          className="hover:bg-white/[0.08] hover:!text-white">
          <ArrowLeft size={15} strokeWidth={1.5} />
          Back to Website
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <button onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-primary border border-white/10 rounded-xl flex items-center justify-center shadow-sm"
        aria-label="Toggle sidebar">
        {mobileOpen ? <X size={16} className="text-white" /> : <Menu size={16} className="text-white" />}
      </button>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        suppressHydrationWarning
        className={cn("fixed top-0 left-0 h-screen flex flex-col z-40 transition-transform duration-300", "bg-primary border-r border-white/[0.06]", mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0")}
        style={{ width: "240px", flexShrink: 0 }}
        aria-label="Admin sidebar">
        {sidebarContent}
      </aside>

      <div className="hidden md:block" style={{ width: "240px", flexShrink: 0 }} />
    </>
  );
}

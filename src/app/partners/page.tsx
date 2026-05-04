"use client";

import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

interface Partner {
  id: string;
  name: string;
  category: string;
  description: string;
  website: string;
  logo: string;
  active: boolean;
  createdAt: string;
}

const categoryColors: Record<string, string> = {
  Hospital: "bg-blue-50 text-blue-600",
  Pharma: "bg-emerald-50 text-emerald-600",
  NGO: "bg-orange-50 text-orange-600",
  Clinic: "bg-purple-50 text-purple-600",
  Research: "bg-[#1a2744] text-white",
  Other: "bg-gray-100 text-gray-600",
};

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    async function fetchPartners() {
      try {
        const res = await fetch("/api/partners");
        if (res.ok) {
          const data = await res.json();
          setPartners(data);
        }
      } catch (err) {
        console.error("Failed to fetch partners:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPartners();
  }, []);

  const categories = ["All", ...Array.from(new Set(partners.map((p) => p.category)))];

  const filteredPartners =
    selectedCategory === "All"
      ? partners
      : partners.filter((p) => p.category === selectedCategory);

  return (
    <>
      <Navbar />
      <main style={{ background: "#f8f7f4", minHeight: "100vh" }}>
        {/* Hero Section with Pattern */}
        <section
          style={{
            background: "#1a2744",
            padding: "100px 0",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle diagonal pattern overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(201,147,58,0.05) 35px, rgba(201,147,58,0.05) 70px)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "0 48px",
              textAlign: "center",
              position: "relative",
              zIndex: 1,
            }}
          >
            <p
              style={{
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "#c9933a",
                marginBottom: "12px",
              }}
            >
              AUBERON PHARMACEUTICALS
            </p>

            <h1
              style={{
                fontFamily: "Cormorant Garamond, Georgia, serif",
                fontSize: "48px",
                fontWeight: 700,
                color: "#c9933a",
                marginBottom: "0",
                lineHeight: 1.2,
              }}
            >
              Our Partners & Sponsors
            </h1>

            {/* Gold divider */}
            <div
              style={{
                width: "60px",
                height: "2px",
                background: "#c9933a",
                margin: "28px auto 0",
              }}
            />

            <p
              style={{
                fontSize: "17px",
                color: "#f8f7f4",
                maxWidth: "500px",
                margin: "16px auto 0",
                lineHeight: 1.7,
              }}
            >
              Trusted organisations that share our vision for better eye care across India
            </p>
          </div>
        </section>

        {/* Stats Bar */}
        <section
          style={{
            background: "#162038",
            padding: "28px 0",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "0 48px",
              display: "flex",
              justifyContent: "center",
              gap: "64px",
              flexWrap: "wrap",
              textAlign: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "Cormorant Garamond, Georgia, serif",
                  fontSize: "28px",
                  fontWeight: 700,
                  color: "#c9933a",
                  marginBottom: "4px",
                }}
              >
                {partners.length > 0 ? partners.length : "Growing"}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#f8f7f4",
                  opacity: 0.8,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  marginTop: "4px",
                }}
              >
                Partners
              </div>
            </div>

            <div>
              <div
                style={{
                  fontFamily: "Cormorant Garamond, Georgia, serif",
                  fontSize: "28px",
                  fontWeight: 700,
                  color: "#c9933a",
                  marginBottom: "4px",
                }}
              >
                Pan India
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#f8f7f4",
                  opacity: 0.8,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  marginTop: "4px",
                }}
              >
                Reach
              </div>
            </div>

            <div>
              <div
                style={{
                  fontFamily: "Cormorant Garamond, Georgia, serif",
                  fontSize: "28px",
                  fontWeight: 700,
                  color: "#c9933a",
                  marginBottom: "4px",
                }}
              >
                15+
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "#f8f7f4",
                  opacity: 0.8,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  marginTop: "4px",
                }}
              >
                Years of Trust
              </div>
            </div>
          </div>
        </section>

        {/* Partners Grid Section */}
        <section style={{ padding: "80px 0" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 48px" }}>
            {/* Category Filter Pills */}
            {!loading && partners.length > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                  marginBottom: "48px",
                }}
              >
                {categories.map((category) => {
                  const isActive = selectedCategory === category;
                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      style={{
                        padding: "8px 24px",
                        borderRadius: "24px",
                        fontSize: "13px",
                        fontWeight: 600,
                        border: isActive ? "none" : "1px solid #1a2744",
                        background: isActive ? "#c9933a" : "white",
                        color: isActive ? "white" : "#1a2744",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = "#f8f7f4";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = "white";
                        }
                      }}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Loading Skeleton */}
            {loading && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "24px",
                }}
              >
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    style={{
                      background: "white",
                      borderRadius: "24px",
                      padding: "40px 32px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <div
                      className="animate-pulse"
                      style={{
                        width: "96px",
                        height: "96px",
                        borderRadius: "50%",
                        background: "#f3f4f6",
                      }}
                    />
                    <div
                      className="animate-pulse"
                      style={{
                        width: "140px",
                        height: "18px",
                        borderRadius: "4px",
                        background: "#f3f4f6",
                        marginTop: "20px",
                      }}
                    />
                    <div
                      className="animate-pulse"
                      style={{
                        width: "90px",
                        height: "14px",
                        borderRadius: "12px",
                        background: "#f3f4f6",
                        marginTop: "8px",
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredPartners.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "80px 20px",
                }}
              >
                <Building2
                  size={64}
                  style={{ margin: "0 auto 16px", color: "#d1d5db" }}
                />
                <p
                  style={{
                    fontFamily: "Cormorant Garamond, Georgia, serif",
                    fontSize: "22px",
                    color: "#1a2744",
                    marginBottom: "8px",
                  }}
                >
                  No partners found
                </p>
                <p style={{ fontSize: "15px", color: "#9ca3af" }}>
                  Check back soon as we grow our network.
                </p>
              </div>
            )}

            {/* Partners Grid */}
            {!loading && filteredPartners.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "28px",
                }}
              >
                {filteredPartners.map((partner) => (
                  <div
                    key={partner.id}
                    style={{
                      background: "white",
                      borderRadius: "20px",
                      padding: "40px 32px",
                      border: "1px solid #f0ede6",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      transition: "transform 250ms ease, box-shadow 250ms ease, border-color 250ms ease",
                      cursor: "default",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#c9933a";
                      e.currentTarget.style.boxShadow = "0 12px 32px rgba(26,39,68,0.12)";
                      e.currentTarget.style.transform = "translateY(-6px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#f0ede6";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    {/* Logo */}
                    <div
                      style={{
                        width: "96px",
                        height: "96px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {partner.logo ? (
                        <img
                          src={partner.logo}
                          alt={partner.name}
                          style={{
                            width: "96px",
                            height: "96px",
                            objectFit: "contain",
                            borderRadius: "12px",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "96px",
                            height: "96px",
                            borderRadius: "50%",
                            background: "#f3f4f6",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Building2 size={40} style={{ color: "#1a2744" }} />
                        </div>
                      )}
                    </div>

                    {/* Name */}
                    <h3
                      style={{
                        fontFamily: "Cormorant Garamond, Georgia, serif",
                        fontSize: "20px",
                        fontWeight: 700,
                        color: "#1a2744",
                        marginTop: "20px",
                        lineHeight: 1.3,
                      }}
                    >
                      {partner.name}
                    </h3>

                    {/* Category Badge */}
                    <span
                      className={`${categoryColors[partner.category] || categoryColors.Other}`}
                      style={{
                        fontSize: "12px",
                        fontWeight: 600,
                        padding: "4px 14px",
                        borderRadius: "20px",
                        marginTop: "10px",
                        display: "inline-block",
                      }}
                    >
                      {partner.category}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Become a Partner CTA Section */}
        <section
          style={{
            background: "#1a2744",
            padding: "100px 0",
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 48px" }}>
            <p
              style={{
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "#c9933a",
                marginBottom: "12px",
              }}
            >
              JOIN US
            </p>

            <h2
              style={{
                fontFamily: "Cormorant Garamond, Georgia, serif",
                fontSize: "40px",
                fontWeight: 700,
                color: "#c9933a",
                marginBottom: "0",
              }}
            >
              Want to Partner with Auberon?
            </h2>

            <p
              style={{
                fontSize: "16px",
                color: "#f8f7f4",
                maxWidth: "540px",
                margin: "16px auto 0",
                lineHeight: 1.8,
              }}
            >
              We collaborate with hospitals, clinics, pharma companies and NGOs who share
              our vision for better eye care across India. Let's grow together.
            </p>

            {/* Gold divider */}
            <div
              style={{
                width: "60px",
                height: "2px",
                background: "#c9933a",
                margin: "28px auto",
              }}
            />

            <div
              style={{
                display: "flex",
                gap: "16px",
                justifyContent: "center",
                flexWrap: "wrap",
                marginTop: "8px",
              }}
            >
              <Link
                href="/support"
                style={{
                  display: "inline-block",
                  padding: "14px 36px",
                  background: "#c9933a",
                  color: "white",
                  borderRadius: "30px",
                  fontSize: "15px",
                  fontWeight: 700,
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#b8832e";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#c9933a";
                }}
              >
                Get in Touch
              </Link>

              <Link
                href="/"
                style={{
                  display: "inline-block",
                  padding: "14px 36px",
                  background: "transparent",
                  color: "white",
                  border: "2px solid white",
                  borderRadius: "30px",
                  fontSize: "15px",
                  fontWeight: 600,
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                About Auberon
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

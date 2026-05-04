"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { whatsappOrderConfirmed } from "@/lib/whatsapp";
import { useState } from "react";

const WA_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="white" style={{ flexShrink: 0 }}>
    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.418A9.955 9.955 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.95 7.95 0 0 1-4.073-1.117l-.292-.174-3.027.863.872-2.944-.19-.302A7.95 7.95 0 0 1 4 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8zm4.406-5.884c-.241-.12-1.427-.703-1.648-.784-.221-.08-.382-.12-.543.12-.16.241-.622.784-.763.944-.14.161-.281.181-.522.06-.241-.12-1.018-.375-1.939-1.196-.716-.638-1.2-1.426-1.341-1.667-.14-.241-.015-.371.106-.491.108-.108.241-.281.362-.422.12-.14.16-.241.241-.402.08-.16.04-.301-.02-.422-.06-.12-.543-1.307-.743-1.79-.196-.47-.395-.406-.543-.414l-.462-.008c-.16 0-.422.06-.643.301-.221.241-.843.824-.843 2.01 0 1.186.863 2.332.983 2.493.12.16 1.698 2.593 4.115 3.637.575.248 1.023.396 1.372.507.577.183 1.102.157 1.517.095.463-.069 1.427-.583 1.628-1.146.2-.563.2-1.045.14-1.146-.06-.1-.221-.16-.462-.281z"/>
  </svg>
);

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id") || "N/A";
  const customerName = searchParams.get("name") || "Customer";
  const customerEmail = searchParams.get("email") || "";
  const isPaid = searchParams.get("paid") === "true";
  // wa=1 means a payment slip was sent — show the "Send Payment on WhatsApp" button
  const showPaymentWa = searchParams.get("wa") === "1" && !isPaid;

  // Quick feedback state
  const [quickRating, setQuickRating] = useState(0);
  const [quickMessage, setQuickMessage] = useState("");
  const [quickSubmitted, setQuickSubmitted] = useState(false);
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickError, setQuickError] = useState<string | null>(null);

  const handleQuickFeedback = async () => {
    if (quickRating === 0) return;

    setQuickLoading(true);
    setQuickError(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          customerName,
          customerEmail: customerEmail || "customer@example.com",
          overallRating: quickRating,
          message: quickMessage,
          productRatings: [],
          submittedAt: new Date().toISOString(),
          feedbackType: "ordering_experience",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 400 && data.error?.includes("already submitted")) {
          setQuickError("Feedback already recorded ✓");
          setTimeout(() => setQuickSubmitted(true), 1000);
        } else {
          setQuickError("Couldn't save feedback, sorry!");
        }
        setQuickLoading(false);
        return;
      }

      setQuickSubmitted(true);
    } catch (err) {
      setQuickError("Couldn't save feedback, sorry!");
      setQuickLoading(false);
    }
  };

  const getRatingLabel = (rating: number): string => {
    switch (rating) {
      case 1: return "Poor";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Very Good";
      case 5: return "Excellent";
      default: return "";
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F5F5F7",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "48px 24px",
    }}>
      <div style={{ width: "100%", maxWidth: "560px" }}>
        <div style={{
          background: "white",
          borderRadius: "28px",
          padding: "64px 56px",
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.07)",
          textAlign: "center",
        }}>

          {/* Check icon */}
          <div style={{
            width: "80px", height: "80px",
            background: "#f0fdf4",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 36px",
          }}>
            <CheckCircle size={38} style={{ color: "#10b981" }} strokeWidth={1.5} />
          </div>

          {/* Payment badge */}
          {isPaid && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "999px", padding: "6px 16px", marginBottom: "20px", fontSize: "12px", fontWeight: 600, color: "#16a34a" }}>
              ✓ Payment Successful
            </div>
          )}

          {/* Heading */}
          <h1 style={{
            fontFamily: "Cormorant Garamond, Georgia, serif",
            fontSize: "2.6rem", fontWeight: 700,
            color: "#0B1F3A", lineHeight: 1.1,
            marginBottom: "16px",
          }}>
            Order Confirmed
          </h1>

          {/* Thank you */}
          <p style={{ fontSize: "16px", color: "#6E6E73", lineHeight: 1.7, marginBottom: "40px" }}>
            Thank you, <span style={{ color: "#0B1F3A", fontWeight: 600 }}>{customerName}</span>.{" "}
            Your booking has been received.
          </p>

          {/* Order reference box */}
          <div style={{
            background: "#F5F5F7",
            borderRadius: "16px",
            padding: "24px 28px",
            marginBottom: "36px",
          }}>
            <p style={{
              fontSize: "10px", color: "#6E6E73",
              textTransform: "uppercase", letterSpacing: "0.14em",
              fontWeight: 600, marginBottom: "10px",
            }}>
              Order Reference
            </p>
            <p style={{
              fontFamily: "monospace",
              fontSize: "16px", fontWeight: 600,
              color: "#0B1F3A", wordBreak: "break-all",
            }}>
              {orderId}
            </p>
          </div>

          {/* Info text */}
          <p style={{ fontSize: "14px", color: "#6E6E73", lineHeight: 1.8, marginBottom: "28px" }}>
            {isPaid
              ? <>Your payment has been confirmed. Our team will process your order and contact you within <span style={{ color: "#0B1F3A", fontWeight: 600 }}>24 hours</span> with delivery details.</>
              : <>Our team will review your order and contact you within <span style={{ color: "#0B1F3A", fontWeight: 600 }}>24 hours</span> to confirm delivery details and payment.</>
            }
          </p>

          {/* WhatsApp help block */}
          <div style={{ marginBottom: "36px" }}>
            {showPaymentWa && (
              <div style={{ marginBottom: "16px" }}>
                <p style={{ fontSize: "14px", color: "#0B1F3A", fontWeight: 600, marginBottom: "10px" }}>
                  Check your email for the payment slip, then send us the screenshot:
                </p>
                <a
                  href={whatsappOrderConfirmed(orderId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "#25D366",
                    color: "white",
                    borderRadius: "8px",
                    padding: "10px 20px",
                    fontSize: "14px",
                    fontWeight: 700,
                    textDecoration: "none",
                    marginBottom: "8px",
                  }}
                >
                  {WA_ICON}
                  Send Payment on WhatsApp
                </a>
              </div>
            )}
            <p style={{ fontSize: "14px", color: "#0B1F3A", fontWeight: 600, marginBottom: "12px" }}>
              Need help with this order?
            </p>
            <a
              href={whatsappOrderConfirmed(orderId)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "#25D366",
                color: "white",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              {WA_ICON}
              Chat on WhatsApp
            </a>
          </div>

          {/* Quick Feedback Section */}
          {orderId !== "N/A" && (
            <>
              <div style={{ height: "1px", background: "rgba(0,0,0,0.06)", margin: "32px 0" }} />
              
              <div style={{ marginTop: "32px", textAlign: "center" }}>
                {!quickSubmitted ? (
                  <>
                    <h2 style={{
                      fontFamily: "Cormorant Garamond, Georgia, serif",
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "#1a2744",
                      marginBottom: "8px",
                    }}>
                      How was your experience?
                    </h2>
                    <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "20px" }}>
                      Rate your ordering experience today
                    </p>

                    {/* Star Rating */}
                    <div style={{ display: "flex", justifyContent: "center", gap: "4px", marginBottom: "12px" }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setQuickRating(star)}
                          disabled={quickLoading}
                          style={{
                            fontSize: "32px",
                            color: quickRating >= star ? "#c9933a" : "#d1d5db",
                            cursor: quickLoading ? "not-allowed" : "pointer",
                            background: "none",
                            border: "none",
                            padding: 0,
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            if (!quickLoading) e.currentTarget.style.transform = "scale(1.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                        >
                          {quickRating >= star ? "★" : "☆"}
                        </button>
                      ))}
                    </div>

                    {quickRating > 0 && (
                      <div style={{ fontSize: "14px", color: "#c9933a", fontWeight: 500, marginBottom: "20px" }}>
                        {getRatingLabel(quickRating)}
                      </div>
                    )}

                    {/* Message textarea - shows after rating */}
                    {quickRating > 0 && (
                      <div style={{
                        opacity: 1,
                        transition: "opacity 0.3s ease-in",
                        marginBottom: "20px",
                      }}>
                        <textarea
                          value={quickMessage}
                          onChange={(e) => setQuickMessage(e.target.value)}
                          placeholder="Anything you'd like to tell us? (optional)"
                          rows={3}
                          disabled={quickLoading}
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            fontSize: "14px",
                            border: "1px solid #d1d5db",
                            borderRadius: "8px",
                            fontFamily: "inherit",
                            resize: "vertical",
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = "#c9933a";
                            e.target.style.outline = "none";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = "#d1d5db";
                          }}
                        />
                      </div>
                    )}

                    {/* Error message */}
                    {quickError && (
                      <div style={{
                        padding: "10px",
                        marginBottom: "16px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        background: quickError.includes("✓") ? "#f0fdf4" : "#fef2f2",
                        color: quickError.includes("✓") ? "#16a34a" : "#dc2626",
                      }}>
                        {quickError}
                      </div>
                    )}

                    {/* Submit button */}
                    {quickRating > 0 && (
                      <button
                        onClick={handleQuickFeedback}
                        disabled={quickLoading}
                        style={{
                          padding: "12px 28px",
                          background: quickLoading ? "#d1d5db" : "#c9933a",
                          color: "white",
                          border: "none",
                          borderRadius: "24px",
                          fontSize: "14px",
                          fontWeight: 600,
                          cursor: quickLoading ? "not-allowed" : "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        {quickLoading ? (
                          <>
                            <span style={{
                              width: "14px",
                              height: "14px",
                              border: "2px solid white",
                              borderTopColor: "transparent",
                              borderRadius: "50%",
                              animation: "spin 0.6s linear infinite",
                            }} />
                            Submitting...
                          </>
                        ) : (
                          "Submit Quick Feedback"
                        )}
                      </button>
                    )}
                  </>
                ) : (
                  <div style={{ padding: "20px 0" }}>
                    <div style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: "#c9933a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 16px",
                      fontSize: "28px",
                      color: "white",
                    }}>
                      ✓
                    </div>
                    <p style={{ fontSize: "16px", fontWeight: 600, color: "#1a2744", marginBottom: "6px" }}>
                      Thank you for your feedback!
                    </p>
                    <p style={{ fontSize: "13px", color: "#6b7280" }}>
                      It means a lot to us.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "36px" }}>
            <Link
              href="/products"
              className="btn-primary btn-gold"
              style={{ fontSize: "15px", padding: "16px 24px", textAlign: "center", textDecoration: "none", display: "block" }}
            >
              Browse Products
            </Link>
            <Link
              href="/support"
              className="btn-primary btn-outline-navy"
              style={{ fontSize: "15px", padding: "16px 24px", textAlign: "center", textDecoration: "none", display: "block" }}
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

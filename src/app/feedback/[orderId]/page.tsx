"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
}

interface ProductRating {
  productName: string;
  rating: number;
}

export default function FeedbackPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [overallRating, setOverallRating] = useState(0);
  const [message, setMessage] = useState("");
  const [productRatings, setProductRatings] = useState<ProductRating[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderFetchFailed, setOrderFetchFailed] = useState(false);
  
  // Fallback fields when order fetch fails
  const [fallbackName, setFallbackName] = useState("");
  const [fallbackEmail, setFallbackEmail] = useState("");

  useEffect(() => {
    async function fetchOrder() {
      try {
        console.log(`Fetching order: /api/orders/${orderId}`);
        const res = await fetch(`/api/orders/${orderId}`);
        console.log(`Order fetch response status: ${res.status}`);
        
        if (!res.ok) {
          console.warn(`Order fetch failed with status ${res.status}`);
          // Don't block the form - allow fallback
          setOrderFetchFailed(true);
          setLoading(false);
          
          // Try to load from localStorage
          const savedName = localStorage.getItem("feedback_name");
          const savedEmail = localStorage.getItem("feedback_email");
          if (savedName) setFallbackName(savedName);
          if (savedEmail) setFallbackEmail(savedEmail);
          return;
        }
        
        const orderData = await res.json();
        console.log("Order data loaded successfully");
        setOrder(orderData);
        
        // Initialize product ratings from order items
        if (orderData.items && orderData.items.length > 0) {
          const ratings = orderData.items.map((item: OrderItem) => ({
            productName: item.productName,
            rating: 0,
          }));
          setProductRatings(ratings);
        }
        setLoading(false);
      } catch (err) {
        console.error("Order fetch error:", err);
        setOrderFetchFailed(true);
        setLoading(false);
        
        // Try to load from localStorage
        const savedName = localStorage.getItem("feedback_name");
        const savedEmail = localStorage.getItem("feedback_email");
        if (savedName) setFallbackName(savedName);
        if (savedEmail) setFallbackEmail(savedEmail);
      }
    }

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const handleSubmit = async () => {
    if (overallRating === 0) {
      setError("Please provide an overall rating");
      return;
    }

    // Use fallback fields if order fetch failed
    const customerName = order?.customerName || fallbackName;
    const customerEmail = order?.customerEmail || fallbackEmail;

    if (!customerName || !customerEmail) {
      setError("Please provide your name and email");
      return;
    }

    // Save to localStorage for future use
    if (orderFetchFailed) {
      localStorage.setItem("feedback_name", customerName);
      localStorage.setItem("feedback_email", customerEmail);
    }

    setSubmitting(true);
    setError(null);

    // Fill in any unrated products with overall rating as fallback
    const finalProductRatings = productRatings.map((pr) => ({
      ...pr,
      rating: pr.rating === 0 ? overallRating : pr.rating,
    }));

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          customerName,
          customerEmail,
          overallRating,
          message,
          productRatings: finalProductRatings,
          submittedAt: new Date().toISOString(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 400 && data.error?.includes("already submitted")) {
          setError("You've already submitted feedback for this order");
        } else {
          setError(data.error || "Failed to submit feedback");
        }
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch (err) {
      setError("Failed to submit feedback. Please try again.");
      setSubmitting(false);
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

  const renderStars = (
    currentRating: number,
    onRate: (rating: number) => void,
    size: number = 36
  ) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRate(star)}
            className="transition-all hover:scale-110"
            style={{
              fontSize: `${size}px`,
              color: currentRating >= star ? "#c9933a" : "#d1d5db",
              cursor: "pointer",
              background: "none",
              border: "none",
              padding: 0,
            }}
          >
            {currentRating >= star ? "★" : "☆"}
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f8f7f4",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ color: "#1a2744", fontSize: "18px" }}>Loading...</div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f8f7f4",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div
          style={{
            maxWidth: "560px",
            width: "100%",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "#c9933a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              fontSize: "48px",
              color: "white",
            }}
          >
            ✓
          </div>
          <h1
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "24px",
              color: "#1a2744",
              marginBottom: "12px",
            }}
          >
            Thank you, {order?.customerName || fallbackName}!
          </h1>
          <p
            style={{
              fontSize: "15px",
              color: "#6b7280",
              marginBottom: "32px",
            }}
          >
            Your feedback has been recorded.
          </p>
          <Link
            href="/"
            style={{
              display: "inline-block",
              padding: "12px 32px",
              background: "#c9933a",
              color: "white",
              borderRadius: "24px",
              textDecoration: "none",
              fontSize: "16px",
              fontWeight: 500,
            }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8f7f4",
        padding: "48px 24px",
      }}
    >
      <div
        style={{
          maxWidth: "560px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "20px",
              color: "#1a2744",
              marginBottom: "24px",
            }}
          >
            Auberon Pharmaceuticals
          </div>
          <h1
            style={{
              fontFamily: "Georgia, serif",
              fontSize: "28px",
              color: "#1a2744",
              marginBottom: "12px",
            }}
          >
            Share Your Experience
          </h1>
          <p
            style={{
              fontSize: "15px",
              color: "#6b7280",
            }}
          >
            Your feedback helps us serve you better
          </p>
        </div>

        {/* Form */}
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "32px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          {/* Order ID Display */}
          <div style={{ marginBottom: "24px", padding: "12px", background: "#f8f7f4", borderRadius: "8px" }}>
            <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Order ID</div>
            <div style={{ fontSize: "14px", color: "#1a2744", fontWeight: 600, fontFamily: "monospace" }}>
              {orderId}
            </div>
          </div>

          {/* Fallback Name/Email fields if order fetch failed */}
          {orderFetchFailed && (
            <>
              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#1a2744",
                    marginBottom: "8px",
                  }}
                >
                  Your Name *
                </label>
                <input
                  type="text"
                  value={fallbackName}
                  onChange={(e) => setFallbackName(e.target.value)}
                  placeholder="Enter your name"
                  style={{
                    width: "100%",
                    padding: "12px",
                    fontSize: "15px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                  }}
                />
              </div>
              <div style={{ marginBottom: "32px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#1a2744",
                    marginBottom: "8px",
                  }}
                >
                  Your Email *
                </label>
                <input
                  type="email"
                  value={fallbackEmail}
                  onChange={(e) => setFallbackEmail(e.target.value)}
                  placeholder="Enter your email"
                  style={{
                    width: "100%",
                    padding: "12px",
                    fontSize: "15px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                  }}
                />
              </div>
            </>
          )}

          {/* Overall Rating */}
          <div style={{ marginBottom: "32px" }}>
            <label
              style={{
                display: "block",
                fontSize: "16px",
                fontWeight: 600,
                color: "#1a2744",
                marginBottom: "12px",
              }}
            >
              Overall Experience
            </label>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              {renderStars(overallRating, setOverallRating)}
              {overallRating > 0 && (
                <div
                  style={{
                    fontSize: "14px",
                    color: "#c9933a",
                    fontWeight: 500,
                  }}
                >
                  {getRatingLabel(overallRating)}
                </div>
              )}
            </div>
          </div>

          {/* Product-wise Ratings */}
          {productRatings.length > 0 && (
            <div style={{ marginBottom: "32px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#1a2744",
                  marginBottom: "16px",
                }}
              >
                Rate Each Product
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {productRatings.map((pr, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "16px",
                      background: "#f8f7f4",
                      borderRadius: "8px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        color: "#1a2744",
                        marginBottom: "8px",
                        fontWeight: 500,
                      }}
                    >
                      {pr.productName}
                    </div>
                    {renderStars(
                      pr.rating,
                      (rating) => {
                        const updated = [...productRatings];
                        updated[index].rating = rating;
                        setProductRatings(updated);
                      },
                      28
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message */}
          <div style={{ marginBottom: "32px" }}>
            <label
              style={{
                display: "block",
                fontSize: "16px",
                fontWeight: 600,
                color: "#1a2744",
                marginBottom: "12px",
              }}
            >
              Tell us more (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What did you love? What can we improve?"
              rows={4}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "15px",
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

          {/* Error Message */}
          {error && (
            <div
              style={{
                padding: "12px",
                background: "#fee",
                border: "1px solid #fcc",
                borderRadius: "8px",
                color: "#c00",
                fontSize: "14px",
                marginBottom: "16px",
              }}
            >
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={submitting || overallRating === 0}
            style={{
              width: "100%",
              padding: "14px",
              background: overallRating === 0 || submitting ? "#d1d5db" : "#c9933a",
              color: "white",
              border: "none",
              borderRadius: "24px",
              fontSize: "16px",
              fontWeight: 600,
              cursor: overallRating === 0 || submitting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {submitting ? (
              <>
                <span
                  style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid white",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 0.6s linear infinite",
                  }}
                />
                Submitting...
              </>
            ) : (
              "Submit Feedback"
            )}
          </button>
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


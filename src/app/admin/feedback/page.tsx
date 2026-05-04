"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

interface ProductRating {
  productName: string;
  rating: number;
}

interface Feedback {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  overallRating: number;
  message: string;
  productRatings: ProductRating[];
  submittedAt: string;
}

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchFeedback() {
      try {
        const res = await fetch("/api/admin/feedback");
        if (res.ok) {
          const data = await res.json();
          setFeedback(data);
        }
      } catch (err) {
        console.error("Failed to fetch feedback:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFeedback();
  }, []);

  const filteredFeedback = feedback.filter((f) => {
    const matchesRating = ratingFilter === "all" || f.overallRating === parseInt(ratingFilter);
    const matchesSearch = searchQuery === "" || 
      f.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRating && matchesSearch;
  });

  const totalReviews = feedback.length;
  const avgRating = totalReviews > 0 
    ? (feedback.reduce((sum, f) => sum + f.overallRating, 0) / totalReviews).toFixed(1)
    : "0.0";
  const fiveStarCount = feedback.filter((f) => f.overallRating === 5).length;
  
  const now = new Date();
  const thisMonthCount = feedback.filter((f) => {
    const date = new Date(f.submittedAt);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  const renderStars = (rating: number, size: number = 16) => {
    return (
      <div style={{ display: "flex", gap: "2px" }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            fill={rating >= star ? "#c9933a" : "none"}
            stroke={rating >= star ? "#c9933a" : "#d1d5db"}
            strokeWidth={1.5}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "400px" }}>
        <div style={{ color: "#6E6E73", fontSize: "15px" }}>Loading feedback...</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "8px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div>
          <h1 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "2rem", fontWeight: 700, color: "#0B1F3A", lineHeight: 1.1 }}>
            Customer Feedback
          </h1>
          <p style={{ fontSize: "14px", color: "#6E6E73", marginTop: "6px" }}>
            Reviews and ratings from delivered orders
          </p>
        </div>
        {totalReviews > 0 && (
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "8px",
            padding: "8px 16px",
            background: "#fff9f0",
            border: "1px solid #c9933a20",
            borderRadius: "20px",
            fontSize: "14px",
            fontWeight: 600,
            color: "#c9933a"
          }}>
            <span>{totalReviews} reviews</span>
            <span style={{ color: "#d1d5db" }}>·</span>
            <span>Avg {avgRating}★</span>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <div style={{ 
          background: "white", 
          borderRadius: "12px", 
          padding: "20px", 
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}>
          <div style={{ fontSize: "13px", color: "#6E6E73", marginBottom: "8px", fontWeight: 500 }}>
            Total Reviews
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#0B1F3A" }}>
            {totalReviews}
          </div>
        </div>

        <div style={{ 
          background: "white", 
          borderRadius: "12px", 
          padding: "20px", 
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}>
          <div style={{ fontSize: "13px", color: "#6E6E73", marginBottom: "8px", fontWeight: 500 }}>
            Average Rating
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ fontSize: "28px", fontWeight: 700, color: "#c9933a" }}>
              {avgRating}
            </div>
            <Star size={20} fill="#c9933a" stroke="#c9933a" />
          </div>
        </div>

        <div style={{ 
          background: "white", 
          borderRadius: "12px", 
          padding: "20px", 
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}>
          <div style={{ fontSize: "13px", color: "#6E6E73", marginBottom: "8px", fontWeight: 500 }}>
            5 Star Reviews
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#0B1F3A" }}>
            {fiveStarCount}
          </div>
        </div>

        <div style={{ 
          background: "white", 
          borderRadius: "12px", 
          padding: "20px", 
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}>
          <div style={{ fontSize: "13px", color: "#6E6E73", marginBottom: "8px", fontWeight: 500 }}>
            This Month
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#0B1F3A" }}>
            {thisMonthCount}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          style={{
            padding: "10px 14px",
            border: "1px solid rgba(0,0,0,0.1)",
            borderRadius: "8px",
            fontSize: "14px",
            color: "#0B1F3A",
            background: "white",
            cursor: "pointer",
            minWidth: "140px"
          }}
        >
          <option value="all">All Ratings</option>
          <option value="5">5★ Only</option>
          <option value="4">4★ Only</option>
          <option value="3">3★ Only</option>
          <option value="2">2★ Only</option>
          <option value="1">1★ Only</option>
        </select>

        <input
          type="text"
          placeholder="Search by order ID or customer name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            minWidth: "250px",
            padding: "10px 14px",
            border: "1px solid rgba(0,0,0,0.1)",
            borderRadius: "8px",
            fontSize: "14px",
            color: "#0B1F3A"
          }}
        />
      </div>

      {/* Feedback Cards */}
      {filteredFeedback.length === 0 ? (
        <div style={{ 
          textAlign: "center", 
          padding: "80px 20px",
          color: "#6E6E73",
          fontSize: "15px"
        }}>
          {feedback.length === 0 ? "No feedback received yet" : "No feedback matches your filters"}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredFeedback.map((f) => (
            <div
              key={f.id}
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "24px",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
              }}
            >
              {/* Top Row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 600, color: "#0B1F3A", marginBottom: "4px" }}>
                    {f.customerName}
                  </div>
                  <div style={{ fontSize: "13px", color: "#6E6E73" }}>
                    {f.customerEmail}
                  </div>
                </div>
                <div style={{ fontSize: "13px", color: "#6E6E73", textAlign: "right" }}>
                  {formatDate(f.submittedAt)}
                </div>
              </div>

              {/* Order ID + Overall Rating */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <div style={{
                  display: "inline-block",
                  padding: "4px 12px",
                  background: "#fff9f0",
                  border: "1px solid #c9933a20",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#c9933a"
                }}>
                  #{f.orderId}
                </div>
                {renderStars(f.overallRating, 18)}
              </div>

              {/* Message */}
              {f.message && (
                <div style={{
                  padding: "14px",
                  background: "#f8f7f4",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: "#333",
                  fontStyle: "italic",
                  lineHeight: 1.6,
                  marginBottom: "16px"
                }}>
                  &ldquo;{f.message}&rdquo;
                </div>
              )}

              {/* Product Ratings */}
              {f.productRatings && f.productRatings.length > 0 && (
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#0B1F3A", marginBottom: "10px" }}>
                    Product Ratings:
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                    {f.productRatings.map((pr, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "8px 12px",
                          background: "#f8f7f4",
                          borderRadius: "8px",
                          fontSize: "13px"
                        }}
                      >
                        <span style={{ color: "#0B1F3A", fontWeight: 500 }}>
                          {pr.productName}
                        </span>
                        {renderStars(pr.rating, 14)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

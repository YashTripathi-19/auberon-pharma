"use client";

import { useEffect, useState } from "react";
import { Trash2, Bell } from "lucide-react";

interface RestockNotification {
  id: string;
  productId: string;
  productName: string;
  orderId: string;
  userEmail: string;
  userName: string;
  requestedAt: string;
  notified: boolean;
  notifiedAt?: string;
}

export default function AdminRestockPage() {
  const [requests, setRequests] = useState<RestockNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [notifying, setNotifying] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/admin/restock");
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error("Failed to fetch restock requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/restock?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== id));
        setDeleteConfirm(null);
      }
    } catch (err) {
      console.error("Failed to delete request:", err);
    } finally {
      setDeleting(null);
    }
  };

  const handleNotify = async (productId: string) => {
    setNotifying(productId);
    try {
      const res = await fetch("/api/admin/restock/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();

      if (res.ok) {
        setToast({
          type: "success",
          message: `Notified ${data.notifiedCount} customer${data.notifiedCount !== 1 ? "s" : ""}`,
        });
        // Refetch to update UI
        await fetchRequests();
      } else {
        setToast({
          type: "error",
          message: "Failed to send notifications",
        });
      }
    } catch (err) {
      console.error("Failed to notify customers:", err);
      setToast({
        type: "error",
        message: "Failed to send notifications",
      });
    } finally {
      setNotifying(null);
      // Auto-hide toast after 3 seconds
      setTimeout(() => setToast(null), 3000);
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "pending" && !r.notified) ||
      (statusFilter === "notified" && r.notified);
    const matchesSearch =
      searchQuery === "" ||
      r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.userEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalRequests = requests.length;
  const notifiedCount = requests.filter((r) => r.notified).length;
  const pendingCount = requests.filter((r) => !r.notified).length;

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "—";
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  // Group requests by productId to show "Notify Now" button per product
  const productGroups = requests.reduce((acc, req) => {
    if (!acc[req.productId]) {
      acc[req.productId] = {
        productName: req.productName,
        productId: req.productId,
        pendingCount: 0,
      };
    }
    if (!req.notified) {
      acc[req.productId].pendingCount++;
    }
    return acc;
  }, {} as Record<string, { productName: string; productId: string; pendingCount: number }>);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "400px" }}>
        <div style={{ color: "#6E6E73", fontSize: "15px" }}>Loading restock requests...</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "8px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div>
          <h1 style={{ fontFamily: "Cormorant Garamond, Georgia, serif", fontSize: "2rem", fontWeight: 700, color: "#0B1F3A", lineHeight: 1.1 }}>
            Restock Requests
          </h1>
          <p style={{ fontSize: "14px", color: "#6E6E73", marginTop: "6px" }}>
            Customer alerts for out-of-stock products
          </p>
        </div>
        {pendingCount > 0 && (
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
            {pendingCount} pending alert{pendingCount !== 1 ? "s" : ""}
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
            Total Requests
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#0B1F3A" }}>
            {totalRequests}
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
            Notified
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#16a34a" }}>
            {notifiedCount}
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
            Pending
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#c9933a" }}>
            {pendingCount}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
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
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="notified">Notified</option>
        </select>

        <input
          type="text"
          placeholder="Search by product name or email..."
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

      {/* Notify Now Buttons by Product */}
      {Object.values(productGroups).filter(g => g.pendingCount > 0).length > 0 && (
        <div style={{ background: "white", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.06)", padding: "24px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#0B1F3A", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Notify Customers
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            {Object.values(productGroups)
              .filter(g => g.pendingCount > 0)
              .map((group) => (
                <button
                  key={group.productId}
                  onClick={() => handleNotify(group.productId)}
                  disabled={notifying === group.productId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 18px",
                    background: notifying === group.productId ? "#d1d5db" : "#c9933a",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: notifying === group.productId ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (notifying !== group.productId) {
                      e.currentTarget.style.background = "#b07e2e";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (notifying !== group.productId) {
                      e.currentTarget.style.background = "#c9933a";
                    }
                  }}
                >
                  <Bell size={14} />
                  {notifying === group.productId ? (
                    "Sending..."
                  ) : (
                    <>
                      {group.productName} ({group.pendingCount})
                    </>
                  )}
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Requests Table */}
      {filteredRequests.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "80px 20px",
          color: "#6E6E73",
          fontSize: "15px"
        }}>
          {requests.length === 0 ? "No restock requests yet" : "No requests match your filters"}
        </div>
      ) : (
        <div style={{ background: "white", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F5F5F7", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "10px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Product Name
                  </th>
                  <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "10px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Requested By
                  </th>
                  <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "10px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Email
                  </th>
                  <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "10px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Requested Qty
                  </th>
                  <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "10px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Order ID
                  </th>
                  <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "10px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Requested At
                  </th>
                  <th style={{ padding: "14px 20px", textAlign: "left", fontSize: "10px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Status
                  </th>
                  <th style={{ padding: "14px 20px", textAlign: "center", fontSize: "10px", fontWeight: 600, color: "#6E6E73", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req, i) => (
                  <tr key={req.id} style={{ borderBottom: i < filteredRequests.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none" }} className="hover:bg-[#F5F5F7] transition-colors">
                    <td style={{ padding: "16px 20px", fontSize: "13px", color: "#0B1F3A", fontWeight: 500 }}>
                      {req.productName}
                    </td>
                    <td style={{ padding: "16px 20px", fontSize: "13px", color: "#0B1F3A" }}>
                      {req.userName}
                    </td>
                    <td style={{ padding: "16px 20px", fontSize: "13px", color: "#6E6E73" }}>
                      {req.userEmail}
                    </td>
                    <td style={{ padding: "16px 20px", fontSize: "13px", color: "#0B1F3A", fontWeight: 500 }}>
                      {(req as any).requestedQty || '—'}
                    </td>
                    <td style={{ padding: "16px 20px", fontSize: "11px", color: "#6E6E73", fontFamily: "monospace" }}>
                      {req.orderId ? req.orderId.slice(0, 12) + '…' : '—'}
                    </td>
                    <td style={{ padding: "16px 20px", fontSize: "11px", color: "#6E6E73", whiteSpace: "nowrap" }}>
                      {req.requestedAt
                        ? new Date(req.requestedAt).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <span style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        padding: "4px 12px",
                        borderRadius: "999px",
                        whiteSpace: "nowrap",
                        background: req.notified ? "#f0fdf4" : "#fff9f0",
                        color: req.notified ? "#16a34a" : "#c9933a"
                      }}>
                        {req.notified ? "Notified" : "Pending"}
                      </span>
                    </td>
                    <td style={{ padding: "16px 20px", textAlign: "center" }}>
                      {deleteConfirm === req.id ? (
                        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                          <button
                            onClick={() => handleDelete(req.id)}
                            disabled={deleting === req.id}
                            style={{
                              fontSize: "11px",
                              fontWeight: 600,
                              color: "white",
                              background: "#dc2626",
                              border: "none",
                              borderRadius: "6px",
                              padding: "4px 10px",
                              cursor: "pointer",
                              opacity: deleting === req.id ? 0.6 : 1
                            }}
                          >
                            {deleting === req.id ? "..." : "Confirm"}
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            style={{
                              fontSize: "11px",
                              fontWeight: 500,
                              color: "#6E6E73",
                              background: "none",
                              border: "1px solid rgba(0,0,0,0.12)",
                              borderRadius: "6px",
                              padding: "4px 10px",
                              cursor: "pointer"
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(req.id)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "32px",
                            height: "32px",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#dc2626",
                            borderRadius: "6px",
                            transition: "background 0.2s"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#fef2f2";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "none";
                          }}
                          aria-label="Delete request"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            padding: "14px 20px",
            background: toast.type === "success" ? "#10b981" : "#dc2626",
            color: "white",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: 500,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            zIndex: 1000,
            animation: "slideIn 0.3s ease",
          }}
        >
          {toast.message}
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";import { useCartStore, CartItem } from "@/store/cartStore";
import { formatCurrency } from "@/lib/utils";
import { Minus, Plus, Trash2, ShoppingBag, Tag, X, Bell, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const BULK_DENOMINATIONS = [10, 20, 50, 100, 200, 300, 500, 1000];

// Debounce helper
function debounce<T extends (...args: any[]) => any>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function QuantityControl({ item, isBulk }: { item: CartItem; isBulk: boolean }) {
  const { updateQuantity } = useCartStore();
  const [inputVal, setInputVal] = useState(String(item.quantity));
  const [borderError, setBorderError] = useState(false);
  const stock = item.stock ?? Infinity;
  const inputRef = useRef<HTMLInputElement>(null);
  const longPressInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const longPressTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Only sync when item is removed or added externally, never during typing
  useEffect(() => {
    // Only update if this is a completely new item or external change
    if (!inputRef.current || document.activeElement !== inputRef.current) {
      setInputVal(String(item.quantity));
    }
  }, [item.productId]); // Only trigger on product ID change, not quantity

  // Debounced update - only updates cart, never touches input state
  const debouncedUpdate = useCallback(
    debounce((productId: string, value: string) => {
      const num = parseInt(value, 10);
      if (!isNaN(num) && num >= 1) {
        const capped = Math.min(num, stock);
        if (num > stock) {
          setBorderError(true);
          setTimeout(() => setBorderError(false), 600);
        }
        updateQuantity(productId, capped);
      }
    }, 400),
    [stock, updateQuantity]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) {
      setInputVal(val);
      if (val !== "") {
        debouncedUpdate(item.productId, val);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
    if (e.key === "Escape") {
      setInputVal(String(item.quantity));
      e.currentTarget.blur();
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleInputBlur = () => {
    const parsed = parseInt(inputVal, 10);
    if (isNaN(parsed) || parsed < 1) {
      setInputVal("1");
      updateQuantity(item.productId, 1);
    } else if (parsed > stock) {
      setInputVal(String(stock));
      updateQuantity(item.productId, stock);
      setBorderError(true);
      setTimeout(() => setBorderError(false), 600);
    } else {
      setInputVal(String(parsed));
      updateQuantity(item.productId, parsed);
    }
  };

  const incrementValue = () => {
    const current = parseInt(inputVal, 10) || 1;
    const next = Math.min(current + 1, stock);
    if (next !== current) {
      setInputVal(String(next));
      updateQuantity(item.productId, next);
    }
  };

  const decrementValue = () => {
    const current = parseInt(inputVal, 10) || 1;
    const next = Math.max(current - 1, 1);
    if (next !== current) {
      setInputVal(String(next));
      updateQuantity(item.productId, next);
    }
  };

  const startLongPress = (action: 'increment' | 'decrement') => {
    // Clear any existing intervals
    if (longPressInterval.current) clearInterval(longPressInterval.current);
    if (longPressTimeout.current) clearTimeout(longPressTimeout.current);

    // First click
    if (action === 'increment') {
      incrementValue();
    } else {
      decrementValue();
    }

    // Start long press after 500ms
    longPressTimeout.current = setTimeout(() => {
      longPressInterval.current = setInterval(() => {
        if (action === 'increment') {
          incrementValue();
        } else {
          decrementValue();
        }
      }, 100); // Repeat every 100ms
    }, 500);
  };

  const stopLongPress = () => {
    if (longPressInterval.current) {
      clearInterval(longPressInterval.current);
      longPressInterval.current = null;
    }
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLongPress();
    };
  }, []);

  if (isBulk) {
    return (
      <div>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={inputVal}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleInputBlur}
          data-product-id={item.productId}
          style={{ 
            width: `${Math.max(72, String(inputVal).length * 14 + 28)}px`,
            minWidth: '72px',
            maxWidth: '120px',
            padding: '6px 10px',
            textAlign: 'center',
            border: borderError ? '1px solid #dc2626' : '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600',
            lineHeight: '1',
            boxSizing: 'border-box',
            color: '#0B1F3A',
            transition: 'border-color 200ms ease'
          }}
          aria-label="Quantity"
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "6px" }}>
          {BULK_DENOMINATIONS.map((d) => {
            const disabled = d > stock;
            return (
              <div key={d} style={{ position: "relative", display: "inline-block" }} className="denom-wrapper">
                <button
                  onClick={() => {
                    if (!disabled) {
                      setInputVal(String(d));
                      updateQuantity(item.productId, d);
                    }
                  }}
                  disabled={disabled}
                  style={{
                    padding: "3px 9px", borderRadius: "20px",
                    border: `1px solid ${disabled ? "rgba(0,0,0,0.08)" : "rgba(11,31,58,0.2)"}`,
                    background: item.quantity === d && !disabled ? "#C9963E" : "transparent",
                    color: disabled ? "#C0C0C0" : item.quantity === d ? "white" : "#0B1F3A",
                    fontSize: "0.72rem", fontWeight: 500,
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.35 : 1,
                    transition: "all 0.15s",
                    pointerEvents: disabled ? "none" : "auto",
                  }}
                  onMouseEnter={(e) => { if (!disabled && item.quantity !== d) e.currentTarget.style.background = "rgba(201,147,58,0.12)"; }}
                  onMouseLeave={(e) => { if (!disabled && item.quantity !== d) e.currentTarget.style.background = "transparent"; }}>
                  {d}
                </button>
                {disabled && (
                  <span className="denom-tooltip">Only {stock} in stock</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <button 
        onMouseDown={() => startLongPress('decrement')}
        onMouseUp={stopLongPress}
        onMouseLeave={stopLongPress}
        onTouchStart={() => startLongPress('decrement')}
        onTouchEnd={stopLongPress}
        className="w-7 h-7 rounded-full border border-black/[0.1] flex items-center justify-center hover:border-primary/30 transition-colors active:bg-black/[0.05]"
        aria-label="Decrease"><Minus size={11} /></button>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={inputVal}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleInputBlur}
        data-product-id={item.productId}
        style={{ 
          width: `${Math.max(52, String(inputVal).length * 14 + 28)}px`,
          minWidth: '52px',
          maxWidth: '100px',
          padding: '6px 8px',
          textAlign: 'center',
          border: borderError ? '1px solid #dc2626' : '1px solid #d1d5db',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '500',
          lineHeight: '1',
          boxSizing: 'border-box',
          color: '#0B1F3A',
          transition: 'border-color 200ms ease'
        }}
        aria-label="Quantity"
      />
      <button 
        onMouseDown={() => startLongPress('increment')}
        onMouseUp={stopLongPress}
        onMouseLeave={stopLongPress}
        onTouchStart={() => startLongPress('increment')}
        onTouchEnd={stopLongPress}
        disabled={item.quantity >= stock}
        className="w-7 h-7 rounded-full border border-black/[0.1] flex items-center justify-center hover:border-primary/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:bg-black/[0.05]"
        aria-label="Increase"><Plus size={11} /></button>
      {item.quantity >= stock && stock !== Infinity && (
        <span style={{ fontSize: "10px", fontWeight: 600, color: "#c9933a", background: "#fef9ec", padding: "1px 6px", borderRadius: "999px" }}>Max</span>
      )}
    </div>
  );
}

export default function CartSidebar({ onCheckout }: { onCheckout: () => void }) {
  const { items, removeItem, getTotalPrice, clearCart } = useCartStore();
  const [showMobile, setShowMobile] = useState(false);
  const [userRole, setUserRole] = useState<string>("customer");
  const [nudge, setNudge] = useState<{ text: string; type: "coupon" | "role" | "shipping" } | null>(null);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);
  
  // Request More panel state
  const [requestSelections, setRequestSelections] = useState<{
    [productId: string]: { selected: boolean; requestedQty: number };
  }>({});
  const [requestStatus, setRequestStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.ok ? r.json() : null)
      .then((u) => { if (u?.role) setUserRole(u.role); })
      .catch(() => {});
  }, []);

  // Compute affected items (out of stock or at max)
  const affectedItems = items.filter(
    (item) => item.quantity >= (item.stock ?? Infinity) || (item.stock ?? Infinity) === 0
  );

  // Initialize request selections when affected items change
  useEffect(() => {
    const newSelections: typeof requestSelections = {};
    affectedItems.forEach((item) => {
      newSelections[item.productId] = {
        selected: true,
        requestedQty: item.quantity + 10,
      };
    });
    setRequestSelections(newSelections);
    setRequestStatus("idle"); // Reset status when items change
  }, [affectedItems.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Compute nudge whenever cart changes
  useEffect(() => {
    if (nudgeDismissed) return;
    const total = getTotalPrice();

    // Check free shipping
    fetch("/api/settings/tax-charges").then((r) => r.ok ? r.json() : null).then((tax) => {
      if (tax && total >= tax.freeShippingAbove && total > 0) {
        setNudge({ text: "You've unlocked free handling!", type: "shipping" });
        return;
      }
      // Check coupons close to qualifying
      fetch("/api/admin/coupons").then((r) => r.ok ? r.json() : []).then((coupons: { code: string; minOrderValue: number; description: string; isActive: boolean; expiresAt: string | null }[]) => {
        const active = coupons.filter((c) => c.isActive && (!c.expiresAt || new Date(c.expiresAt) >= new Date()));
        const closest = active
          .filter((c) => c.minOrderValue > total && c.minOrderValue - total <= 200)
          .sort((a, b) => (a.minOrderValue - total) - (b.minOrderValue - total))[0];
        if (closest) {
          setNudge({ text: `Add ${formatCurrency(closest.minOrderValue - total)} more to unlock ${closest.code} — ${closest.description}!`, type: "coupon" });
        }
      }).catch(() => {});
    }).catch(() => {});
  }, [items, nudgeDismissed, getTotalPrice]);

  const isBulk = userRole === "wholesaler" || userRole === "clinic";

  const handleRequestRestock = async () => {
    setRequestStatus("loading");
    const toRequest = affectedItems.filter(
      (item) => requestSelections[item.productId]?.selected
    );

    // Send one request per selected item
    const promises = toRequest.map((item) =>
      fetch("/api/restock-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: item.productId,
          productName: item.productName,
          orderId: "",
          requestedQty: requestSelections[item.productId].requestedQty,
        }),
      })
    );

    try {
      await Promise.all(promises);
      setRequestStatus("success");
    } catch {
      setRequestStatus("error");
    }
  };

  const selectedCount = Object.values(requestSelections).filter((s) => s.selected).length;

  const Content = () => (
    <div className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden">
      {/* Header */}
      <div className="border-b border-black/[0.06] flex items-center justify-between" style={{ padding: "20px 20px" }}>
        <p className="font-display text-[1rem] font-semibold text-primary">
          Cart <span className="text-muted font-body text-[13px] font-normal ml-1">({items.length})</span>
        </p>
        {items.length > 0 && (
          <button onClick={clearCart} className="text-[11px] text-muted hover:text-red-500 transition-colors" aria-label="Clear cart">
            Clear all
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center" style={{ padding: "52px 24px" }}>
          <div className="w-12 h-12 bg-[#F5F5F7] rounded-full flex items-center justify-center" style={{ marginBottom: "16px" }}>
            <ShoppingBag size={20} className="text-muted/50" strokeWidth={1.5} />
          </div>
          <p className="text-[14px] text-primary font-medium" style={{ marginBottom: "4px" }}>Your cart is empty</p>
          <p className="text-[12px] text-muted">Add products to get started</p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-black/[0.04] max-h-[380px] overflow-y-auto">
            <AnimatePresence>
              {items.map((item: CartItem) => (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="group/item"
                  style={{ padding: "16px 20px" }}
                >
                  <div className="flex justify-between items-start" style={{ marginBottom: "12px" }}>
                    <p className="text-[13px] font-medium text-primary pr-2 line-clamp-2 leading-snug flex-1">
                      {item.productName}
                    </p>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="p-1 text-muted hover:text-red-500 transition-colors opacity-0 group-hover/item:opacity-100 shrink-0"
                      aria-label={`Remove ${item.productName}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <QuantityControl item={item} isBulk={isBulk} />
                    <span className="text-[13px] font-semibold text-primary tabular-nums">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Request More Panel */}
          {affectedItems.length > 0 && (
            <div style={{ padding: "0 20px 16px 20px" }}>
              <div style={{ height: "1px", background: "linear-gradient(to right, transparent, #c9933a, transparent)", marginBottom: "12px" }} />
              
              {requestStatus === "success" ? (
                <div
                  style={{
                    background: "#fffbf5",
                    border: "1px solid #f0e0c0",
                    borderRadius: "12px",
                    padding: "16px",
                    textAlign: "center",
                  }}
                >
                  <CheckCircle2 size={32} style={{ color: "#16a34a", margin: "0 auto 8px" }} />
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#1a2744", marginBottom: "4px" }}>
                    Restock requested!
                  </p>
                  <p style={{ fontSize: "12px", color: "#6b7280" }}>
                    We'll email you when it's back in stock.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    background: "#fffbf5",
                    border: "1px solid #f0e0c0",
                    borderRadius: "12px",
                    padding: "16px",
                  }}
                >
                  {/* Header */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                    <Bell size={16} style={{ color: "#c9933a" }} />
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#1a2744" }}>
                      Out of stock or need more?
                    </p>
                  </div>
                  <p style={{ fontSize: "11px", color: "#6b7280", marginBottom: "12px" }}>
                    Request restock for these items in one tap
                  </p>

                  {/* Affected Items List */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
                    {affectedItems.map((item) => {
                      const stock = item.stock ?? Infinity;
                      const isOutOfStock = stock === 0;
                      const selection = requestSelections[item.productId] || { selected: true, requestedQty: item.quantity + 10 };

                      return (
                        <div
                          key={item.productId}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "8px",
                            background: "white",
                            border: "1px solid #f0e0c0",
                            borderRadius: "8px",
                          }}
                        >
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            checked={selection.selected}
                            onChange={(e) =>
                              setRequestSelections({
                                ...requestSelections,
                                [item.productId]: { ...selection, selected: e.target.checked },
                              })
                            }
                            style={{ width: "14px", height: "14px", cursor: "pointer", accentColor: "#c9933a" }}
                          />

                          {/* Item info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p
                              style={{
                                fontSize: "12px",
                                fontWeight: 500,
                                color: "#1a2744",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {item.productName}
                            </p>
                          </div>

                          {/* Badge */}
                          <span
                            style={{
                              fontSize: "9px",
                              fontWeight: 600,
                              padding: "2px 6px",
                              borderRadius: "999px",
                              background: isOutOfStock ? "#fee2e2" : "#fef9ec",
                              color: isOutOfStock ? "#dc2626" : "#c9933a",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {isOutOfStock ? "Out of Stock" : "Max Reached"}
                          </span>

                          {/* Qty input */}
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <label style={{ fontSize: "10px", color: "#6b7280", whiteSpace: "nowrap" }}>
                              Need:
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={999}
                              value={selection.requestedQty}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                if (val >= 1 && val <= 999) {
                                  setRequestSelections({
                                    ...requestSelections,
                                    [item.productId]: { ...selection, requestedQty: val },
                                  });
                                }
                              }}
                              style={{
                                width: "64px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                padding: "4px 8px",
                                fontSize: "12px",
                                textAlign: "center",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleRequestRestock}
                    disabled={selectedCount === 0 || requestStatus === "loading"}
                    className="btn-primary btn-gold"
                    style={{
                      width: "100%",
                      padding: "10px 16px",
                      fontSize: "13px",
                      opacity: selectedCount === 0 || requestStatus === "loading" ? 0.5 : 1,
                      cursor: selectedCount === 0 || requestStatus === "loading" ? "not-allowed" : "pointer",
                    }}
                  >
                    {requestStatus === "loading" ? (
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                        <span className="animate-spin" style={{ display: "inline-block", width: "12px", height: "12px", border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%" }} />
                        Requesting...
                      </span>
                    ) : (
                      `Request Restock for ${selectedCount} item${selectedCount !== 1 ? "s" : ""}`
                    )}
                  </button>

                  {/* Error state */}
                  {requestStatus === "error" && (
                    <p style={{ fontSize: "11px", color: "#dc2626", marginTop: "8px", textAlign: "center" }}>
                      Something went wrong. Try again.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Total + CTA */}
          <div className="border-t border-black/[0.06] bg-[#F5F5F7]" style={{ padding: "20px" }}>
            {/* Nudge banner */}
            <AnimatePresence>
              {nudge && !nudgeDismissed && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "12px",
                    background: nudge.type === "shipping" ? "#f0fdf4" : "#fdf6e3",
                    border: `1px solid ${nudge.type === "shipping" ? "#bbf7d0" : "#c9933a"}`,
                    borderRadius: "10px", padding: "10px 12px",
                  }}>
                  <Tag size={13} style={{ color: nudge.type === "shipping" ? "#16a34a" : "#c9933a", flexShrink: 0, marginTop: "1px" }} />
                  <p style={{ fontSize: "12px", color: nudge.type === "shipping" ? "#14532d" : "#1a2744", flex: 1, lineHeight: 1.5 }}>{nudge.text}</p>
                  <button onClick={() => setNudgeDismissed(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", flexShrink: 0, padding: 0 }} aria-label="Dismiss">
                    <X size={12} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between" style={{ marginBottom: "16px" }}>
              <span className="text-[13px] text-muted" style={{ flexShrink: 0 }}>Total</span>
              <span 
                className="font-numeric font-bold text-primary" 
                style={{ 
                  fontSize: "1.4rem", 
                  overflow: "hidden", 
                  textOverflow: "ellipsis", 
                  whiteSpace: "nowrap", 
                  maxWidth: "160px", 
                  textAlign: "right",
                  transition: "color 200ms ease"
                }}
              >
                {formatCurrency(getTotalPrice())}
              </span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full btn-primary btn-gold text-[14px]"
              style={{ padding: "12px 20px" }}
              aria-label="Proceed to checkout"
            >
              Proceed to Checkout
            </button>
            <p className="text-[11px] text-muted text-center" style={{ marginTop: "12px" }}>
              We'll confirm your order within 24 hours
            </p>
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:block sticky top-24">
        <Content />
      </div>

      {/* Mobile FAB */}
      <div className="lg:hidden fixed bottom-5 right-5 z-40">
        {items.length > 0 && (
          <button
            onClick={() => setShowMobile(!showMobile)}
            className="bg-primary text-white p-3.5 rounded-full shadow-xl flex items-center gap-2 hover:bg-primary-light transition-colors"
            aria-label="Toggle cart"
          >
            <ShoppingBag size={18} strokeWidth={1.5} />
            <span className="text-[13px] font-semibold">{items.length}</span>
          </button>
        )}
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {showMobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              onClick={() => setShowMobile(false)}
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-3xl"
            >
              <Content />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

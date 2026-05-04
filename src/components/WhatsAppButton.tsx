"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { whatsappSupport } from "@/lib/whatsapp"

interface Message {
  from: "bot" | "user"
  text: string
  chips?: boolean
}

const CHIPS = [
  "Track my order",
  "Return & refund policy",
  "Product availability",
  "Wholesale / Clinic account",
  "Talk to a person",
]

function getBotResponse(input: string): string {
  const t = input.toLowerCase().trim()

  // Greetings — friendly reply instead of default fallback
  if (/^(hi|hey|hello|hii|helo|yo|sup|good morning|good evening|good afternoon|namaste|hola)[\s!.]*$/.test(t))
    return "Hey there! 👋 How can I help you today? Choose a topic below or type your question."

  if (/track|order status|where is my order/.test(t))
    return "You can track your order in your Profile → Orders section. If you need live help, tap 'Chat on WhatsApp' below! 📦"
  if (/return|refund|cancel/.test(t))
    return "Orders can be cancelled before they are shipped from your Profile → Orders page. Refunds are processed within 5-7 business days to your original payment method. 💳"
  if (/stock|available|restock/.test(t))
    return "You can request a restock alert on any product page and we'll email you the moment it's back. 📩"
  if (/wholesale|clinic|business|gst/.test(t))
    return "We support Wholesaler and Clinic accounts with special pricing. Register at /signup and our team will verify your account within 24 hours. 🏥"
  if (/talk|human|person|agent|help|support|contact/.test(t))
    return "Sure! Tap the 'Chat on WhatsApp' button below to connect with our team directly. We're available 9am–7pm IST. 📱"
  if (/price|cost|rate|how much/.test(t))
    return "You can find pricing on each product page. Wholesaler and Clinic accounts get special discounted rates after verification. 💰"
  if (/deliver|shipping|dispatch/.test(t))
    return "We typically dispatch within 24 hours of order confirmation. Delivery takes 3-5 business days depending on your location. 🚚"
  if (/payment|pay|upi|razorpay/.test(t))
    return "We accept UPI, cards, and net banking via Razorpay. For COD orders, a payment slip is sent to your email. 💳"

  return "I'm not sure about that one! Tap 'Chat on WhatsApp' below and our team will help you right away. 😊"
}

const OPENING: Message = {
  from: "bot",
  text: "Hi! 👋 I'm Auberon's support assistant. Ask me anything or choose a topic below:",
  chips: true,
}

export default function SupportChatWidget() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([OPENING])
  const [input, setInput] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  // Hide on all admin pages
  if (pathname?.startsWith("/admin")) return null

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isOpen])

  const sendMessage = (text: string) => {
    if (!text.trim()) return
    const userMsg: Message = { from: "user", text }
    const botMsg: Message = { from: "bot", text: getBotResponse(text), chips: true }
    setMessages(prev => [...prev, userMsg, botMsg])
    setInput("")
  }

  return (
    <>
      {/* Chat window */}
      {isOpen && (
        <div style={{
          position: "fixed",
          bottom: 136,
          left: 24,
          width: 300,
          height: 400,
          borderRadius: 16,
          background: "white",
          boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          zIndex: 9998,
        }}>
          {/* Header */}
          <div style={{
            background: "#1a2744",
            padding: "14px 18px",
            flexShrink: 0,
          }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, color: "#c9933a" }}>
              Auberon Support
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
              Typically replies instantly
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}>
            {messages.map((msg, i) => (
              <div key={i}>
                <div style={{
                  display: "flex",
                  justifyContent: msg.from === "user" ? "flex-end" : "flex-start",
                }}>
                  <div style={{
                    background: msg.from === "user" ? "#c9933a" : "#1a2744",
                    color: "white",
                    padding: "8px 12px",
                    borderRadius: 12,
                    fontSize: 13,
                    lineHeight: 1.5,
                    maxWidth: "80%",
                  }}>
                    {msg.text}
                  </div>
                </div>
                {/* Quick-reply chips */}
                {msg.chips && msg.from === "bot" && i === messages.length - 1 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                    {CHIPS.map(chip => (
                      <button
                        key={chip}
                        onClick={() => sendMessage(chip)}
                        style={{
                          padding: "4px 10px",
                          borderRadius: 999,
                          border: "1.5px solid #1a2744",
                          background: "white",
                          color: "#1a2744",
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input row */}
          <div style={{
            borderTop: "1px solid #f3f4f6",
            padding: "8px 10px",
            display: "flex",
            gap: 8,
            flexShrink: 0,
          }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage(input)}
              placeholder="Type a message..."
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                fontSize: 13,
                outline: "none",
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              style={{
                background: "#c9933a",
                border: "none",
                borderRadius: 8,
                padding: "8px 14px",
                color: "white",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              →
            </button>
          </div>

          {/* WhatsApp fallback */}
          <div style={{
            padding: "6px 12px 10px",
            textAlign: "center",
            flexShrink: 0,
          }}>
            <a
              href={whatsappSupport()}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 12,
                color: "#25D366",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              💬 Chat on WhatsApp →
            </a>
          </div>
        </div>
      )}

      {/* Trigger button */}
      <div style={{ position: "fixed", bottom: 80, left: 24, zIndex: 9999 }}>
        {/* Tooltip */}
        {!isOpen && (
          <div style={{
            position: "absolute",
            bottom: 64,
            right: 0,
            background: "#1a2744",
            color: "white",
            fontSize: 11,
            fontWeight: 600,
            padding: "5px 10px",
            borderRadius: 999,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            opacity: 0,
            transition: "opacity 0.2s",
          }}
            className="wa-tooltip"
          >
            Chat with us on WhatsApp
          </div>
        )}
        <button
          onClick={() => setIsOpen(o => !o)}
          aria-label={isOpen ? "Close support chat" : "Open support chat"}
          style={{
            width: 46,
            height: 46,
            borderRadius: "50%",
            background: "#25D366",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 12px rgba(37,211,102,0.35)",
            transition: "transform 0.2s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.1)"
            const tooltip = e.currentTarget.previousElementSibling as HTMLElement | null
            if (tooltip) tooltip.style.opacity = "1"
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"
            const tooltip = e.currentTarget.previousElementSibling as HTMLElement | null
            if (tooltip) tooltip.style.opacity = "0"
          }}
        >
          {isOpen ? (
            // X icon
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            // WhatsApp icon — clean centered phone in speech bubble
            <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.418A9.955 9.955 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.95 7.95 0 0 1-4.073-1.117l-.292-.174-3.027.863.872-2.944-.19-.302A7.95 7.95 0 0 1 4 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8zm4.406-5.884c-.241-.12-1.427-.703-1.648-.784-.221-.08-.382-.12-.543.12-.16.241-.622.784-.763.944-.14.161-.281.181-.522.06-.241-.12-1.018-.375-1.939-1.196-.716-.638-1.2-1.426-1.341-1.667-.14-.241-.015-.371.106-.491.108-.108.241-.281.362-.422.12-.14.16-.241.241-.402.08-.16.04-.301-.02-.422-.06-.12-.543-1.307-.743-1.79-.196-.47-.395-.406-.543-.414l-.462-.008c-.16 0-.422.06-.643.301-.221.241-.843.824-.843 2.01 0 1.186.863 2.332.983 2.493.12.16 1.698 2.593 4.115 3.637.575.248 1.023.396 1.372.507.577.183 1.102.157 1.517.095.463-.069 1.427-.583 1.628-1.146.2-.563.2-1.045.14-1.146-.06-.1-.221-.16-.462-.281z"/>
            </svg>
          )}
        </button>
      </div>
    </>
  )
}

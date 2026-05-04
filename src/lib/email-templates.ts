// ── BRAND TOKENS ──
const NAVY = "#1a2744"
const GOLD = "#c9933a"
const OFF_WHITE = "#f8f7f4"
const BODY_TEXT = "#333333"

const CTA_BUTTON = (text: string, href: string) =>
  `<a href="${href}" style="display:inline-block;background:${GOLD};color:#ffffff;padding:12px 28px;border-radius:6px;font-weight:bold;text-decoration:none;font-size:15px;font-family:Arial,sans-serif;">${text}</a>`

// ── BASE LAYOUT ──
function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Auberon Pharmaceuticals</title></head>
<body style="margin:0;padding:0;background-color:${OFF_WHITE};font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${OFF_WHITE};padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

        <!-- HEADER -->
        <tr>
          <td style="background-color:${NAVY};padding:32px 40px;text-align:center;">
            <div style="font-family:Georgia,serif;font-size:24px;font-weight:bold;color:${GOLD};letter-spacing:0.04em;">Auberon Pharmaceuticals</div>
            <div style="font-family:Arial,sans-serif;font-size:12px;color:${OFF_WHITE};margin-top:4px;letter-spacing:0.08em;">Trusted Eye Care</div>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="background-color:#ffffff;padding:32px 40px;font-size:15px;line-height:1.6;color:${BODY_TEXT};">
            ${content}
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background-color:${NAVY};padding:24px 40px;text-align:center;">
            <div style="font-family:Arial,sans-serif;font-size:12px;color:${OFF_WHITE};margin-bottom:6px;">auberon.pharma@gmail.com &nbsp;|&nbsp; +91 6307922085</div>
            <div style="font-family:Arial,sans-serif;font-size:12px;color:${OFF_WHITE};opacity:0.7;">&copy; 2025 Auberon Pharmaceuticals. All rights reserved.</div>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ── 1. OTP ──
export function otpEmailTemplate({ name, otp }: { name: string; otp: string }): { subject: string; html: string } {
  const content = `
    <p style="margin:0 0 16px;">Hi <strong>${name}</strong>,</p>
    <p style="margin:0 0 24px;">Use the verification code below to complete your sign-in. This code is valid for <strong>10 minutes</strong>.</p>
    <div style="text-align:center;margin:32px 0;">
      <div style="display:inline-block;background:${OFF_WHITE};border:2px solid ${GOLD};border-radius:10px;padding:20px 40px;">
        <span style="font-family:Georgia,serif;font-size:40px;font-weight:bold;color:${GOLD};letter-spacing:0.15em;">${otp}</span>
      </div>
    </div>
    <p style="margin:0 0 8px;text-align:center;font-size:13px;color:#666666;">Expires in 10 minutes. Do not share this code with anyone.</p>
    <hr style="border:none;border-top:1px solid #eeeeee;margin:28px 0;">
    <p style="margin:0;font-size:13px;color:#999999;">If you did not request this code, you can safely ignore this email.</p>
  `
  return {
    subject: "Your Auberon Verification Code",
    html: baseLayout(content)
  }
}

// ── 2. ORDER CONFIRMATION ──
export function orderConfirmationTemplate({ name, orderId, items, total, address }: {
  name: string
  orderId: string
  items: { name: string; qty: number; price: number }[]
  total: number
  address: string
}): { subject: string; html: string } {
  const rows = items.map((item, i) => `
    <tr style="background-color:${i % 2 === 0 ? "#ffffff" : OFF_WHITE};">
      <td style="padding:10px 14px;font-size:14px;color:${BODY_TEXT};">${item.name}</td>
      <td style="padding:10px 14px;font-size:14px;color:${BODY_TEXT};text-align:center;">${item.qty}</td>
      <td style="padding:10px 14px;font-size:14px;color:${BODY_TEXT};text-align:right;">&#8377;${item.price.toFixed(2)}</td>
    </tr>
  `).join("")

  const content = `
    <p style="margin:0 0 16px;">Hi <strong>${name}</strong>,</p>
    <p style="margin:0 0 24px;">Thank you for your order! We've received it and it's being processed.</p>

    <div style="background:${OFF_WHITE};border-radius:8px;padding:16px 20px;margin-bottom:24px;">
      <span style="font-size:13px;color:#666666;">Order ID: </span>
      <span style="font-family:Georgia,serif;font-size:16px;font-weight:bold;color:${GOLD};">#${orderId}</span>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:8px;">
      <thead>
        <tr style="background-color:${NAVY};">
          <th style="padding:10px 14px;font-size:12px;font-weight:600;color:#ffffff;text-align:left;letter-spacing:0.08em;">ITEM</th>
          <th style="padding:10px 14px;font-size:12px;font-weight:600;color:#ffffff;text-align:center;letter-spacing:0.08em;">QTY</th>
          <th style="padding:10px 14px;font-size:12px;font-weight:600;color:#ffffff;text-align:right;letter-spacing:0.08em;">PRICE</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        <tr style="border-top:2px solid ${NAVY};">
          <td colspan="2" style="padding:12px 14px;font-size:15px;font-weight:bold;color:${NAVY};">Total</td>
          <td style="padding:12px 14px;font-size:15px;font-weight:bold;color:${NAVY};text-align:right;">&#8377;${total.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    <div style="background:${OFF_WHITE};border-left:4px solid ${GOLD};border-radius:0 8px 8px 0;padding:14px 18px;margin:24px 0;">
      <div style="font-size:11px;font-weight:600;color:#666666;letter-spacing:0.1em;margin-bottom:6px;">DELIVERY ADDRESS</div>
      <div style="font-size:14px;color:${BODY_TEXT};line-height:1.5;">${address}</div>
    </div>

    <p style="margin:0;font-size:14px;color:#666666;">We'll email you when your order ships. Thank you for choosing Auberon Pharmaceuticals.</p>
  `
  return {
    subject: `Order Confirmed — #${orderId}`,
    html: baseLayout(content)
  }
}

// ── 3. ORDER STATUS ──
export function orderStatusTemplate({ name, orderId, status, message }: {
  name: string
  orderId: string
  status: string
  message?: string
}): { subject: string; html: string } {
  const messageBlock = message ? `
    <div style="background:${OFF_WHITE};border-left:4px solid ${NAVY};border-radius:0 8px 8px 0;padding:14px 18px;margin:20px 0;font-size:14px;color:${BODY_TEXT};line-height:1.6;">
      ${message}
    </div>
  ` : ""

  const content = `
    <p style="margin:0 0 16px;">Hi <strong>${name}</strong>,</p>
    <p style="margin:0 0 8px;">There's an update on your order <strong style="color:${NAVY};">#${orderId}</strong>.</p>
    <p style="margin:0 0 24px;">Your order is now: <strong style="color:${GOLD};font-size:17px;">${status}</strong></p>
    ${messageBlock}
    <p style="margin:24px 0 0;font-size:14px;color:#666666;">If you have any questions, reply to this email or contact us at auberon.pharma@gmail.com.</p>
  `
  return {
    subject: `Order Update — #${orderId}`,
    html: baseLayout(content)
  }
}

// ── 4. ORDER CANCELLED ──
export function orderCancelledTemplate({ name, orderId, refundAmount, reason }: {
  name: string
  orderId: string
  refundAmount?: number
  reason?: string
}): { subject: string; html: string } {
  const refundBlock = refundAmount != null ? `
    <div style="background:${OFF_WHITE};border-radius:8px;padding:16px 20px;margin:20px 0;text-align:center;">
      <div style="font-size:13px;color:#666666;margin-bottom:4px;">Refund Amount</div>
      <div style="font-family:Georgia,serif;font-size:28px;font-weight:bold;color:${GOLD};">&#8377;${refundAmount.toFixed(2)}</div>
      <div style="font-size:12px;color:#999999;margin-top:4px;">Refunds are processed within 5–7 business days.</div>
    </div>
  ` : ""

  const reasonBlock = reason ? `
    <div style="background:${OFF_WHITE};border-left:4px solid #dc2626;border-radius:0 8px 8px 0;padding:14px 18px;margin:20px 0;">
      <div style="font-size:11px;font-weight:600;color:#dc2626;letter-spacing:0.1em;margin-bottom:6px;">REASON</div>
      <div style="font-size:14px;color:${BODY_TEXT};">${reason}</div>
    </div>
  ` : ""

  const content = `
    <p style="margin:0 0 16px;">Hi <strong>${name}</strong>,</p>
    <p style="margin:0 0 8px;">We're sorry to inform you that your order <strong style="color:${NAVY};">#${orderId}</strong> has been cancelled.</p>
    ${reasonBlock}
    ${refundBlock}
    <p style="margin:20px 0 8px;">We sincerely apologise for any inconvenience caused. If you believe this is an error or need assistance, please reach out to us.</p>
    <p style="margin:0 0 24px;font-size:14px;color:#666666;">Email: auberon.pharma@gmail.com &nbsp;|&nbsp; Phone: +91 6307922085</p>
  `
  return {
    subject: `Order Cancelled — #${orderId}`,
    html: baseLayout(content)
  }
}

// ── 5. RESTOCK ──
export function restockTemplate({ name, productName }: {
  name: string
  productName: string
}): { subject: string; html: string } {
  const content = `
    <p style="margin:0 0 16px;">Hi <strong>${name}</strong>,</p>
    <p style="margin:0 0 8px;">Great news! The product you were waiting for is back.</p>
    <div style="text-align:center;margin:28px 0;">
      <div style="font-family:Georgia,serif;font-size:22px;font-weight:bold;color:${GOLD};margin-bottom:8px;">${productName}</div>
      <div style="font-size:14px;color:#dc2626;font-weight:600;margin-bottom:24px;">⚡ Limited stock — order soon before it sells out again.</div>
      ${CTA_BUTTON("Shop Now", "/shop")}
    </div>
    <p style="margin:24px 0 0;font-size:13px;color:#999999;text-align:center;">You're receiving this because you signed up for a restock alert.</p>
  `
  return {
    subject: `${productName} is Back in Stock!`,
    html: baseLayout(content)
  }
}

// ── 6. NEWSLETTER ──
export function newsletterTemplate({ subject: emailSubject, body, ctaText, ctaLink }: {
  subject: string
  body: string
  ctaText?: string
  ctaLink?: string
}): { subject: string; html: string } {
  const ctaBlock = ctaText && ctaLink ? `
    <div style="text-align:center;margin:28px 0;">
      ${CTA_BUTTON(ctaText, ctaLink)}
    </div>
  ` : ""

  const content = `
    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:${BODY_TEXT};">${body}</p>
    ${ctaBlock}
    <hr style="border:none;border-top:1px solid #eeeeee;margin:28px 0;">
    <p style="margin:0;font-size:12px;color:#999999;text-align:center;">You're receiving this because you subscribed to Auberon Pharmaceuticals updates.</p>
  `
  return {
    subject: emailSubject,
    html: baseLayout(content)
  }
}

// ── 7. CONTACT REPLY ──
export function contactReplyTemplate({ name, replyMessage }: {
  name: string
  replyMessage: string
}): { subject: string; html: string } {
  const content = `
    <p style="margin:0 0 16px;">Hi <strong>${name}</strong>,</p>
    <p style="margin:0 0 20px;">Thank you for reaching out to us. Here is our response to your enquiry:</p>

    <div style="background:${OFF_WHITE};border-left:4px solid ${NAVY};border-radius:0 8px 8px 0;padding:18px 20px;margin:0 0 24px;font-size:14px;color:${BODY_TEXT};line-height:1.7;">
      ${replyMessage}
    </div>

    <p style="margin:0 0 8px;font-size:14px;color:${BODY_TEXT};">Feel free to reply to this email for further assistance.</p>
    <p style="margin:0;font-size:14px;color:#666666;">Email: auberon.pharma@gmail.com &nbsp;|&nbsp; Phone: +91 6307922085</p>
  `
  return {
    subject: "Re: Your Enquiry — Auberon Pharmaceuticals",
    html: baseLayout(content)
  }
}

// ── 8. DAILY REPORT ──
export function dailyReportTemplate({ date, totalOrders, revenue, newUsers, lowStock }: {
  date: string
  totalOrders: number
  revenue: number
  newUsers: number
  lowStock: string[]
}): { subject: string; html: string } {
  const kpiCard = (label: string, value: string) => `
    <td width="50%" style="padding:8px;">
      <div style="background:${NAVY};border-radius:10px;padding:20px;text-align:center;">
        <div style="font-family:Georgia,serif;font-size:32px;font-weight:bold;color:${GOLD};line-height:1;">${value}</div>
        <div style="font-size:12px;color:#ffffff;margin-top:8px;letter-spacing:0.06em;opacity:0.8;">${label}</div>
      </div>
    </td>
  `

  const lowStockBlock = lowStock.length > 0 ? `
    <div style="margin-top:28px;">
      <div style="font-family:Georgia,serif;font-size:16px;font-weight:bold;color:${GOLD};margin-bottom:12px;">⚠ Low Stock Alert</div>
      <ul style="margin:0;padding-left:20px;">
        ${lowStock.map(p => `<li style="font-size:14px;color:${BODY_TEXT};margin-bottom:6px;">${p}</li>`).join("")}
      </ul>
    </div>
  ` : ""

  const content = `
    <p style="margin:0 0 8px;font-size:13px;color:#666666;">Report generated for</p>
    <p style="margin:0 0 28px;font-family:Georgia,serif;font-size:20px;font-weight:bold;color:${NAVY};">${date}</p>

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        ${kpiCard("TOTAL ORDERS", String(totalOrders))}
        ${kpiCard("REVENUE (₹)", `₹${revenue.toLocaleString("en-IN")}`)  }
      </tr>
      <tr>
        ${kpiCard("NEW USERS", String(newUsers))}
        ${kpiCard("LOW STOCK ITEMS", String(lowStock.length))}
      </tr>
    </table>

    ${lowStockBlock}

    <hr style="border:none;border-top:1px solid #eeeeee;margin:28px 0;">
    <p style="margin:0;font-size:12px;color:#999999;text-align:center;">This is an automated report from Auberon Pharmaceuticals admin system.</p>
  `
  return {
    subject: `Daily Business Report — ${date}`,
    html: baseLayout(content)
  }
}

// ── 9. PAYMENT SLIP ──
export function paymentSlipEmailTemplate({ name, orderId, slipHtml }: {
  name: string
  orderId: string
  slipHtml: string
}): { subject: string; html: string } {
  const waLink = `https://wa.me/916307922085?text=${encodeURIComponent(`Hi Auberon Pharmaceuticals! I just placed Order #${orderId}. Please confirm my order details.`)}`

  const content = `
    <p style="margin:0 0 16px;">Dear <strong>${name}</strong>,</p>
    <p style="margin:0 0 8px;">Thank you for your order! Please find your payment slip below.</p>
    <p style="margin:0 0 24px;">Complete your UPI payment to confirm your order.</p>

    ${slipHtml}

    <div style="text-align:center;margin:28px 0;">
      ${CTA_BUTTON("View My Orders", "/profile")}
    </div>

    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 18px;text-align:center;">
      <p style="font-size:13px;color:#374151;margin:0 0 8px;">After paying, please send us the payment screenshot on WhatsApp.</p>
      <a href="${waLink}" style="display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:700;color:#25D366;text-decoration:none;">
        💬 Send on WhatsApp →
      </a>
    </div>
  `
  return {
    subject: `Payment Slip — Order #${orderId} | Auberon Pharmaceuticals`,
    html: baseLayout(content)
  }
}

// ── 10. FEEDBACK REQUEST ──
export function feedbackRequestTemplate({ name, orderId, feedbackUrl }: {
  name: string
  orderId: string
  feedbackUrl: string
}): { subject: string; html: string } {
  const waLink = `https://wa.me/916307922085?text=${encodeURIComponent(`Hi Auberon Pharmaceuticals! I have a question about Order #${orderId}.`)}`

  const content = `
    <p style="margin:0 0 16px;">Dear <strong>${name}</strong>,</p>
    <p style="margin:0 0 8px;">Your order <strong style="color:${GOLD};">#${orderId}</strong> has been delivered! 🎉</p>
    <p style="margin:0 0 24px;">We'd love to hear what you think.</p>

    <div style="text-align:center;margin:32px 0;">
      ${CTA_BUTTON("Share My Feedback", feedbackUrl)}
    </div>

    <p style="margin:0 0 8px;text-align:center;font-size:14px;color:#666666;">It takes less than a minute and helps us improve.</p>

    <hr style="border:none;border-top:1px solid #eeeeee;margin:28px 0;">

    <div style="background:${OFF_WHITE};border-radius:10px;padding:16px 20px;text-align:center;">
      <p style="font-size:13px;color:#666666;margin:0 0 12px;">If you have any issues with your order, reply to this email or chat with us on WhatsApp.</p>
      <a href="${waLink}" style="display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:700;color:#25D366;text-decoration:none;justify-content:center;">
        💬 Chat on WhatsApp →
      </a>
    </div>
  `
  return {
    subject: "How was your order? Share your experience — Auberon",
    html: baseLayout(content)
  }
}

// ── 11. APPRECIATION EMAIL ──
export function appreciationEmailTemplate({ name, orderId, items }: {
  name: string
  orderId: string
  items: { name: string }[]
}): { subject: string; html: string } {
  const itemPills = items.map(item => 
    `<span style="display:inline-block;background:${NAVY};color:#ffffff;padding:6px 14px;border-radius:16px;font-size:13px;margin:4px;">${item.name}</span>`
  ).join("")

  const waLink = `https://wa.me/916307922085?text=${encodeURIComponent("Hi Auberon Pharmaceuticals! I'd like to join your WhatsApp community.")}`

  const content = `
    <p style="margin:0 0 16px;">Dear <strong>${name}</strong>,</p>
    <p style="margin:0 0 8px;">Your order <strong style="color:${GOLD};">#${orderId}</strong> has been delivered successfully.</p>
    <p style="margin:0 0 24px;">We truly appreciate your trust in Auberon Pharmaceuticals for your eye care needs.</p>

    <div style="margin:24px 0;">
      <div style="font-size:12px;color:#666666;margin-bottom:8px;font-weight:600;letter-spacing:0.05em;">YOUR ORDER</div>
      <div style="display:flex;flex-wrap:wrap;gap:4px;">
        ${itemPills}
      </div>
    </div>

    <hr style="border:none;border-top:2px solid ${GOLD};margin:32px 0;">

    <div style="text-align:center;margin:32px 0;">
      <h2 style="font-family:Georgia,serif;font-size:18px;font-weight:bold;color:${GOLD};margin:0 0 20px;">Why Families Trust Auberon</h2>
      
      <div style="text-align:left;max-width:480px;margin:0 auto;">
        <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:16px;">
          <span style="font-size:24px;line-height:1;">👁️</span>
          <p style="margin:0;font-size:14px;color:${BODY_TEXT};line-height:1.6;">Specialist ophthalmic products curated by experts</p>
        </div>
        
        <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:16px;">
          <span style="font-size:24px;line-height:1;">🏥</span>
          <p style="margin:0;font-size:14px;color:${BODY_TEXT};line-height:1.6;">Trusted by clinics and hospitals across India</p>
        </div>
        
        <div style="display:flex;align-items:flex-start;gap:12px;">
          <span style="font-size:24px;line-height:1;">💊</span>
          <p style="margin:0;font-size:14px;color:${BODY_TEXT};line-height:1.6;">Genuine medicines, always stored and shipped safely</p>
        </div>
      </div>
    </div>

    <hr style="border:none;border-top:2px solid ${GOLD};margin:32px 0;">

    <div style="text-align:center;margin:28px 0;">
      <div style="font-size:13px;color:#666666;margin-bottom:12px;font-weight:600;">STAY CONNECTED</div>
      <p style="font-size:13px;color:#666666;margin:0 0 12px;">Follow our journey and get eye health tips</p>
      <a href="${waLink}" style="display:inline-flex;align-items:center;gap:6px;font-size:14px;font-weight:700;color:#25D366;text-decoration:none;justify-content:center;">
        💬 Join our WhatsApp community →
      </a>
    </div>

    <div style="text-align:center;margin:32px 0;">
      ${CTA_BUTTON("Shop Again", "/shop")}
    </div>

    <div style="text-align:center;margin:32px 0 0;font-size:14px;color:${BODY_TEXT};line-height:1.8;">
      <p style="margin:0 0 4px;">With care,</p>
      <p style="margin:0;font-weight:600;">Team Auberon Pharmaceuticals</p>
      <p style="margin:4px 0 0;font-size:12px;color:#999999;">Kanpur, Uttar Pradesh</p>
    </div>
  `
  return {
    subject: "Thank you for choosing Auberon Pharmaceuticals 💙",
    html: baseLayout(content)
  }
}

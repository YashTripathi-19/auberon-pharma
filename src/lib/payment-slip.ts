import fs from "fs"
import path from "path"

interface SlipOrder {
  orderId: string
  customerName: string
  items: { name: string; qty: number; price: number }[]
  total: number
  upiId: string
}

function getUpiId(): string {
  try {
    const settings = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data/settings.json"), "utf-8"))
    return settings?.upiId || "auberon.pharma@oksbi"
  } catch {
    return "auberon.pharma@oksbi"
  }
}

export async function generatePaymentSlipHTML(order: Omit<SlipOrder, "upiId"> & { upiId?: string }): Promise<string> {
  const upiId = order.upiId || getUpiId()
  const upiLink = `upi://pay?pa=${upiId}&pn=Auberon%20Pharmaceuticals&am=${order.total}&cu=INR&tn=Order%20${order.orderId}`

  const QRCode = await import("qrcode")
  const qrDataUrl = await QRCode.toDataURL(upiLink, {
    width: 200,
    margin: 2,
    color: { dark: "#1a2744", light: "#ffffff" }
  })

  const itemRows = order.items.map((item, i) => `
    <tr style="background:${i % 2 === 0 ? "#ffffff" : "#f8f7f4"};">
      <td style="padding:8px 12px;font-size:13px;color:#333333;">${item.name}</td>
      <td style="padding:8px 12px;font-size:13px;color:#333333;text-align:center;">${item.qty}</td>
      <td style="padding:8px 12px;font-size:13px;color:#333333;text-align:right;">&#8377;${item.price.toFixed(2)}</td>
    </tr>
  `).join("")

  return `
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;font-family:Arial,sans-serif;border:1px solid #e5e7eb;">

      <!-- Header -->
      <div style="background:#1a2744;padding:20px 24px;text-align:center;">
        <div style="font-family:Georgia,serif;font-size:22px;font-weight:bold;color:#c9933a;">Payment Slip</div>
        <div style="font-size:13px;color:#f8f7f4;margin-top:4px;">Auberon Pharmaceuticals</div>
      </div>

      <!-- Body -->
      <div style="padding:24px;">

        <!-- Order ID -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <span style="font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Order ID</span>
          <span style="font-family:monospace;font-size:14px;font-weight:bold;color:#c9933a;">#${order.orderId}</span>
        </div>

        <!-- Customer -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid #f3f4f6;">
          <span style="font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Billed to</span>
          <span style="font-size:14px;color:#1a2744;font-weight:600;">${order.customerName}</span>
        </div>

        <!-- Items table -->
        <table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
          <thead>
            <tr style="background:#1a2744;">
              <th style="padding:8px 12px;font-size:11px;font-weight:600;color:#ffffff;text-align:left;letter-spacing:0.08em;">ITEM</th>
              <th style="padding:8px 12px;font-size:11px;font-weight:600;color:#ffffff;text-align:center;letter-spacing:0.08em;">QTY</th>
              <th style="padding:8px 12px;font-size:11px;font-weight:600;color:#ffffff;text-align:right;letter-spacing:0.08em;">AMOUNT</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>

        <!-- Total -->
        <div style="background:#1a2744;border-radius:8px;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
          <span style="font-size:14px;font-weight:bold;color:#ffffff;">Total Payable</span>
          <span style="font-family:Georgia,serif;font-size:18px;font-weight:bold;color:#c9933a;">&#8377;${order.total.toFixed(2)}</span>
        </div>

        <!-- Divider -->
        <div style="height:2px;background:linear-gradient(to right,#c9933a,#1a2744);border-radius:2px;margin-bottom:20px;"></div>

        <!-- UPI Section -->
        <div style="text-align:center;">
          <p style="font-size:15px;font-weight:bold;color:#1a2744;margin-bottom:12px;">Pay via UPI</p>

          <!-- UPI ID pill -->
          <div style="display:inline-block;background:#1a2744;border-radius:999px;padding:8px 20px;margin-bottom:16px;">
            <span style="font-family:monospace;font-size:14px;color:#ffffff;letter-spacing:0.05em;">${upiId}</span>
          </div>

          <!-- QR Code -->
          <div style="margin-bottom:8px;">
            <img src="${qrDataUrl}" width="180" height="180" alt="UPI QR Code" style="display:block;margin:0 auto;border-radius:8px;border:2px solid #e5e7eb;" />
          </div>

          <p style="font-size:12px;color:#9ca3af;margin-bottom:0;">Scan with any UPI app — GPay, PhonePe, Paytm</p>
        </div>

        <!-- Footer note -->
        <p style="font-size:12px;color:#9ca3af;font-style:italic;text-align:center;margin-top:20px;padding-top:16px;border-top:1px solid #f3f4f6;">
          Please screenshot this slip for your records.<br/>
          Share payment confirmation on WhatsApp after paying.
        </p>
      </div>
    </div>
  `
}

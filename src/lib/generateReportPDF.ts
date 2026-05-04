import PDFDocument from "pdfkit";
import { ReportData } from "./generateReportData";

// ─── Design tokens ────────────────────────────────────────────────────────────
const NAVY      = "#1a2744";
const GOLD      = "#c9933a";
const MUTED     = "#6b7280";
const RED       = "#dc2626";
const GREEN     = "#16a34a";
const TH_BG     = "#1a2744";
const ROW_ALT   = "#f8f8f8";
const BORDER    = "#dddddd";
const WARN_BG   = "#fdf6e3";
const ERR_BG    = "#fef2f2";
const METRIC_BG = "#eef0f5";
const SEP       = "#eeeeee";
const MARGIN    = 50;

// ─── Fix 1: Truncation helper ─────────────────────────────────────────────────
const truncate = (str: string, maxLen: number) =>
  str.length > maxLen ? str.substring(0, maxLen - 3) + "..." : str;

// ─── Fix 1: Currency helper — no Unicode rupee symbol ────────────────────────
// PDFKit built-in fonts do not support the Rs. Unicode character.
// Use plain ASCII "Rs." prefix everywhere in the PDF.
function rs(amount: number): string {
  const formatted = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount);
  return `Rs. ${formatted}`;
}

// ─── Fix 4: Plain ASCII change indicator — no Unicode arrows ─────────────────
function changeLabel(direction: "up" | "down" | "flat", percent: number): { text: string; color: string } {
  if (direction === "up")   return { text: `(+${percent}% vs prev day)`, color: GREEN };
  if (direction === "down") return { text: `(-${percent}% vs prev day)`, color: RED };
  return { text: "(no change vs prev day)", color: MUTED };
}

// ─── Layout helpers ───────────────────────────────────────────────────────────
function cw(doc: PDFKit.PDFDocument) {
  return doc.page.width - MARGIN * 2;
}

function cy(doc: PDFKit.PDFDocument) { return doc.y; }

function ensureSpace(doc: PDFKit.PDFDocument, needed: number) {
  if (doc.page.height - MARGIN - cy(doc) < needed) doc.addPage();
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtTime(d: Date) {
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function rule(doc: PDFKit.PDFDocument, color: string, thickness: number, gapPt = 0) {
  if (gapPt) doc.moveDown(gapPt / 12);
  doc.moveTo(MARGIN, cy(doc))
    .lineTo(MARGIN + cw(doc), cy(doc))
    .strokeColor(color).lineWidth(thickness).stroke();
  if (gapPt) doc.moveDown(gapPt / 12);
}

// Fix 3: Section heading — always 13pt bold navy, explicit reset
function sectionHeading(doc: PDFKit.PDFDocument, title: string) {
  doc.moveDown(28 / 12);
  ensureSpace(doc, 60);
  doc.fillColor(NAVY).fontSize(13).font("Helvetica-Bold")
    .text(title.toUpperCase(), MARGIN, cy(doc), { width: cw(doc) });
  const underY = cy(doc) + 4;
  doc.moveTo(MARGIN, underY).lineTo(MARGIN + cw(doc), underY)
    .strokeColor(NAVY).lineWidth(0.5).stroke();
  doc.moveDown(16 / 12);
}

function separator(doc: PDFKit.PDFDocument) {
  doc.moveDown(16 / 12);
  rule(doc, SEP, 0.5);
  doc.moveDown(16 / 12);
}

// Fix 2+3: Metric box — explicit font sizes on every text call
function metricBox(
  doc: PDFKit.PDFDocument,
  label: string,
  value: string,
  badge?: { text: string; color: string },
) {
  const pad = 8;
  const h = 36;
  ensureSpace(doc, h + 8);
  const x = MARGIN;
  const w = cw(doc);
  const y = cy(doc);

  doc.rect(x, y, w, h).fill(METRIC_BG);

  // Label — always 9pt gray
  doc.fillColor(MUTED).fontSize(9).font("Helvetica")
    .text(label, x + pad, y + pad + 2, { lineBreak: false });

  // Value — always 16pt bold navy, explicit reset
  const valW = 100;
  const badgeW = badge ? 130 : 0;
  const valX = x + w - pad - valW - badgeW;
  doc.fillColor(NAVY).fontSize(16).font("Helvetica-Bold")
    .text(value, valX, y + pad - 2, { width: valW, align: "right", lineBreak: false });

  // Badge — always 10pt, explicit color
  if (badge) {
    doc.fillColor(badge.color).fontSize(10).font("Helvetica-Bold")
      .text(badge.text, x + w - pad - badgeW + 4, y + pad + 2, { width: badgeW - 4, align: "right", lineBreak: false });
  }

  doc.y = y + h + 6;
}

// Fix 2+3: Table — explicit font sizes on every cell
function table(
  doc: PDFKit.PDFDocument,
  headers: string[],
  rows: string[][],
  colWidths: number[],
  maxRows = 15,
) {
  const rowH = 22;
  const thH  = 26;
  const x    = MARGIN;
  const totalW = colWidths.reduce((a, b) => a + b, 0);

  ensureSpace(doc, thH + rowH * 2 + 8);

  // Header row — always 11pt bold white
  const thY = cy(doc);
  doc.rect(x, thY, totalW, thH).fill(TH_BG);
  let cx = x;
  headers.forEach((h, i) => {
    doc.fillColor("white").fontSize(11).font("Helvetica-Bold")
      .text(h, cx + 6, thY + 8, { width: colWidths[i] - 12, lineBreak: false, ellipsis: true });
    cx += colWidths[i];
  });
  doc.y = thY + thH;

  // Data rows — always 9pt navy
  const displayRows = rows.slice(0, maxRows);
  displayRows.forEach((row, ri) => {
    ensureSpace(doc, rowH + 4);
    const ry = cy(doc);

    if (ri % 2 === 1) doc.rect(x, ry, totalW, rowH).fill(ROW_ALT);

    let bx = x;
    colWidths.forEach((w) => {
      doc.rect(bx, ry, w, rowH).strokeColor(BORDER).lineWidth(0.5).stroke();
      bx += w;
    });

    cx = x;
    row.forEach((cell, ci) => {
      // Fix 2: explicit fontSize(9) on every cell
      doc.fillColor(NAVY).fontSize(9).font("Helvetica")
        .text(cell, cx + 6, ry + 7, { width: colWidths[ci] - 12, lineBreak: false, ellipsis: true });
      cx += colWidths[ci];
    });

    doc.y = ry + rowH;
  });

  if (rows.length > maxRows) {
    doc.moveDown(0.3);
    doc.fillColor(MUTED).fontSize(8).font("Helvetica")
      .text(`... and ${rows.length - maxRows} more row(s) not shown`, MARGIN, cy(doc));
    doc.moveDown(0.3);
  }

  doc.moveDown(0.5);
}

function alertBox(
  doc: PDFKit.PDFDocument,
  lines: string[],
  accentColor: string,
  bgColor: string,
) {
  if (lines.length === 0) return;
  const pad = 10;
  const lineH = 16;
  const h = pad * 2 + lines.length * lineH;
  ensureSpace(doc, h + 8);
  const x = MARGIN;
  const w = cw(doc);
  const y = cy(doc);

  doc.rect(x, y, w, h).fill(bgColor);
  doc.rect(x, y, 3, h).fill(accentColor);

  lines.forEach((line, i) => {
    // Fix 2: explicit fontSize(9) on every alert line
    doc.fillColor(NAVY).fontSize(9).font("Helvetica")
      .text(line, x + pad + 4, y + pad + i * lineH, { width: w - pad * 2 - 4, lineBreak: false });
  });

  doc.y = y + h + 8;
}

// ─── Main export ──────────────────────────────────────────────────────────────
export async function generateReportPDF(data: ReportData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: MARGIN, size: "A4", bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const W = cw(doc);

    // ── Cover ──────────────────────────────────────────────────────────────────
    // Fix 2: explicit fontSize on every cover text call
    doc.fillColor(NAVY).fontSize(36).font("Helvetica-Bold")
      .text("Auberon Pharmaceuticals", MARGIN, MARGIN + 20, { width: W, align: "center" });

    doc.moveDown(0.3);
    doc.fillColor(GOLD).fontSize(11).font("Helvetica-Bold")
      .text("CHANDRA PHARMA", MARGIN, cy(doc), { width: W, align: "center", characterSpacing: 3 });

    doc.moveDown(8 / 12);
    rule(doc, GOLD, 2);

    doc.moveDown(16 / 12);
    doc.fillColor(NAVY).fontSize(20).font("Helvetica-Bold")
      .text("Daily Business Report", MARGIN, cy(doc), { width: W, align: "center" });

    doc.moveDown(6 / 12);
    doc.fillColor(MUTED).fontSize(10).font("Helvetica")
      .text(
        `24-Hour Summary  -  ${fmtDate(data.periodStart)}  to  ${fmtDate(data.periodEnd)}`,
        MARGIN, cy(doc), { width: W, align: "center" },
      );

    doc.moveDown(24 / 12);
    rule(doc, NAVY, 1);
    doc.moveDown(32 / 12);

    // ── Section 1: Revenue & Orders ───────────────────────────────────────────
    sectionHeading(doc, "1 - Revenue & Orders Overview");

    const change = changeLabel(data.revenue.changeDirection, data.revenue.changePercent);

    metricBox(doc, "Revenue - Last 24 Hours (Net, after refunds)", rs(data.revenue.last24h), { text: change.text, color: change.color });
    metricBox(doc, "Gross Revenue - Last 24 Hours (before refunds)", rs(data.revenue.grossRevenue24h));
    if (data.revenue.refundCount24h > 0) {
      metricBox(doc, `Total Refunded - Last 24 Hours (${data.revenue.refundCount24h} order(s))`, rs(data.revenue.totalRefunded24h));
    }
    if (data.revenue.totalDiscountsGiven24h > 0) {
      metricBox(doc, "Total Discounts Given - Last 24 Hours", rs(data.revenue.totalDiscountsGiven24h));
    }
    metricBox(doc, "Pending Payment Revenue (24h)", rs(data.revenue.pendingPayment24h));
    metricBox(doc, "Revenue - All Time (Net)", rs(data.revenue.allTime));
    metricBox(doc, "Previous 24h Revenue (Net)", rs(data.revenue.previous24h));

    doc.moveDown(16 / 12);
    metricBox(doc, "Total Orders - Last 24 Hours", String(data.orders.last24h));

    doc.moveDown(16 / 12);
    // Fix 2+3: explicit font reset before sub-heading
    doc.fillColor(NAVY).fontSize(10).font("Helvetica-Bold")
      .text("Orders by Status", MARGIN, cy(doc));
    doc.moveDown(8 / 12);

    const statusRows = Object.entries(data.orders.byStatus).map(([s, c]) => [
      s.charAt(0).toUpperCase() + s.slice(1), String(c),
    ]);
    table(doc, ["Status", "Count"], statusRows, [Math.floor(W * 0.7), Math.floor(W * 0.3)]);

    // ── Section 2: Order Details ───────────────────────────────────────────────
    separator(doc);
    sectionHeading(doc, "2 - Orders Placed in Last 24 Hours");

    if (data.orders.list.length === 0) {
      doc.fillColor(MUTED).fontSize(9).font("Helvetica")
        .text("No orders placed in the last 24 hours.", MARGIN, cy(doc));
      doc.moveDown(0.5);
    } else {
      // Fix 1: "Q" header fits in 40pt, Product reduced to 120pt, total still 495pt
      const oCols = ["Order ID", "Customer", "Product", "Q", "Amount", "Status", "Time"];
      const oWidths = [80, 80, 120, 40, 60, 60, 55];
      // Fix 1: truncate long fields so cells never overflow
      const oRows = data.orders.list.map((o) => [
        truncate(o.id, 12),
        truncate(o.customerName, 14),
        truncate(o.productName, 28),
        String(o.quantity),
        rs(o.amount),
        o.status,
        fmtTime(o.createdAt),
      ]);
      table(doc, oCols, oRows, oWidths);
    }

    if (data.orders.pendingOld.length > 0) {
      doc.moveDown(0.4);
      const lines = [
        `ACTION REQUIRED: ${data.orders.pendingOld.length} pending order(s) older than 1 hour:`,
        ...data.orders.pendingOld.map(
          (o) => `  - ${truncate(o.customerName, 16)} - ${truncate(o.productName, 24)} x${o.quantity}  |  waiting ${Math.floor(o.elapsedMinutes / 60)}h ${o.elapsedMinutes % 60}m`,
        ),
      ];
      alertBox(doc, lines, GOLD, WARN_BG);
    }

    // ── Section 3: Product Performance (new page) ──────────────────────────────
    doc.addPage();
    sectionHeading(doc, "3 - Product Performance");

    // Fix 2+3: explicit reset before sub-heading
    doc.fillColor(NAVY).fontSize(10).font("Helvetica-Bold")
      .text("Top 5 Products - Last 24 Hours", MARGIN, cy(doc));
    doc.moveDown(8 / 12);

    if (data.products.top5.length === 0) {
      doc.fillColor(MUTED).fontSize(9).font("Helvetica")
        .text("No sales recorded in the last 24 hours.", MARGIN, cy(doc));
      doc.moveDown(0.5);
    } else {
      // Fix 1: rs() for revenue column
      const pRows = data.products.top5.map((p) => [p.name, String(p.unitsSold), rs(p.revenue)]);
      table(doc, ["Product Name", "Units Sold", "Revenue"], pRows,
        [0.6, 0.2, 0.2].map((r) => Math.floor(W * r)));
    }

    separator(doc);
    doc.fillColor(NAVY).fontSize(10).font("Helvetica-Bold")
      .text("Low Stock Alerts", MARGIN, cy(doc));
    doc.moveDown(8 / 12);

    if (data.products.lowStock.length === 0) {
      doc.fillColor(GREEN).fontSize(9).font("Helvetica")
        .text("All products are adequately stocked.", MARGIN, cy(doc));
      doc.moveDown(0.5);
    } else {
      const lRows = data.products.lowStock.map((p) => [
        p.name, String(p.stock), p.critical ? "CRITICAL - below 5" : "Low",
      ]);
      table(doc, ["Product Name", "Stock", "Warning"], lRows,
        [0.55, 0.15, 0.3].map((r) => Math.floor(W * r)));
    }

    if (data.products.zeroStock.length > 0) {
      alertBox(
        doc,
        [`OUT OF STOCK: ${data.products.zeroStock.join(", ")}`],
        RED, ERR_BG,
      );
    }

    // ── Section 4: Customer Activity ──────────────────────────────────────────
    separator(doc);
    sectionHeading(doc, "4 - Customer Activity");

    metricBox(doc, "New Signups - Last 24 Hours", String(data.customers.newSignups24h));
    doc.moveDown(8 / 12);

    if (data.customers.newUsers.length > 0) {
      const uRows = data.customers.newUsers.map((u) => [u.name, u.email]);
      table(doc, ["Name", "Email"], uRows, [0.4, 0.6].map((r) => Math.floor(W * r)));
    }

    separator(doc);
    metricBox(doc, "Contact Form Submissions - Last 24 Hours", String(data.contacts.new24h));
    metricBox(doc, "Total Unread Contacts", String(data.contacts.unread));
    doc.moveDown(8 / 12);

    if (data.contacts.list.length > 0) {
      const cRows = data.contacts.list.map((c) => [c.name, c.subject, c.isRead ? "Read" : "Unread"]);
      table(doc, ["Name", "Subject", "Status"], cRows, [0.3, 0.5, 0.2].map((r) => Math.floor(W * r)));
    }

    // ── Section 5: Operational Notes (new page) ────────────────────────────────
    doc.addPage();
    sectionHeading(doc, "5 - Operational Notes");

    metricBox(doc, "Auto-Expired Orders - Last 24 Hours", String(data.orders.expired24h));
    metricBox(doc, "Stock Units Reverted from Expired Orders", String(data.orders.expiredStockReverted));

    doc.moveDown(16 / 12);

    // Category breakdown
    if (data.categoryBreakdown && Object.keys(data.categoryBreakdown).length > 0) {
      doc.fillColor(NAVY).fontSize(10).font("Helvetica-Bold")
        .text("Category Breakdown", MARGIN, cy(doc));
      doc.moveDown(8 / 12);
      const catRows = Object.entries(data.categoryBreakdown).map(([cat, d]) => [
        cat, String(d.orders), `Rs. ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(d.revenue)}`,
      ]);
      table(doc, ["Category", "Orders", "Revenue"], catRows, [0.5, 0.25, 0.25].map((r) => Math.floor(W * r)));
    }

    doc.moveDown(16 / 12);

    if (data.products.zeroStock.length > 0) {
      alertBox(
        doc,
        [
          `OUT OF STOCK: ${data.products.zeroStock.length} product(s) at zero stock.`,
          `Products: ${data.products.zeroStock.join(", ")}`,
        ],
        RED, ERR_BG,
      );
    } else {
      doc.fillColor(GREEN).fontSize(9).font("Helvetica")
        .text("No products at zero stock.", MARGIN, cy(doc));
      doc.moveDown(0.5);
    }

    doc.moveDown(16 / 12);
    doc.fillColor(MUTED).fontSize(8).font("Helvetica")
      .text(`Report generated: ${fmtDate(data.generatedAt)}`, MARGIN, cy(doc), { width: W, align: "center" });

    // ── Section 6: Executive Summary (new page) ────────────────────────────────
    doc.addPage();
    sectionHeading(doc, "6 - Executive Summary");

    const bullets = data.executiveSummary;
    const lineH = 14;
    const pad = 12;
    const boxH = pad * 2 + bullets.length * lineH;
    ensureSpace(doc, boxH + 16);

    const bx = MARGIN;
    const by = cy(doc);
    doc.rect(bx, by, W, boxH).fill(ROW_ALT);

    bullets.forEach((bullet, i) => {
      doc.fillColor(NAVY).fontSize(9).font("Helvetica")
        .text(`- ${bullet}`, bx + pad, by + pad + i * lineH, { width: W - pad * 2, lineBreak: false });
    });

    doc.y = by + boxH + 8;

    // ── Footer on every page ───────────────────────────────────────────────────
    const totalPages = doc.bufferedPageRange().count;
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      const footerRuleY = doc.page.height - MARGIN - 30;
      const footerTextY = footerRuleY + 6;
      const footerTsY   = footerTextY + 12;

      doc.moveTo(MARGIN, footerRuleY)
        .lineTo(MARGIN + W, footerRuleY)
        .strokeColor(NAVY).lineWidth(0.5).stroke();

      // Fix 2: explicit fontSize(8) on every footer text call
      doc.fillColor(MUTED).fontSize(8).font("Helvetica")
        .text("Auberon Pharmaceuticals - Confidential", MARGIN, footerTextY,
          { width: W * 0.38, lineBreak: false });

      doc.fillColor(MUTED).fontSize(8).font("Helvetica")
        .text("auberon.pharma@gmail.com", MARGIN + W * 0.31, footerTextY,
          { width: W * 0.38, align: "center", lineBreak: false });

      doc.fillColor(MUTED).fontSize(8).font("Helvetica")
        .text(`Page ${i + 1} of ${totalPages}`, MARGIN, footerTextY,
          { width: W, align: "right", lineBreak: false });

      doc.fillColor(MUTED).fontSize(7).font("Helvetica")
        .text(`Generated ${fmtDate(data.generatedAt)}`, MARGIN, footerTsY,
          { width: W, align: "center" });
    }

    doc.end();
  });
}

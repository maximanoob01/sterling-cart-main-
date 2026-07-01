import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatPrice as baseFormatPrice, formatDate } from './formatPrice';

// Safe PDF price formatter to avoid jsPDF unicode font issues with ₹
const formatPrice = (price) => baseFormatPrice(price).replace('₹', 'Rs. ').replace(/\u202F/g, ' ');

/* ============================================================
 *  STERLING KART — Invoice Generator
 *  ----------------------------------------------------------
 *  Single-page, brand-themed invoice for an Indian jewellery
 *  store. All brand & address details live in the COMPANY
 *  constant below — edit there once and every PDF updates.
 * ============================================================ */

/* ─── Palette ─────────────────────────────────────────────── */
const BRAND_RGB  = [212, 82, 122];   // #D4527A
const BRAND_BG   = [255, 245, 248];   // #FFF5F8
const TEXT_DARK  = [40, 40, 40];
const TEXT_MUTED = [100, 100, 100];
const TEXT_LIGHT = [150, 150, 150];
const BORDER     = [225, 225, 225];
const SUCCESS    = [0, 125, 0];
const WHITE      = [255, 255, 255];

/* ─── Page layout (A4, millimetres) ───────────────────────── */
const PAGE_W    = 210;
const PAGE_H    = 297;
const MARGIN    = 12;
const CONTENT_W = PAGE_W - 2 * MARGIN;

/* ─── Tax / HSN defaults (override per-item if needed) ───── */
const DEFAULT_HSN      = '7113';   // jewellery HSN
const DEFAULT_TAX_RATE = 0.03;     // 3% GST

/* ─── Company profile (single source of truth) ────────────── */
const COMPANY = {
  name:     'STERLING KART',
  tagline:  '925 silver jwells',
  building: 'SHOP NO 365',
  street:   'SAKET COLONY',
  landmark: 'Nr. Bhagwati Sanitary Store',
  locality: 'NEAR SAKET COLONY',
  city:     'Roorkee',
  district: 'Haridwar',
  state:    'Uttarakhand',
  pincode:  '247667',
  gstin:    '05FODPS0894L1ZD',
  email:    'support@sterlingkart.in',
  phone:    '+91-XXXX-XXXX-XX',
  website:  'sterlingkart.in',
};

/* ============================================================
 *  Public API
 * ============================================================ */

/**
 * Generate a single-page branded invoice for the given order.
 *
 * @param {object} order            Must have `id`, `date`, `items[]`
 * @param {object} [user]           Optional — used for Bill To details
 * @param {object} [options]
 * @param {'save'|'open'|'datauri'|'blob'} [options.mode='save']
 *        - 'save'    → triggers a browser download
 *        - 'open'    → opens the PDF in a new tab
 *        - 'datauri' → returns a base64 data URI string
 *        - 'blob'    → returns a Blob (useful for upload / preview)
 *
 * @example
 *   import { generateInvoice } from './utils/generateInvoice';
 *   <button onClick={() => generateInvoice(order, user)}>Download</button>
 */
export const generateInvoice = (order, user, options = {}) => {
  const { mode = 'save' } = options;

  const doc    = new jsPDF({ unit: 'mm', format: 'a4' });
  const totals = computeTotals(order);

  drawWatermark(doc);
  drawHeader(doc, order);
  const customerEndY = drawCustomerBlock(doc, order, user);
  drawItemsTable(doc, order, customerEndY);
  drawTotalsBox(doc, totals);
  drawPaymentBlock(doc, order);
  drawFooter(doc);

  const filename = `SterlingKart_Invoice_${order.id || 'draft'}.pdf`;

  switch (mode) {
    case 'open':
      window.open(doc.output('bloburl'), '_blank');
      return doc;
    case 'datauri':
      return doc.output('datauristring');
    case 'blob':
      return doc.output('blob');
    case 'save':
    default:
      doc.save(filename);
      return doc;
  }
};

/* ============================================================
 *  Helpers
 * ============================================================ */

/** Compute subtotal / discount / tax / shipping / total defensively. */
function computeTotals(order) {
  const items = order.items || [];

  const subtotal = items.reduce(
    (sum, item) => sum + (item.price || 0) * (item.qty || item.quantity || 1),
    0
  );
  const discount = order.discount || order.discountAmount || 0;
  const shipping = order.shipping || order.deliveryFee      || 0;
  const taxRate  = order.taxRate  ?? DEFAULT_TAX_RATE;
  const taxable  = Math.max(subtotal - discount, 0);
  const tax      = order.tax ?? Math.round(taxable * taxRate);
  const total    = order.total ?? (taxable + tax + shipping);

  return { subtotal, discount, shipping, tax, taxRate, total };
}

/** Safe coercion for jsPDF — null/undefined become empty string. */
const safe = (v) => (v == null ? '' : String(v));

/* ============================================================
 *  Section: Watermark
 * ============================================================ */
function drawWatermark(doc) {
  // Use a very light tint of the brand color (approx 8% opacity on white)
  // to avoid needing complex Graphic States for transparency
  doc.setTextColor(251, 238, 242);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(80);
  
  // Draw diagonally in the center of the A4 page
  doc.text(COMPANY.name, PAGE_W / 2, PAGE_H / 2 + 20, {
    align: 'center',
    angle: 45
  });
}

/* ============================================================
 *  Section: Header
 * ============================================================ */
function drawHeader(doc, order) {
  // 1) Top pink accent bar
  doc.setFillColor(...BRAND_RGB);
  doc.rect(0, 0, PAGE_W, 3, 'F');

  // 2) Brand name + tagline
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(...BRAND_RGB);
  doc.text(COMPANY.name, MARGIN, 17);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(COMPANY.tagline, MARGIN, 22);

  // 3) Address block (3 lines, then GSTIN)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...TEXT_DARK);

  const addressLines = [
    `${COMPANY.building}, ${COMPANY.street},`,
    `${COMPANY.landmark}, ${COMPANY.locality},`,
    `${COMPANY.city}, ${COMPANY.district}, ${COMPANY.state} – ${COMPANY.pincode}`,
  ];

  let y = 28;
  addressLines.forEach((line) => {
    doc.text(line, MARGIN, y);
    y += 4;
  });

  doc.setFont('helvetica', 'bold');
  doc.text('GSTIN:', MARGIN, y);
  doc.setFont('helvetica', 'normal');
  doc.text(COMPANY.gstin, MARGIN + 14, y);

  // 4) Right side: TAX INVOICE label
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...TEXT_DARK);
  doc.text('TAX INVOICE', PAGE_W - MARGIN, 17, { align: 'right' });

  // 5) Right side: invoice meta
  const labelX = PAGE_W - MARGIN - 55;
  const valueX = PAGE_W - MARGIN;
  let metaY = 25;

  const meta = [
    ['Invoice #', `INV-${order.id || 'N/A'}`],
    ['Date',      formatDate(order.date)],
    ['Order #',   `#${order.id || 'N/A'}`],
    ['Status',    order.status || 'Processing'],
  ];

  if (order.trackingNumber) {
    meta.push(['Tracking', order.trackingNumber]);
  }
  if (order.courierName) {
    meta.push(['Courier', order.courierName]);
  }

  meta.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(label, labelX, metaY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...TEXT_DARK);
    doc.text(value, valueX, metaY, { align: 'right' });

    metaY += 5;
  });

  // 6) Brand divider
  doc.setDrawColor(...BRAND_RGB);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, 53, PAGE_W - MARGIN, 53);
}

/* ============================================================
 *  Section: Customer (Bill To / Ship To)
 *  Returns the Y position where the next section should start.
 * ============================================================ */
function drawCustomerBlock(doc, order, user) {
  const y0    = 60;
  const colW  = (CONTENT_W - 6) / 2;
  const shipX = MARGIN + colW + 6;

  // Section labels
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...BRAND_RGB);
  doc.text('BILL TO', MARGIN, y0);
  doc.text('SHIP TO',  shipX,   y0);

  /* ── Bill To ── */
  const billingName  = safe(user?.name)  || safe(order.customerName)  || safe(order.shippingAddress?.name) || 'Customer';
  const billingPhone = safe(user?.phone) || safe(order.customerPhone) || safe(order.shippingAddress?.phone);
  const billingEmail = safe(user?.email) || safe(order.customerEmail) || safe(order.shippingAddress?.email);

  let billY = y0 + 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...TEXT_DARK);
  doc.text(billingName, MARGIN, billY);
  billY += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...TEXT_MUTED);
  if (billingPhone) { doc.text(`Phone: ${billingPhone}`, MARGIN, billY); billY += 3.5; }
  if (billingEmail) { doc.text(`Email: ${billingEmail}`, MARGIN, billY); billY += 3.5; }

  /* ── Ship To ── */
  const ship      = order.shippingAddress || {};
  const shipName  = safe(ship.name)  || billingName;
  const shipPhone = safe(ship.phone) || billingPhone;

  let shipY = y0 + 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...TEXT_DARK);
  doc.text(shipName, shipX, shipY);
  shipY += 4.5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...TEXT_MUTED);
  if (ship.line1) { doc.text(ship.line1, shipX, shipY); shipY += 3.5; }
  if (ship.line2) { doc.text(ship.line2, shipX, shipY); shipY += 3.5; }
  if (ship.city || ship.state || ship.pincode) {
    const cityLine = [ship.city, ship.state, ship.pincode].filter(Boolean).join(', ');
    doc.text(cityLine, shipX, shipY);
    shipY += 3.5;
  }
  if (shipPhone) { doc.text(`Phone: ${shipPhone}`, shipX, shipY); shipY += 3.5; }

  // Divider
  const dividerY = Math.max(billY, shipY) + 4;
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, dividerY, PAGE_W - MARGIN, dividerY);

  return dividerY + 4;
}

/* ============================================================
 *  Section: Items table
 * ============================================================ */
function drawItemsTable(doc, order, startY) {
  const items = order.items || [];

  const head = [['#', 'Item Description', 'HSN', 'Qty', 'Unit Price', 'Total']];

  const body = items.length
    ? items.map((item, idx) => {
        const name  = safe(item.name) || `Product #${safe(item.productId)}`;
        const size  = item.size ? `\nSize: ${item.size}` : '';
        const price = item.price || 0;
        const qty   = item.qty || item.quantity || 1;

        return [
          String(idx + 1),
          name + size,
          safe(item.hsn) || DEFAULT_HSN,
          String(qty),
          formatPrice(price),
          formatPrice(price * qty),
        ];
      })
    : [['—', 'No items in this order', '—', '—', '—', '—']];

  autoTable(doc, {
    startY,
    head,
    body,
    theme: 'grid',
    headStyles: {
      fillColor: BRAND_RGB,
      textColor: WHITE,
      halign: 'left',
      fontSize: 9,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: { top: 3, right: 3, bottom: 3, left: 3 },
      textColor: TEXT_DARK,
      lineColor: BORDER,
      lineWidth: 0.1,
    },
    alternateRowStyles: {
      fillColor: BRAND_BG,   // zebra-stripe with brand-tinted rows
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8  },
      1: { halign: 'left',   cellWidth: 'auto' },
      2: { halign: 'center', cellWidth: 16 },
      3: { halign: 'center', cellWidth: 12 },
      4: { halign: 'right',  cellWidth: 28 },
      5: { halign: 'right',  cellWidth: 30 },
    },
    margin: { left: MARGIN, right: MARGIN },
  });
}

/* ============================================================
 *  Section: Totals box (right-aligned summary, soft pink bg)
 * ============================================================ */
function drawTotalsBox(doc, totals) {
  const finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) || 100;
  const boxX   = PAGE_W - MARGIN - 78;
  const boxW   = 78;
  const boxY   = finalY + 6;
  const rowH   = 6;

  // Height grows with the number of line items
  let rowCount = 2; // subtotal + total
  if (totals.discount > 0) rowCount++;
  if (totals.tax > 0) rowCount++;
  if (totals.shipping > 0) rowCount++;
  const boxH = rowH * rowCount + 10;

  // Soft pink background with hairline border
  doc.setFillColor(...BRAND_BG);
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.2);
  doc.roundedRect(boxX, boxY, boxW, boxH, 2, 2, 'FD');

  const labelX = boxX + 5;
  const valueX = boxX + boxW - 5;
  let rowY = boxY + 5;

  const drawRow = (label, value, opts = {}) => {
    doc.setFont('helvetica', opts.bold ? 'bold' : 'normal');
    doc.setFontSize(opts.size || 9);
    doc.setTextColor(...(opts.color || TEXT_DARK));
    doc.text(label, labelX, rowY);
    doc.text(value, valueX, rowY, { align: 'right' });
    rowY += rowH;
  };

  drawRow('Subtotal', formatPrice(totals.subtotal));
  if (totals.discount > 0) {
    drawRow('Discount', `- ${formatPrice(totals.discount)}`, { color: SUCCESS });
  }
  if (totals.tax > 0) {
    drawRow(`Tax (GST ${(totals.taxRate * 100).toFixed(0)}%)`, formatPrice(totals.tax));
  }
  if (totals.shipping > 0) {
    drawRow('Shipping', formatPrice(totals.shipping));
  }

  // Divider before grand total
  doc.setDrawColor(...BRAND_RGB);
  doc.setLineWidth(0.3);
  doc.line(labelX, rowY - 1, valueX, rowY - 1);

  rowY += 3; // Add extra space before TOTAL

  // Grand total — the headline number
  drawRow('TOTAL', formatPrice(totals.total), {
    bold: true,
    size: 12,
    color: BRAND_RGB,
  });
}

/* ============================================================
 *  Section: Payment information
 * ============================================================ */
function drawPaymentBlock(doc, order) {
  const tableY = (doc.lastAutoTable && doc.lastAutoTable.finalY) || 100;
  const y0     = tableY + 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...BRAND_RGB);
  doc.text('PAYMENT INFORMATION', MARGIN, y0);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...TEXT_DARK);

  const lines = [
    `Method: ${order.paymentMethod || 'Online Payment'}`,
    `Txn ID: ${order.transactionId || order.paymentId || 'N/A'}`,
    `Status: ${order.paymentStatus || 'Paid'}`,
  ];

  let y = y0 + 5;
  lines.forEach((line) => {
    doc.text(line, MARGIN, y);
    y += 4.5;
  });
}

/* ============================================================
 *  Section: Footer
 * ============================================================ */
function drawFooter(doc) {
  const footerY = PAGE_H - 18;

  // Pink divider
  doc.setDrawColor(...BRAND_RGB);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, footerY - 5, PAGE_W - MARGIN, footerY - 5);

  // E. & O.E. — small, top-right (traditional Indian invoice marker)
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(...TEXT_LIGHT);
  doc.text('E. & O.E.', PAGE_W - MARGIN, footerY - 7, { align: 'right' });

  // Thank-you message
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...BRAND_RGB);
  doc.text('Thank you for shopping with Sterling Kart!', PAGE_W / 2, footerY, { align: 'center' });

  // Contact line
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_MUTED);
  const contact = `${COMPANY.email}  |  ${COMPANY.phone}  |  ${COMPANY.website}`;
  doc.text(contact, PAGE_W / 2, footerY + 4.5, { align: 'center' });

  // Legal disclaimer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(...TEXT_LIGHT);
  doc.text('This is a computer-generated invoice and does not require a signature.', PAGE_W / 2, footerY + 9, { align: 'center' });
}

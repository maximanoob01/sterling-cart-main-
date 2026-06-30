import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatPrice, formatDate } from './formatPrice';
export const generateInvoice = (order, user) => {
  const doc = new jsPDF();

  // Add Company Details
  doc.setFontSize(22);
  doc.setTextColor(212, 82, 122); // #D4527A (brand color)
  doc.text('STERLING KART', 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('123 Jewellery Lane, Diamond District', 14, 28);
  doc.text('Mumbai, Maharashtra 400001, India', 14, 34);
  doc.text('GSTIN: 27AABCU9603R1ZX', 14, 40);

  // Add Invoice Details
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text('TAX INVOICE', 140, 20);

  doc.setFontSize(10);
  doc.text(`Order ID: #${order.id}`, 140, 28);
  doc.text(`Date: ${formatDate(order.date)}`, 140, 34);
  doc.text(`Status: ${order.status}`, 140, 40);

  // Add Customer Details
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text('Bill To:', 14, 55);
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  
  // Use order address if exists, otherwise fallback to user details
  const userName = user?.name || 'Customer';
  const userPhone = user?.phone || '';
  
  doc.text(userName, 14, 62);
  if (userPhone) doc.text(`Phone: ${userPhone}`, 14, 68);

  // Table Data
  const tableColumn = ["Item", "Unit Price", "Qty", "Total"];
  const tableRows = [];

  order.items.forEach(item => {
    const itemName = item.name || `Product #${item.productId}`;
    const price = item.price || (order.total / item.qty);
    
    const rowData = [
      itemName,
      formatPrice(price),
      item.qty.toString(),
      formatPrice(price * item.qty)
    ];
    tableRows.push(rowData);
  });

  // Render Table
  autoTable(doc, {
    startY: 80,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [212, 82, 122],
      textColor: 255,
      halign: 'left'
    },
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
    columnStyles: {
      0: { halign: 'left' },
      1: { halign: 'right' },
      2: { halign: 'center' },
      3: { halign: 'right' }
    }
  });

  // Calculate position after table
  const finalY = doc.lastAutoTable.finalY || 80;

  // Totals
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  
  const subtotal = order.total; // Assuming total includes everything for simplicity
  
  doc.text('Subtotal:', 140, finalY + 10);
  doc.text(formatPrice(subtotal), 180, finalY + 10, { align: 'right' });
  
  doc.setFont('helvetica', 'bold');
  doc.text('Total Amount:', 140, finalY + 18);
  doc.text(formatPrice(subtotal), 180, finalY + 18, { align: 'right' });

  // Footer
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
  doc.text('Thank you for shopping with Sterling Kart!', 14, doc.internal.pageSize.height - 20);
  doc.text('This is a computer-generated invoice and does not require a signature.', 14, doc.internal.pageSize.height - 14);

  // Save the PDF
  doc.save(`SterlingKart_Invoice_${order.id}.pdf`);
};

import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
};

const generateOrderEmailHTML = (orderId, form, items, totalAmount) => {
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #EEE8E5; color: #1A1A1A;">
        ${item.name} x ${item.qty}
        ${item.engravingText ? `<br><small style="color:#D4527A;font-weight:600;">Engraving: "${item.engravingText}"</small>` : ''}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #EEE8E5; color: #1A1A1A; text-align: right;">
        ₹${(item.price * item.qty).toLocaleString('en-IN')}
      </td>
    </tr>
  `).join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8">
  <style>
    body { font-family: 'Inter', Arial, sans-serif; background-color: #F7E1E8; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
    .header { background-color: #1A1A1A; color: #ffffff; text-align: center; padding: 30px 20px; }
    .header h1 { margin: 0; font-family: Georgia, serif; font-size: 24px; letter-spacing: 2px; text-transform: uppercase; color: #D4527A; }
    .content { padding: 30px; }
    .order-id { font-size: 14px; color: #D4527A; font-weight: bold; letter-spacing: 1px; }
    .order-title { font-size: 20px; color: #1A1A1A; font-family: Georgia, serif; margin-bottom: 20px; }
    .details-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    .total-row { font-weight: bold; font-size: 16px; color: #D4527A; }
    .footer { background-color: #F7F5F4; text-align: center; padding: 20px; font-size: 12px; color: #A8A8A8; }
  </style></head><body>
  <div class="container">
    <div class="header">
      <h1>Sterling Kart</h1>
      <p style="margin-top: 10px; color: #ffffff; opacity: 0.8;">Thank you for your order!</p>
    </div>
    <div class="content">
      <p class="order-id">ORDER #${orderId}</p>
      <p class="order-title">Hi ${form.fullName || 'Customer'},</p>
      <p style="color: #666; line-height: 1.6;">We've received your order and are getting it ready for you. Here are your order details:</p>
      <table class="details-table">
        <thead><tr>
          <th style="text-align: left; padding: 10px; border-bottom: 2px solid #EEE8E5; color: #A8A8A8; font-size: 12px; text-transform: uppercase;">Item</th>
          <th style="text-align: right; padding: 10px; border-bottom: 2px solid #EEE8E5; color: #A8A8A8; font-size: 12px; text-transform: uppercase;">Total</th>
        </tr></thead>
        <tbody>
          ${itemsHtml}
          <tr>
            <td style="padding: 15px 10px; text-align: right;" class="total-row">Grand Total:</td>
            <td style="padding: 15px 10px; text-align: right;" class="total-row">₹${totalAmount.toLocaleString('en-IN')}</td>
          </tr>
        </tbody>
      </table>
      <div style="margin-top: 30px; padding: 20px; background-color: #F7F5F4; border-radius: 12px;">
        <h3 style="margin-top: 0; color: #1A1A1A; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Delivery Address</h3>
        <p style="color: #666; line-height: 1.5; margin-bottom: 0;">
          ${form.addressLine1}<br>
          ${form.addressLine2 ? form.addressLine2 + '<br>' : ''}
          ${form.city}, ${form.state} - ${form.pincode}<br>
          Phone: ${form.phone}
        </p>
      </div>
    </div>
    <div class="footer">
      <p>925 Silver Jewels | Hallmarked and Certified</p>
      <p>If you have any questions, reply to this email or contact our support.</p>
    </div>
  </div></body></html>`;
};

export const sendOrderConfirmation = async (orderId, form, items, totalAmount) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️  SMTP credentials not set — email skipped');
    return { success: true, skipped: true };
  }

  try {
    const transport = getTransporter();
    const html = generateOrderEmailHTML(orderId, form, items, totalAmount);

    await transport.sendMail({
      from: `"Sterling Kart" <${process.env.SMTP_USER}>`,
      to: form.email,
      subject: `Order Confirmation — ${orderId}`,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error('Email send error:', error.message);
    return { success: false, error: error.message };
  }
};

export const sendContactNotification = async (contactData) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return;

  try {
    const transport = getTransporter();
    await transport.sendMail({
      from: `"Sterling Kart" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: `New Contact Message from ${contactData.name}`,
      html: `<h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${contactData.name}</p>
        <p><strong>Email:</strong> ${contactData.email}</p>
        <p><strong>Phone:</strong> ${contactData.phone || 'N/A'}</p>
        <p><strong>Order ID:</strong> ${contactData.orderId || 'N/A'}</p>
        <p><strong>Message:</strong></p>
        <p>${contactData.message}</p>`,
    });
  } catch (error) {
    console.error('Contact notification email error:', error.message);
  }
};

export const sendGiftCardEmail = async (email, name, amount, code, expiryDate) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️  SMTP credentials not set — GC email skipped');
    return { success: true, skipped: true };
  }

  try {
    const transport = getTransporter();
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
    <style>
      body { font-family: 'Inter', Arial, sans-serif; background-color: #1C1C2E; color: #fff; padding: 20px; }
      .container { max-width: 600px; margin: 0 auto; background-color: #24162A; border: 1px solid rgba(212,82,122,0.2); border-radius: 20px; overflow: hidden; }
      .header { padding: 30px 20px; text-align: center; }
      .header h1 { margin: 0; color: #D4527A; letter-spacing: 2px; }
      .content { padding: 30px; text-align: center; }
      .code-box { background: rgba(212,82,122,0.1); border: 1px solid rgba(212,82,122,0.3); padding: 15px; font-size: 24px; font-weight: bold; letter-spacing: 2px; border-radius: 12px; margin: 20px 0; color: #F4A0B0; }
    </style></head><body>
    <div class="container">
      <div class="header">
        <h1>STERLING KART</h1>
        <p>A gift for you!</p>
      </div>
      <div class="content">
        <h2>Gift Card worth ₹${amount.toLocaleString('en-IN')}</h2>
        <p>Hi ${name || 'Customer'},</p>
        <p>Here is your Sterling Kart digital gift card. Use this code at checkout.</p>
        <div class="code-box">${code}</div>
        <p style="color: #aaa; font-size: 12px;">Valid until: ${new Date(expiryDate).toLocaleDateString()}</p>
      </div>
    </div></body></html>`;

    await transport.sendMail({
      from: `"Sterling Kart" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Your Sterling Kart Gift Card — ₹${amount}`,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('GC email error:', error.message);
    return { success: false, error: error.message };
  }
};

export const sendOTPEmail = async (email, otp) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[EMAIL MOCK] OTP to ${email}: ${otp}`);
    return { success: true };
  }
  try {
    const transport = getTransporter();
    await transport.sendMail({
      from: `"Sterling Kart" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Your Sterling Kart Security Code`,
      html: `<p>Your verification code is: <strong>${otp}</strong>. Do not share this code.</p>`,
    });
    return { success: true };
  } catch (err) {
    console.error('OTP email error:', err.message);
    return { success: false };
  }
};

export const sendInvoiceEmail = async (order, items, pdfBase64) => {
  const { customerEmail: email, customerName: name, orderId, customerPhone: phone } = order;

  if (!email || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    // If no email exists (guest user without email) or no SMTP config, send via WhatsApp mock
    const contact = phone || email || 'Customer';
    console.log(`\n[WHATSAPP MOCK] To ${contact}: Hi ${name || 'Customer'}, your order ${orderId} has been delivered! Your invoice is attached. Thank you for shopping with Sterling Kart.\n`);
    return { success: true, via: 'whatsapp' };
  }

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #EEE8E5; color: #1A1A1A;">
        ${item.name} x ${item.qty}
        ${item.engravingText ? `<br><small style="color:#D4527A;font-weight:600;">Engraving: "${item.engravingText}"</small>` : ''}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #EEE8E5; color: #1A1A1A; text-align: right;">
        ₹${(item.price * item.qty).toLocaleString('en-IN')}
      </td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
  <style>
    body { font-family: 'Inter', Arial, sans-serif; background-color: #F7E1E8; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
    .header { background-color: #1A1A1A; color: #ffffff; text-align: center; padding: 30px 20px; }
    .header h1 { margin: 0; font-family: Georgia, serif; font-size: 24px; letter-spacing: 2px; text-transform: uppercase; color: #D4527A; }
    .content { padding: 30px; }
    .order-id { font-size: 14px; color: #D4527A; font-weight: bold; letter-spacing: 1px; }
    .order-title { font-size: 20px; color: #1A1A1A; font-family: Georgia, serif; margin-bottom: 20px; }
    .details-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    .total-row { font-weight: bold; font-size: 16px; color: #D4527A; }
    .footer { background-color: #F7F5F4; text-align: center; padding: 20px; font-size: 12px; color: #A8A8A8; }
  </style></head><body>
  <div class="container">
    <div class="header">
      <h1>Sterling Kart</h1>
      <p style="margin-top: 10px; color: #ffffff; opacity: 0.8;">Your Order is Delivered!</p>
    </div>
    <div class="content">
      <p class="order-id">ORDER #${orderId}</p>
      <p class="order-title">Hi ${name || 'Customer'},</p>
      <p style="color: #666; line-height: 1.6;">Great news! Your order has been successfully delivered. We hope you love your new jewellery. Please find your official invoice attached to this email for your records.</p>
      <table class="details-table">
        <thead><tr>
          <th style="text-align: left; padding: 10px; border-bottom: 2px solid #EEE8E5; color: #A8A8A8; font-size: 12px; text-transform: uppercase;">Item</th>
          <th style="text-align: right; padding: 10px; border-bottom: 2px solid #EEE8E5; color: #A8A8A8; font-size: 12px; text-transform: uppercase;">Total</th>
        </tr></thead>
        <tbody>
          ${itemsHtml}
          <tr>
            <td style="padding: 15px 10px; text-align: right;" class="total-row">Grand Total:</td>
            <td style="padding: 15px 10px; text-align: right;" class="total-row">₹${(order.totalAmount || 0).toLocaleString('en-IN')}</td>
          </tr>
        </tbody>
      </table>
      <div style="margin-top: 30px; padding: 20px; background-color: #F7F5F4; border-radius: 12px;">
        <h3 style="margin-top: 0; color: #1A1A1A; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Delivered To</h3>
        <p style="color: #666; line-height: 1.5; margin-bottom: 0;">
          ${order.shippingAddress?.addressLine1 || ''}<br>
          ${order.shippingAddress?.addressLine2 ? order.shippingAddress.addressLine2 + '<br>' : ''}
          ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.pincode || ''}<br>
          Phone: ${phone || ''}
        </p>
      </div>
    </div>
    <div class="footer">
      <p>925 Silver Jewels | Hallmarked and Certified</p>
      <p>If you have any questions, reply to this email or contact our support.</p>
    </div>
  </div></body></html>`;

  try {
    const transport = getTransporter();
    await transport.sendMail({
      from: `"Sterling Kart" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Your Invoice for Order ${orderId}`,
      html,
      attachments: [
        {
          filename: `SterlingKart_Invoice_${orderId}.pdf`,
          content: Buffer.from(pdfBase64.split(',')[1] || pdfBase64, 'base64'),
          contentType: 'application/pdf'
        }
      ]
    });
    return { success: true, via: 'email' };
  } catch (err) {
    console.error('Invoice email error:', err.message);
    return { success: false, error: err.message };
  }
};

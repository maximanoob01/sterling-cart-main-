import { Resend } from 'resend';

// Validate environment variables on startup
const validateEnv = () => {
  const missing = [];
  if (!process.env.RESEND_API_KEY) missing.push('RESEND_API_KEY');
  if (!process.env.EMAIL_FROM) missing.push('EMAIL_FROM');
  if (!process.env.ADMIN_EMAIL) missing.push('ADMIN_EMAIL');

  if (missing.length > 0) {
    throw new Error(`Missing required email environment variables: ${missing.join(', ')}`);
  }
};

validateEnv();

// Single initialized Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Helper to send email via Resend with retries and structured logging
 */
const sendWithResend = async (type, payload, retries = 1) => {
  // TEMPORARY DEVELOPMENT OVERRIDE
  // Remove before production
  if (process.env.NODE_ENV !== "production") {
    payload.to = process.env.ADMIN_EMAIL || "awayontech@gmail.com";
  }

  let attempt = 0;
  while (attempt <= retries) {
    try {
      const { data, error } = await resend.emails.send(payload);

      if (error) {
        throw new Error(error.message);
      }

      console.log(`\n[EMAIL]
Type: ${type}
Recipient: ${payload.to}
Subject: ${payload.subject}
Status: SUCCESS
Resend ID: ${data.id}\n`);

      return { success: true, resendId: data.id };
    } catch (err) {
      attempt++;
      if (attempt > retries) {
        console.error(`\n[EMAIL]
Type: ${type}
Recipient: ${payload.to}
Subject: ${payload.subject}
Status: FAILED
Reason: ${err.message}\n`);
        return { success: false, error: err.message };
      }
      console.warn(`[EMAIL] Temporary failure for ${type}, retrying attempt ${attempt}...`);
    }
  }
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
  const html = generateOrderEmailHTML(orderId, form, items, totalAmount);
  return await sendWithResend('Order Confirmation', {
    from: process.env.EMAIL_FROM,
    to: form.email,
    subject: `Order Confirmation — ${orderId}`,
    html,
  });
};

export const sendContactNotification = async (contactData) => {
  const html = `<h3>New Contact Form Submission</h3>
    <p><strong>Name:</strong> ${contactData.name}</p>
    <p><strong>Email:</strong> ${contactData.email}</p>
    <p><strong>Phone:</strong> ${contactData.phone || 'N/A'}</p>
    <p><strong>Order ID:</strong> ${contactData.orderId || 'N/A'}</p>
    <p><strong>Message:</strong></p>
    <p>${contactData.message}</p>`;

  await sendWithResend('Contact Notification', {
    from: process.env.EMAIL_FROM,
    to: process.env.ADMIN_EMAIL,
    reply_to: contactData.email,
    subject: `New Contact Message from ${contactData.name}`,
    html,
  });
};

export const sendGiftCardEmail = async (email, name, amount, code, expiryDate) => {
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

  return await sendWithResend('Gift Card Email', {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Your Sterling Kart Gift Card — ₹${amount}`,
    html,
  });
};

export const sendWelcomeEmail = async (email, name) => {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
  <style>
    body { font-family: 'Inter', Arial, sans-serif; background-color: #F7E1E8; padding: 20px; text-align: center; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); padding: 40px; }
    h1 { color: #D4527A; font-family: Georgia, serif; letter-spacing: 2px; text-transform: uppercase; }
    p { color: #666; line-height: 1.6; font-size: 16px; }
  </style></head><body>
  <div class="container">
    <h1>Welcome to Sterling Kart!</h1>
    <p>Hi ${name || 'there'},</p>
    <p>Your account has been successfully created. We are thrilled to have you join our community.</p>
    <p>Explore our premium 925 Silver Jewellery collection and enjoy your exclusive welcome bonus of 50 Loyalty Points!</p>
    <p style="margin-top: 30px; font-size: 12px; color: #A8A8A8;">925 Silver Jewels | Hallmarked and Certified</p>
  </div></body></html>`;

  return await sendWithResend('Welcome Email', {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Welcome to Sterling Kart! 🎉`,
    html,
  });
};

export const sendInvoiceEmail = async (order, items, pdfBase64) => {
  const { customerEmail: email, customerName: name, orderId, customerPhone: phone } = order;

  if (!email) {
    // If no email exists (guest user without email), send via WhatsApp mock
    const contact = phone || 'Customer';
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

  return await sendWithResend('Invoice Email', {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Your Invoice for Order ${orderId}`,
    html,
    attachments: [
      {
        filename: `SterlingKart_Invoice_${orderId}.pdf`,
        content: Buffer.from(pdfBase64.split(',')[1] || pdfBase64, 'base64')
      }
    ]
  });
};

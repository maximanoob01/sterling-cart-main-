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
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600&family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #0F0F0F; color: #ffffff; padding: 20px 0; margin: 0; -webkit-font-smoothing: antialiased; }
    .container { max-width: 600px; margin: 0 auto; background-color: #0F0F0F; }
    a { text-decoration: none; }
    
    /* Header */
    .header { text-align: center; padding: 40px 20px 30px; }
    .logo { font-family: 'Playfair Display', serif; font-size: 28px; letter-spacing: 3px; color: #ffffff; margin: 0; text-transform: uppercase; font-weight: 600; }
    .subtitle { font-size: 11px; letter-spacing: 2px; color: #E85D9E; text-transform: uppercase; margin-top: 8px; font-weight: 600; }
    
    /* Greeting */
    .greeting { padding: 30px 40px; text-align: center; }
    .greeting p { font-size: 15px; color: #D0D0D0; line-height: 1.8; margin-bottom: 15px; font-weight: 300; }
    
    /* Gift Card */
    .gift-card { background: linear-gradient(135deg, #1A1A1A 0%, #0A0A0A 100%); border: 1px solid #E85D9E; border-radius: 16px; padding: 40px 30px; text-align: center; margin: 20px; box-shadow: 0 10px 30px rgba(232, 93, 158, 0.05); }
    .gift-title { font-family: 'Playfair Display', serif; color: #E85D9E; font-size: 18px; margin: 0 0 15px 0; font-style: italic; }
    .gift-amount { font-family: 'Playfair Display', serif; font-size: 32px; color: #ffffff; margin: 0 0 15px 0; letter-spacing: 1px; }
    .gift-desc { font-size: 13px; color: #A0A0A0; line-height: 1.6; margin: 0; }
    
    /* Features */
    .features { padding: 30px 20px 40px; text-align: center; }
    .feature-item { margin-bottom: 12px; font-size: 13px; color: #D0D0D0; letter-spacing: 1px; text-transform: uppercase; font-weight: 400; }
    .feature-item span { color: #E85D9E; margin-right: 8px; font-size: 14px; }
    
    /* CTA */
    .cta-section { text-align: center; padding: 10px 30px 60px; }
    .cta-heading { font-family: 'Playfair Display', serif; font-size: 24px; color: #ffffff; margin: 0 0 12px 0; font-weight: 400; }
    .cta-desc { font-size: 14px; color: #A0A0A0; margin: 0 0 30px 0; }
    .cta-button { display: inline-block; background-color: #E85D9E; color: #ffffff; padding: 16px 36px; border-radius: 30px; font-size: 14px; font-weight: 600; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(232, 93, 158, 0.2); transition: all 0.3s ease; }
    .cta-button:hover { background-color: #d14988; box-shadow: 0 6px 20px rgba(232, 93, 158, 0.3); }
    
    /* Footer */
    .footer { border-top: 1px solid #222; padding: 40px 30px; text-align: center; }
    .footer p { font-size: 12px; color: #888; line-height: 1.6; margin: 0 0 8px 0; }
    .footer-socials { margin: 30px 0; }
    .footer-socials a { color: #E85D9E; margin: 0 12px; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; font-weight: 600; }
    .footer-bottom { font-size: 11px; color: #555; text-transform: uppercase; letter-spacing: 1px; line-height: 1.8; }
    
    /* Mobile Responsive */
    @media only screen and (max-width: 480px) {
      .hero-col { display: block !important; width: 100% !important; text-align: center !important; padding: 30px 20px !important; }
      .hero-img-col { display: block !important; width: 100% !important; min-height: 200px !important; }
      .footer-col { display: block !important; width: 100% !important; text-align: center !important; margin-bottom: 25px !important; }
      .greeting { padding: 30px 20px; }
    }
  </style>
</head>
<body>
  <div class="container">
    
    <!-- Header -->
    <div class="header">
      <h1 class="logo">Sterling Kart</h1>
      <div class="subtitle">925 Sterling Silver Jewellery</div>
    </div>
    
    <!-- Hero Banner -->
    <div style="padding: 0 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #161616; border-radius: 16px; overflow: hidden;">
        <tr>
          <th width="50%" class="hero-col" style="padding: 40px 30px; text-align: left; vertical-align: middle; font-weight: normal;">
            <h2 style="font-family: 'Playfair Display', serif; font-size: 22px; margin: 0 0 12px 0; font-weight: 400; line-height: 1.3; letter-spacing: 1px; color: #ffffff;">WELCOME TO<br>STERLING KART</h2>
            <p style="font-size: 14px; color: #A0A0A0; margin: 0; line-height: 1.5; font-family: 'Inter', Helvetica, Arial, sans-serif;">Timeless Silver.<br>Made For You.</p>
          </th>
          <th width="50%" class="hero-img-col" style="background-color: #222; background-image: url('https://images.unsplash.com/photo-1599643478514-4a42095ce801?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'); background-size: cover; background-position: center; min-height: 240px;">
            <div style="height: 240px;"></div>
          </th>
        </tr>
      </table>
    </div>

    <!-- Greeting Section -->
    <div class="greeting">
      <p style="color: #ffffff; font-size: 16px; font-weight: 400;">Hi ${name || 'Customer'},</p>
      <p>Your account has been created successfully.</p>
      <p>We're delighted to welcome you to the Sterling Kart family.</p>
      <p>Discover handcrafted 925 Sterling Silver Jewellery designed to celebrate every occasion.</p>
    </div>

    <!-- Welcome Gift Card -->
    <div class="gift-card">
      <h3 class="gift-title">🎁 Welcome Gift</h3>
      <h2 class="gift-amount">50 Loyalty Points</h2>
      <p class="gift-desc">Already added to your account.<br><br>Use them on your future purchases and start earning even more rewards with every order.</p>
    </div>

    <!-- Features Row -->
    <div class="features">
      <div class="feature-item"><span>✧</span> 925 Sterling Silver</div>
      <div class="feature-item"><span>✧</span> Hallmarked &amp; Certified</div>
      <div class="feature-item"><span>✧</span> Secure Shipping</div>
      <div class="feature-item"><span>✧</span> Member Rewards</div>
      <div class="feature-item"><span>✧</span> Elegant Packaging</div>
    </div>

    <!-- CTA Section -->
    <div class="cta-section">
      <h2 class="cta-heading">Ready to find your perfect piece?</h2>
      <p class="cta-desc">Explore rings, necklaces, bracelets, earrings and more.</p>
      <a href="https://sterlingkart.in/shop" class="cta-button">Explore Collection</a>
    </div>

    <!-- Footer -->
    <div class="footer">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
        <tr>
          <td width="50%" class="footer-col" style="text-align: left; vertical-align: top;">
            <p style="color: #ffffff; font-weight: 600; margin-bottom: 8px;">Need help?</p>
            <p>Reply to this email or<br>contact our support team.</p>
          </td>
          <td width="50%" class="footer-col" style="text-align: right; vertical-align: top;">
            <p style="font-family: 'Playfair Display', serif; font-style: italic; color: #ffffff; font-size: 16px; margin-bottom: 8px;">With Love,</p>
            <p>Team Sterling Kart</p>
          </td>
        </tr>
      </table>
      
      <div class="footer-socials">
        <a href="#">Instagram</a> &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; 
        <a href="#">Facebook</a> &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; 
        <a href="#">Pinterest</a>
      </div>
      
      <div class="footer-bottom">
        &copy; 2026 Sterling Kart<br><br>925 Sterling Silver Jewellery
      </div>
    </div>

  </div>
</body>
</html>`;

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

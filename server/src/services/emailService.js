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
    body { font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #222222; margin: 0; padding: 40px 10px; -webkit-font-smoothing: antialiased; }
    .container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
    table { border-collapse: collapse; border-spacing: 0; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    td, th { padding: 0; font-weight: normal; }
    a { text-decoration: none; }
    
    /* Hero Section */
    .hero { background-color: #0d0d0d; background-image: url('https://images.unsplash.com/photo-1599643478514-4a42095ce801?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'); background-size: cover; background-position: center; color: #ffffff; text-align: center; }
    .hero-content { padding: 40px 20px; background-color: rgba(13,13,13,0.85); }
    .logo-container { margin-bottom: 40px; }
    .logo-sk { font-family: 'Playfair Display', serif; font-size: 38px; color: #ffffff; line-height: 1; }
    .logo-text { font-family: 'Inter', sans-serif; font-size: 14px; letter-spacing: 5px; color: #E85D9E; text-transform: uppercase; margin-top: 8px; }
    .logo-sub { font-size: 9px; letter-spacing: 3px; color: #aaaaaa; text-transform: uppercase; margin-top: 5px; }
    .hero-title { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: normal; margin: 20px 0 15px; letter-spacing: 1px; text-align: left; padding-left: 20px;}
    .hero-title span { color: #E85D9E; }
    .hero-divider { text-align: left; padding-left: 20px; margin-bottom: 15px; }
    .hero-divider span.line { display: inline-block; width: 40px; height: 1px; background-color: #555; vertical-align: middle; }
    .hero-divider span.star { color: #E85D9E; font-size: 14px; margin: 0 8px; vertical-align: middle; }
    .hero-subtitle { font-family: 'Playfair Display', serif; font-style: italic; font-size: 16px; color: #cccccc; text-align: left; padding-left: 20px; margin: 0; }
    
    /* Content Area */
    .content-area { padding: 40px 30px; }
    .greeting-col { padding-right: 20px; }
    .greeting-title { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: normal; margin: 0 0 20px 0; color: #333; }
    .greeting-title span { color: #E85D9E; }
    .greeting-text { font-size: 13px; color: #555555; line-height: 1.6; margin: 0 0 15px 0; }
    .greeting-text span { color: #E85D9E; font-weight: 600; }
    
    .gift-col { padding-left: 10px; }
    .gift-card { border: 1px solid #fae8f0; border-radius: 12px; padding: 25px 20px; text-align: center; background-color: #ffffff; box-shadow: 0 4px 15px rgba(232, 93, 158, 0.04); }
    .gift-icon { width: 45px; height: 45px; background-color: #fff0f5; border-radius: 50%; display: inline-block; line-height: 45px; margin-bottom: 12px; color: #E85D9E; font-size: 20px; }
    .gift-title { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: #555; margin: 0 0 8px 0; font-weight: 600; }
    .gift-amount { font-family: 'Playfair Display', serif; font-size: 24px; color: #E85D9E; margin: 0 0 12px 0; }
    .gift-divider { font-size: 10px; color: #E85D9E; margin: 8px 0; }
    .gift-desc { font-size: 11px; color: #777; line-height: 1.5; margin: 0; }

    /* Features */
    .features-wrapper { border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0; padding: 30px 0; }
    .feature-item { text-align: center; padding: 0 5px; border-right: 1px solid #f0f0f0; vertical-align: top; }
    .feature-item:last-child { border-right: none; }
    .feature-icon { font-size: 22px; color: #555; margin-bottom: 8px; }
    .feature-text { font-size: 10px; color: #555; line-height: 1.4; }

    /* CTA */
    .cta-section { text-align: center; padding: 50px 20px; }
    .cta-title { font-family: 'Playfair Display', serif; font-size: 24px; color: #333; margin: 0 0 12px 0; font-weight: normal; }
    .cta-desc { font-size: 13px; color: #777; margin: 0 0 30px 0; line-height: 1.6; }
    .cta-button { display: inline-block; background-color: #E85D9E; color: #ffffff; padding: 14px 28px; border-radius: 6px; font-size: 12px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; transition: background-color 0.3s; }
    .cta-button:hover { background-color: #d14988; }

    /* Footer Support */
    .footer-support { background-color: #fafafa; padding: 30px 40px; border-top: 1px solid #f0f0f0; }
    .support-icon { font-size: 28px; color: #E85D9E; margin-right: 15px; }
    .support-text-h { font-size: 13px; font-weight: 600; color: #333; margin: 0 0 4px 0; }
    .support-text-p { font-size: 11px; color: #777; margin: 0; line-height: 1.5; }
    .footer-sign { text-align: center; border-left: 1px solid #eaeaea; padding-left: 20px; }
    .footer-sign-love { font-family: 'Playfair Display', serif; font-style: italic; color: #E85D9E; font-size: 18px; margin: 0 0 8px 0; }
    .footer-sign-team { font-size: 13px; color: #555; margin: 0; }

    /* Footer Social */
    .footer-social { padding: 30px 20px; text-align: center; }
    .social-title { font-size: 12px; color: #333; margin-right: 15px; font-weight: 600; vertical-align: middle; }
    .social-icon { display: inline-block; width: 30px; height: 30px; border: 1px solid #ddd; border-radius: 50%; line-height: 30px; text-align: center; margin: 0 5px; color: #555; font-size: 14px; vertical-align: middle; }
    .footer-bottom { font-size: 11px; color: #999; margin-top: 25px; }

    @media only screen and (max-width: 480px) {
      .hero-content { padding: 30px 15px; }
      .hero-col { display: block; width: 100%; text-align: center !important; padding: 0 !important; }
      .hero-title, .hero-divider, .hero-subtitle { text-align: center !important; padding-left: 0 !important; }
      .greeting-col, .gift-col { display: block; width: 100%; padding: 0; }
      .gift-col { margin-top: 35px; }
      .feature-item { border-right: none; border-bottom: 1px solid #f0f0f0; padding: 20px 0; display: block; width: 100%; }
      .feature-item:last-child { border-bottom: none; }
      .footer-support td.support-col { display: block; width: 100%; text-align: center; }
      .support-inner { margin: 0 auto; }
      .footer-sign { border-left: none; border-top: 1px solid #eaeaea; margin-top: 25px; padding-top: 25px; padding-left: 0; display: block; width: 100%; }
    }
  </style>
</head>
<body>
  <div class="container">
    
    <!-- Hero / Header -->
    <div class="hero">
      <div class="hero-content">
        <div class="logo-container">
          <div class="logo-sk">SK</div>
          <div class="logo-text">STERLING KART</div>
          <div class="logo-sub">&mdash; 925 SILVER JEWELLERY &mdash;</div>
        </div>
        
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <th class="hero-col" width="60%" style="vertical-align: middle;">
              <h2 class="hero-title">WELCOME TO<br><span>STERLING KART</span></h2>
              <div class="hero-divider"><span class="line"></span><span class="star">✦</span><span class="line"></span></div>
              <p class="hero-subtitle">Timeless Silver. Made for You.</p>
            </th>
            <th width="40%"></th>
          </tr>
        </table>
      </div>
    </div>

    <!-- Content Area -->
    <div class="content-area">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <th width="55%" class="greeting-col" style="vertical-align: middle; text-align: left;">
            <h3 class="greeting-title">Hi <span>${name || 'Customer'}</span>,</h3>
            <p class="greeting-text">Your account has been created successfully.<br>We're thrilled to have you with us.</p>
            <p class="greeting-text">You are now part of a community that<br>celebrates elegance, quality and<br><span>925 Sterling Silver Jewellery</span>.</p>
          </th>
          <th width="45%" class="gift-col" style="vertical-align: middle;">
            <div class="gift-card">
              <div class="gift-icon">🎁</div>
              <p class="gift-title">WELCOME GIFT</p>
              <h2 class="gift-amount">50 Loyalty Points</h2>
              <div class="gift-divider"><span style="display:inline-block;width:30px;height:1px;background:#fae8f0;vertical-align:middle;"></span> ✦ <span style="display:inline-block;width:30px;height:1px;background:#fae8f0;vertical-align:middle;"></span></div>
              <p class="gift-desc">Added to your account<br>as our welcome gift!</p>
            </div>
          </th>
        </tr>
      </table>
    </div>

    <!-- Features -->
    <div class="features-wrapper">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td class="feature-item" width="20%">
            <div class="feature-icon">💎</div>
            <div class="feature-text">925 Sterling<br>Silver</div>
          </td>
          <td class="feature-item" width="20%">
            <div class="feature-icon">🛡️</div>
            <div class="feature-text">Hallmarked &<br>Certified</div>
          </td>
          <td class="feature-item" width="20%">
            <div class="feature-icon">🚚</div>
            <div class="feature-text">Secure Shipping<br>Across India</div>
          </td>
          <td class="feature-item" width="20%">
            <div class="feature-icon">🤍</div>
            <div class="feature-text">Exclusive<br>Member Benefits</div>
          </td>
          <td class="feature-item" width="20%">
            <div class="feature-icon">🎀</div>
            <div class="feature-text">Elegant<br>Packaging</div>
          </td>
        </tr>
      </table>
    </div>

    <!-- CTA Section -->
    <div class="cta-section">
      <h2 class="cta-title">Ready to find your perfect piece?</h2>
      <p class="cta-desc">Explore rings, necklaces, bracelets, earrings and more&mdash;<br>crafted to shine for years to come.</p>
      <a href="https://sterlingkart.in/shop" class="cta-button">EXPLORE COLLECTION &rarr;</a>
    </div>

    <!-- Footer Support -->
    <div class="footer-support">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td width="55%" class="support-col" style="vertical-align: middle;">
            <table class="support-inner" border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td style="padding-right: 15px;"><div class="support-icon">🎧</div></td>
                <td style="text-align: left;">
                  <p class="support-text-h">Need any help?</p>
                  <p class="support-text-p">Reply to this email or contact<br>our support team.</p>
                </td>
              </tr>
            </table>
          </td>
          <td width="45%" class="support-col footer-sign" style="vertical-align: middle;">
            <p class="footer-sign-love">With Love,</p>
            <p class="footer-sign-team">Team Sterling Kart <span style="color: #E85D9E;">♡</span></p>
          </td>
        </tr>
      </table>
    </div>

    <!-- Footer Social -->
    <div class="footer-social">
      <span class="social-title">Follow Us</span>
      <a href="#" class="social-icon">📷</a>
      <a href="#" class="social-icon">f</a>
      <a href="#" class="social-icon">P</a>
      
      <div class="footer-bottom">
        &copy; 2026 Sterling Kart &nbsp;|&nbsp; Timeless 925 Silver Jewellery
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

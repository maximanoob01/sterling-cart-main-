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
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #fcfcfc; margin: 0; padding: 40px 0; text-align: center; color: #131E33; -webkit-font-smoothing: antialiased; }
    table { margin: 0 auto; }
    .container { max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px; border-radius: 12px; box-shadow: 0 4px 25px rgba(0,0,0,0.03); text-align: center; }
    
    .logo-sk { font-family: 'Playfair Display', serif; font-size: 52px; color: #EA6C9A; margin: 0 auto; line-height: 1; display: inline-block; position: relative; }
    .logo-sk::after { content: "✦"; position: absolute; top: 0; right: -15px; font-size: 14px; color: #EA6C9A; }
    .logo-text { font-family: 'Inter', sans-serif; font-size: 18px; letter-spacing: 5px; color: #131E33; margin: 15px auto 8px; font-weight: 600; }
    .logo-sub { font-size: 10px; letter-spacing: 1.5px; color: #999; text-transform: uppercase; margin: 0; }
    
    .divider-wrapper { margin: 25px auto; width: 250px; position: relative; height: 20px; }
    .divider-line { position: absolute; top: 10px; left: 0; right: 0; height: 1px; background-color: #fae8f0; z-index: 1; }
    .divider-star-icon { position: absolute; top: 0; left: 50%; transform: translateX(-50%); background-color: #ffffff; padding: 0 15px; z-index: 2; color: #EA6C9A; font-size: 14px; }
    
    .welcome-to { font-size: 13px; letter-spacing: 2px; font-weight: 600; margin: 0 auto 5px; color: #131E33; text-align: center; }
    .brand-name { font-family: 'Playfair Display', serif; font-size: 34px; color: #EA6C9A; margin: 0 auto; letter-spacing: 1px; text-align: center; }
    
    .tagline { font-family: 'Playfair Display', serif; font-style: italic; font-size: 20px; margin: 25px auto 35px; color: #131E33; text-align: center; }
    
    .greeting { font-size: 16px; margin: 0 auto 20px; font-weight: 400; color: #131E33; text-align: center; }
    .greeting span { color: #EA6C9A; font-weight: 600; }
    .intro-text { font-size: 14px; line-height: 1.6; margin: 0 auto 15px; max-width: 350px; color: #131E33; text-align: center; }
    .svg-icon { margin: 15px auto; display: block; }
    
    .gift-box { border: 1px solid #fae8f0; border-radius: 12px; padding: 30px 20px; margin: 35px auto; max-width: 360px; background-color: #fffbfe; text-align: center; }
    
    .gift-title-wrapper { margin: 0 auto 20px; width: 200px; position: relative; height: 15px; }
    .gift-title-line { position: absolute; top: 7px; left: 0; right: 0; height: 1px; background-color: #EA6C9A; z-index: 1; }
    .gift-title-text { position: absolute; top: 0; left: 50%; transform: translateX(-50%); background-color: #fffbfe; padding: 0 10px; z-index: 2; font-size: 11px; letter-spacing: 2px; color: #EA6C9A; font-weight: 600; margin: 0; white-space: nowrap; }
    
    .gift-amount-container { display: flex; align-items: baseline; justify-content: center; gap: 10px; margin-bottom: 20px; }
    .gift-amount { font-family: 'Playfair Display', serif; font-size: 64px; color: #EA6C9A; margin: 0; line-height: 1; }
    .gift-points { font-family: 'Playfair Display', serif; font-size: 22px; color: #131E33; margin: 0; }
    .gift-desc { font-size: 15px; line-height: 1.5; color: #131E33; margin: 0 auto; text-align: center; }
    
    .cta-ready { color: #EA6C9A; font-size: 16px; font-weight: 600; margin: 35px auto 10px; text-align: center; }
    .cta-desc { font-size: 14px; line-height: 1.6; margin: 0 auto 25px; max-width: 380px; color: #131E33; text-align: center; }
    
    .jewelry-icons-container { margin: 0 auto 30px; display: flex; justify-content: center; gap: 20px; align-items: center; }
    .jewelry-divider { width: 1px; height: 20px; background-color: #fae8f0; }
    
    .cta-button { display: inline-block; background-color: #071529; color: #ffffff; padding: 16px 45px; border-radius: 6px; font-size: 14px; letter-spacing: 1px; font-weight: 600; text-decoration: none; margin: 0 auto 40px; text-transform: uppercase; }
    
    .help-box { border: 1px solid #fae8f0; border-radius: 8px; padding: 20px; max-width: 320px; margin: 0 auto 30px; display: flex; align-items: center; justify-content: center; gap: 20px; background-color: #fffbfe; text-align: left; }
    .help-title { color: #EA6C9A; font-size: 14px; font-weight: 600; margin: 0 0 5px; }
    .help-desc { font-size: 12px; line-height: 1.5; margin: 0; color: #131E33; }
    
    .signature { font-family: 'Playfair Display', serif; font-style: italic; color: #EA6C9A; font-size: 18px; margin: 20px auto 5px; text-align: center; }
    .team { font-size: 14px; font-weight: 400; margin: 0 auto 40px; color: #131E33; text-align: center; }
    
    table.footer { width: 100%; background-color: #071529; color: #ffffff; border-radius: 8px; padding: 25px 10px; margin-top: 10px; table-layout: fixed; }
    table.footer td { text-align: center; width: 25%; font-size: 10px; padding: 0 5px; vertical-align: top; border-right: 1px solid rgba(255,255,255,0.1); }
    table.footer td:last-child { border-right: none; }
    .footer-icon-wrap { margin: 0 auto 10px; width: 24px; height: 24px; display: block; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo-sk">SK</div>
    <div class="logo-text">STERLING KART</div>
    <table border="0" cellpadding="0" cellspacing="0" style="margin: 10px auto 0;">
      <tr>
        <td width="40"><div style="height:1px;background-color:#fae8f0;width:100%;"></div></td>
        <td style="padding: 0 10px;"><div class="logo-sub">925 SILVER JEWELLERY</div></td>
        <td width="40"><div style="height:1px;background-color:#fae8f0;width:100%;"></div></td>
      </tr>
    </table>
    
    <div class="divider-wrapper">
      <div class="divider-line"></div>
      <div class="divider-star-icon">✦</div>
    </div>
    
    <div class="welcome-to">WELCOME TO</div>
    <h1 class="brand-name">STERLING KART</h1>
    
    <div class="divider-wrapper" style="width: 150px; margin: 15px auto;">
      <div class="divider-line"></div>
      <div class="divider-star-icon" style="font-size:12px;">✦</div>
    </div>
    
    <div class="tagline">Timeless Silver. Made for You.</div>
    
    <div class="greeting">Hi <span>${name || 'Customer'}</span>,</div>
    <div class="intro-text">Your account has been created successfully.<br>We're thrilled to have you with us.</div>
    
    <svg class="svg-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EA6C9A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
    
    <div class="intro-text">You are now part of a community that<br>celebrates elegance, quality and<br>925 Sterling Silver Jewellery.</div>
    
    <div class="gift-box">
      <svg class="svg-icon" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#EA6C9A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-top:0;"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>
      
      <div class="gift-title-wrapper">
        <div class="gift-title-line"></div>
        <div class="gift-title-text">WELCOME GIFT</div>
      </div>
      
      <div class="gift-amount-container">
        <span class="gift-amount">50</span>
        <span class="gift-points">Loyalty Points</span>
      </div>
      
      <div class="divider-wrapper" style="width: 80px; margin: 15px auto; height: 15px;">
        <div class="divider-line" style="top:7px;"></div>
        <div class="divider-star-icon" style="font-size:10px; padding:0 8px; background-color:#fffbfe;">✦</div>
      </div>
      
      <p class="gift-desc">Added to your account<br>as our welcome gift!</p>
    </div>
    
    <div class="cta-ready">Ready to find your perfect piece?</div>
    <div class="cta-desc">Explore rings, necklaces, bracelets, earrings and more&mdash;<br>crafted to shine for years to come.</div>
    
    <div class="jewelry-icons-container">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#131E33" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="16" r="6"></circle><path d="M9.5 10l1.5-4 2 0 1.5 4"></path><path d="M7 10h10"></path></svg>
      <div class="jewelry-divider"></div>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#131E33" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4c0 7 4 12 8 12s8-5 8-12"></path><circle cx="12" cy="18" r="3"></circle><path d="M12 18l1.5-1.5M12 18l-1.5-1.5"></path></svg>
      <div class="jewelry-divider"></div>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#131E33" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="12" rx="9" ry="5" stroke-dasharray="2 2"></ellipse></svg>
      <div class="jewelry-divider"></div>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#131E33" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 14c0 3 2 5 2 5s2-2 2-5-1-4-2-4-2 1-2 4z"></path><path d="M13 14c0 3 2 5 2 5s2-2 2-5-1-4-2-4-2 1-2 4z"></path><circle cx="9" cy="8" r="1"></circle><circle cx="15" cy="8" r="1"></circle></svg>
    </div>
    
    <a href="https://sterlingkart.in/shop" class="cta-button">EXPLORE COLLECTION &rarr;</a>
    
    <div class="help-box">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#EA6C9A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path><path d="M12 12l-1 1a1.5 1.5 0 0 0 2 2l1-1a1.5 1.5 0 0 0-2-2z"></path></svg>
      <div>
        <div class="help-title">Need any help?</div>
        <div class="help-desc">Reply to this email or contact<br>our support team.</div>
      </div>
    </div>
    
    <svg class="svg-icon" width="16" height="16" viewBox="0 0 24 24" fill="#EA6C9A" stroke="#EA6C9A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 5px;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
    <div class="signature">With Love,</div>
    <div class="team">Sterling Kart Team</div>
    
    <table class="footer" cellspacing="0" cellpadding="0">
      <tr>
        <td>
          <div class="footer-icon-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M9 12l2 2 4-4"></path></svg></div>
          925 Pure Silver
        </td>
        <td>
          <div class="footer-icon-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15l-3.5 2 1-4-3-3 4-.5L12 6l1.5 3.5 4 .5-3 3 1 4z"></path><circle cx="12" cy="12" r="10"></circle></svg></div>
          Premium Quality
        </td>
        <td>
          <div class="footer-icon-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg></div>
          Secure Packaging
        </td>
        <td>
          <div class="footer-icon-wrap"><svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg></div>
          Easy Exchange
        </td>
      </tr>
    </table>
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

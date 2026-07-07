import { Resend } from 'resend';
import React from 'react';
import { render } from '@react-email/render';

import WelcomeEmail from '../emails/WelcomeEmail.jsx';
import OrderConfirmationEmail from '../emails/OrderConfirmationEmail.jsx';
import InvoiceEmail from '../emails/InvoiceEmail.jsx';
import GiftCardEmail from '../emails/GiftCardEmail.jsx';
import ContactNotificationEmail from '../emails/ContactNotificationEmail.jsx';

// Validate environment variables on startup
const validateEnv = () => {
  const missing = [];
  if (!process.env.RESEND_API_KEY) missing.push('RESEND_API_KEY');
  if (!process.env.ORDER_EMAIL_FROM) missing.push('ORDER_EMAIL_FROM');
  if (!process.env.NOREPLY_EMAIL_FROM) missing.push('NOREPLY_EMAIL_FROM');
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

export const sendOrderConfirmation = async (orderId, form, items, totalAmount) => {
  const html = await render(React.createElement(OrderConfirmationEmail, { orderId, form, items, totalAmount }));
  return await sendWithResend('Order Confirmation', {
    from: process.env.ORDER_EMAIL_FROM,
    to: form.email,
    subject: `Order Confirmation — ${orderId}`,
    html,
  });
};

export const sendContactNotification = async (contactData) => {
  const html = await render(React.createElement(ContactNotificationEmail, { contactData }));
  await sendWithResend('Contact Notification', {
    from: process.env.NOREPLY_EMAIL_FROM,
    to: process.env.ADMIN_EMAIL,
    reply_to: contactData.email,
    subject: `New Contact Message from ${contactData.name}`,
    html,
  });
};

export const sendGiftCardEmail = async (email, name, amount, code, expiryDate) => {
  const html = await render(React.createElement(GiftCardEmail, { name, amount, code, expiryDate }));
  return await sendWithResend('Gift Card Email', {
    from: process.env.ORDER_EMAIL_FROM,
    to: email,
    subject: `Your Sterling Kart Gift Card — ₹${amount}`,
    html,
  });
};

export const sendWelcomeEmail = async (email, name) => {
  const html = await render(React.createElement(WelcomeEmail, { name }));
  return await sendWithResend('Welcome Email', {
    from: process.env.NOREPLY_EMAIL_FROM,
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

  const html = await render(React.createElement(InvoiceEmail, { order, items }));
  const attachments = pdfBase64 ? [
    {
      filename: `SterlingKart_Invoice_${orderId}.pdf`,
      content: Buffer.from(pdfBase64.split(',')[1] || pdfBase64, 'base64')
    }
  ] : [];

  return await sendWithResend('Invoice Email', {
    from: process.env.ORDER_EMAIL_FROM,
    to: email,
    subject: `Your Invoice for Order ${orderId}`,
    html,
    attachments
  });
};

import { sendOrderConfirmation } from './services/emailService.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  try {
    const form = {
      fullName: 'Test User',
      email: 'hypenbloom@gmail.com',
      addressLine1: '123 Test St',
      city: 'Test City',
      state: 'TS',
      pincode: '123456',
      phone: '9876543210'
    };
    const items = [
      { name: 'Silver Ring', qty: 1, price: 1000, engravingText: 'Love' }
    ];
    await sendOrderConfirmation('ORD-123', form, items, 1000);
    console.log('Order confirmation email sent successfully!');
  } catch (err) {
    console.error('Failed to send email:', err);
  }
}
run();

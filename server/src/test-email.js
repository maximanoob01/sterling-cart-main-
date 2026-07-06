import { sendWelcomeEmail } from './services/emailService.js';

async function run() {
  try {
    await sendWelcomeEmail('hypenbloom@gmail.com', 'Test User');
    console.log('Test welcome email sent to hypenbloom@gmail.com successfully!');
  } catch (err) {
    console.error('Failed to send email:', err);
  }
}

run();

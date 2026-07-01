import cron from 'node-cron';
import { Op } from 'sequelize';
import { GiftCard, User } from '../models/index.js';

// Job 1: Midnight Expiry Job
// Runs every day at 00:00
cron.schedule('0 0 * * *', async () => {
  try {
    console.log('[CRON] Running Midnight Gift Card Expiry Job...');
    const now = new Date();
    
    // Find all active/partially_used cards where expiresAt is in the past
    const [updatedCount] = await GiftCard.update(
      { status: 'expired' },
      {
        where: {
          expiresAt: { [Op.lt]: now },
          status: { [Op.notIn]: ['exhausted', 'expired'] }
        }
      }
    );
    
    console.log(`[CRON] Expiry Job Complete. Expired ${updatedCount} gift cards.`);
  } catch (error) {
    console.error('[CRON] Expiry Job Error:', error);
  }
});

// Job 2: 30-Day Expiry Reminder Job
// Runs every day at 00:05
cron.schedule('5 0 * * *', async () => {
  try {
    console.log('[CRON] Running 30-Day Gift Card Reminder Job...');
    
    // 30 days from now
    const targetStart = new Date();
    targetStart.setDate(targetStart.getDate() + 30);
    targetStart.setHours(0, 0, 0, 0);
    
    const targetEnd = new Date(targetStart);
    targetEnd.setHours(23, 59, 59, 999);

    const expiringCards = await GiftCard.findAll({
      where: {
        expiresAt: {
          [Op.between]: [targetStart, targetEnd]
        },
        status: { [Op.notIn]: ['exhausted', 'expired'] }
      },
      include: [{ model: User, as: 'User' }]
    });

    for (const card of expiringCards) {
      if (card.User && card.User.phone) {
        console.log(`\n[WHATSAPP MOCK] To ${card.User.phone}: Your ₹${card.remainingBalance} Sterling Kart gift card expires on ${card.expiresAt.toLocaleDateString()}. Use it before it's gone.\n`);
      }
    }
    
    console.log(`[CRON] Reminder Job Complete. Sent ${expiringCards.length} reminders.`);
  } catch (error) {
    console.error('[CRON] Reminder Job Error:', error);
  }
});

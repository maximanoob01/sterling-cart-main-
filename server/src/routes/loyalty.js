import { Router } from 'express';
import { Loyalty, LoyaltyHistory } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { LOYALTY_EARN_RATE, LOYALTY_REDEEM_CAP } from '../config/constants.js';
import { syncExpiredPoints } from '../services/loyaltyService.js';

const router = Router();

// ─── GET /api/loyalty — Get balance & history ────────────────────────────────
router.get('/', authenticate, async (req, res, next) => {
  try {
    let loyalty = await Loyalty.findOne({
      where: { userId: req.dbUser.id },
      include: [{ model: LoyaltyHistory, as: 'history' }],
      order: [[{ model: LoyaltyHistory, as: 'history' }, 'date', 'DESC']]
    });

    if (!loyalty) {
      loyalty = await Loyalty.create({ userId: req.dbUser.id, balance: 50 });
      await LoyaltyHistory.create({
        loyaltyId: loyalty.id,
        type: 'earned',
        points: 50,
        description: 'Welcome bonus',
        date: new Date(),
        expiresAt: new Date(new Date().setMonth(new Date().getMonth() + 12))
      });
      await loyalty.reload({ include: [{ model: LoyaltyHistory, as: 'history' }] });
    } else {
      await syncExpiredPoints(loyalty);
    }

    res.json({
      success: true,
      balance: loyalty.balance,
      history: loyalty.history,
      earnRate: LOYALTY_EARN_RATE,
      redeemCap: LOYALTY_REDEEM_CAP,
    });
  } catch (error) { next(error); }
});

export default router;

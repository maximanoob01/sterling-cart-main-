import { Loyalty, LoyaltyHistory } from '../models/index.js';

export async function syncExpiredPoints(loyalty) {
  const history = await LoyaltyHistory.findAll({ where: { loyaltyId: loyalty.id } });
  
  let totalRedeemed = 0;
  let totalExpired = 0;
  let expiredEarned = 0;
  
  const now = new Date();
  
  for (const h of history) {
    if (h.type === 'redeemed') totalRedeemed += h.points;
    if (h.type === 'expired') totalExpired += h.points;
    if (h.type === 'earned' && h.expiresAt && new Date(h.expiresAt) <= now) {
      expiredEarned += h.points;
    }
  }
  
  const effectiveExpired = Math.max(0, expiredEarned - totalRedeemed - totalExpired);
  
  if (effectiveExpired > 0) {
    await LoyaltyHistory.create({
      loyaltyId: loyalty.id,
      type: 'expired',
      points: effectiveExpired,
      description: 'Loyalty Points expired',
      date: new Date()
    });
    
    await loyalty.decrement('balance', { by: effectiveExpired });
    
    // Refresh loyalty instance
    await loyalty.reload({ include: [{ model: LoyaltyHistory, as: 'history' }] });
    return true;
  }
  
  return false;
}

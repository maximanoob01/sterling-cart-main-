import { Router } from 'express';
import { Wishlist, Product } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// ─── GET /api/wishlist — Get user's wishlist ─────────────────────────────────
router.get('/', authenticate, async (req, res, next) => {
  try {
    const items = await Wishlist.findAll({
      where: { userId: req.dbUser.id },
      include: [{ model: Product }]
    });
    const products = items.map(w => w.Product).filter(Boolean);
    res.json({ success: true, products });
  } catch (error) { next(error); }
});

// ─── POST /api/wishlist/:productId — Toggle wishlist item ────────────────────
router.post('/:productId', authenticate, async (req, res, next) => {
  try {
    const { productId } = req.params;
    const existing = await Wishlist.findOne({ where: { userId: req.dbUser.id, productId } });

    if (existing) {
      await existing.destroy();
      return res.json({ success: true, action: 'removed' });
    }

    await Wishlist.create({ userId: req.dbUser.id, productId });
    res.status(201).json({ success: true, action: 'added' });
  } catch (error) { next(error); }
});

// ─── DELETE /api/wishlist/:productId — Remove from wishlist ──────────────────
router.delete('/:productId', authenticate, async (req, res, next) => {
  try {
    await Wishlist.destroy({ where: { userId: req.dbUser.id, productId: req.params.productId } });
    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (error) { next(error); }
});

export default router;

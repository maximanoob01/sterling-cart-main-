import { Router } from 'express';
import { body } from 'express-validator';
import { Coupon, Order } from '../models/index.js';
import { authenticate, optionalAuth, requireAdmin } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = Router();

// Codes that are only valid on a user's first order
const FIRST_ORDER_ONLY_CODES = new Set(['SILVER10']);

// ─── POST /api/coupons/validate — Validate a coupon code ────────────────────
router.post('/validate', optionalAuth, [
  body('code').trim().notEmpty().withMessage('Coupon code is required'),
  body('orderValue').isNumeric().withMessage('Order value is required'),
], validate, async (req, res, next) => {
  try {
    const { code, orderValue } = req.body;
    const upperCode = code.toUpperCase();
    const coupon = await Coupon.findOne({ where: { code: upperCode } });

    if (!coupon) {
      return res.status(404).json({ success: false, error: 'Invalid coupon code' });
    }

    const validity = coupon.isValid(orderValue);
    if (!validity.valid) {
      return res.status(400).json({ success: false, error: validity.reason });
    }

    // First-order-only check
    if (FIRST_ORDER_ONLY_CODES.has(upperCode)) {
      if (!req.dbUser) {
        return res.status(401).json({ success: false, error: 'Please log in to use this coupon — it\'s valid for first-time customers only' });
      }
      const priorOrder = await Order.findOne({ where: { userId: req.dbUser.id } });
      if (priorOrder) {
        return res.status(400).json({ success: false, error: 'SILVER10 is only valid on your first order' });
      }
    }

    const discount = coupon.calculateDiscount(orderValue);

    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        discount: discount,
        discountValue: coupon.discount,
        maxDiscount: coupon.maxDiscount || null,
      },
    });
  } catch (error) { next(error); }
});

// ─── Admin: GET /api/coupons — List all coupons ─────────────────────────────
router.get('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const coupons = await Coupon.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ success: true, coupons });
  } catch (error) { next(error); }
});

// ─── Admin: POST /api/coupons — Create coupon ───────────────────────────────
router.post('/', authenticate, requireAdmin, [
  body('code').trim().notEmpty(),
  body('type').isIn(['percentage', 'flat']),
  body('discount').isNumeric(),
], validate, async (req, res, next) => {
  try {
    const coupon = await Coupon.create({
      ...req.body,
      code: req.body.code.toUpperCase()
    });
    res.status(201).json({ success: true, coupon });
  } catch (error) { next(error); }
});

// ─── Admin: DELETE /api/coupons/:id — Delete coupon ─────────────────────────
router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    await Coupon.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) { next(error); }
});

// ─── Admin: PUT /api/coupons/:id — Update coupon ─────────────────────────────
router.put('/:id', authenticate, requireAdmin, [
  body('code').optional().trim().notEmpty(),
  body('type').optional().isIn(['percentage', 'flat']),
  body('discount').optional().isNumeric(),
  body('minOrderValue').optional().isNumeric(),
  body('maxDiscount').optional({ nullable: true }).isNumeric(),
  body('usageLimit').optional({ nullable: true }).isNumeric(),
  body('isActive').optional().isBoolean(),
  body('expiresAt').optional({ nullable: true }).isISO8601()
], validate, async (req, res, next) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, error: 'Coupon not found' });
    }
    const updateData = { ...req.body };
    if (updateData.code) {
      updateData.code = updateData.code.toUpperCase();
    }
    await coupon.update(updateData);
    res.json({ success: true, coupon });
  } catch (error) { next(error); }
});

export default router;

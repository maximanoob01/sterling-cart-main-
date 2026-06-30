import { Router } from 'express';
import { body } from 'express-validator';
import { Coupon } from '../models/index.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = Router();

// ─── POST /api/coupons/validate — Validate a coupon code ────────────────────
router.post('/validate', [
  body('code').trim().notEmpty().withMessage('Coupon code is required'),
  body('orderValue').isNumeric().withMessage('Order value is required'),
], validate, async (req, res, next) => {
  try {
    const { code, orderValue } = req.body;
    const coupon = await Coupon.findOne({ where: { code: code.toUpperCase() } });

    if (!coupon) {
      return res.status(404).json({ success: false, error: 'Invalid coupon code' });
    }

    const validity = coupon.isValid(orderValue);
    if (!validity.valid) {
      return res.status(400).json({ success: false, error: validity.reason });
    }

    const discount = coupon.calculateDiscount(orderValue);

    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        discount: discount,
        discountValue: coupon.discount,
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

export default router;

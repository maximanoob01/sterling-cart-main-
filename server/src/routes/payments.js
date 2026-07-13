import { Router } from 'express';
import { body } from 'express-validator';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { createHybridStore } from '../utils/rateLimitStore.js';

const router = Router();

// Tighter rate limit on payment order creation: 10 per 10 minutes per IP
const paymentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Too many payment requests, please wait a few minutes' },
  store: createHybridStore(),
});

let razorpayInstance = null;

const getRazorpay = () => {
  if (razorpayInstance) return razorpayInstance;
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  return razorpayInstance;
};

// ─── POST /api/payments/create-order — Create Razorpay order ─────────────────
// NOTE: amount must come from the server-computed total in the order flow.
// We validate it is a positive integer (paise) to avoid type confusion,
// but the real guard is that checkout calls /api/orders first (which computes
// the total server-side) and only then calls this endpoint with that total.
router.post('/create-order', paymentLimiter, optionalAuth, [
  body('amount')
    .isInt({ min: 100 })
    .withMessage('Amount must be at least ₹1 (100 paise)'),
  body('currency')
    .optional()
    .isIn(['INR'])
    .withMessage('Only INR is supported'),
  body('receipt')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 40 }),
], validate, async (req, res, next) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: Math.round(amount), // caller must pass paise (already int-validated)
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    });

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Razorpay create order error:', error);
    next(error);
  }
});

// ─── POST /api/payments/verify — Verify Razorpay payment signature ───────────
router.post('/verify', [
  body('razorpay_order_id').trim().notEmpty().withMessage('Order ID is required'),
  body('razorpay_payment_id').trim().notEmpty().withMessage('Payment ID is required'),
  body('razorpay_signature').trim().notEmpty().withMessage('Signature is required'),
], validate, async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Payment verification failed' });
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  } catch (error) { next(error); }
});

export default router;

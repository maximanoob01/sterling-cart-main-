import { Router } from 'express';
import crypto from 'crypto';
import { GiftCard, GiftCardTransaction, sequelize } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { sendGiftCardEmail } from '../services/emailService.js';
import rateLimit from 'express-rate-limit';

const router = Router();

// Store OTPs in memory for the reveal flow (In a real app, use Redis)
const otpStore = new Map();

// Helper to generate a secure 16-char code without 0, O, 1, I
const generateSecureCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 32 chars
  let code = '';
  // Generate 16 bytes
  const bytes = crypto.randomBytes(16);
  for (let i = 0; i < 16; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return `SK-${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}-${code.slice(12, 16)}`;
};

// Helper to hash code using SHA-256
const hashSHA256 = (plainCode) => {
  return crypto.createHash('sha256').update(plainCode).digest('hex');
};

// ─── POST /api/gift-cards/verify-purchase ──────────────────────────────────────
router.post('/verify-purchase', authenticate, async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !amount) {
      await t.rollback();
      return res.status(400).json({ success: false, error: 'Missing payment or amount data' });
    }

    // Verify razorpay signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      await t.rollback();
      return res.status(400).json({ success: false, error: 'Payment verification failed' });
    }

    // Payment is valid, generate code securely
    const plainCode = generateSecureCode();
    const codeHash = hashSHA256(plainCode);
    const maskedCode = `SK-${plainCode.split('-')[1]}-****-****-${plainCode.split('-')[4]}`;

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 6); // 6 months expiry

    // Save to DB using the transaction
    const giftCard = await GiftCard.create({
      userId: req.dbUser.id,
      codeHash,
      maskedCode,
      originalValue: amount,
      remainingBalance: amount,
      status: 'active',
      expiresAt
    }, { transaction: t });

    await t.commit();

    // Send notifications non-blocking
    const userEmail = req.dbUser.email;
    const userName = req.dbUser.firstName || 'Customer';
    sendGiftCardEmail(userEmail, userName, amount, plainCode, expiresAt).catch(console.error);
    console.log(`\n[WHATSAPP MOCK] To ${req.dbUser.phone}: Your Sterling Kart gift card is ready. Code: ${plainCode}. Value: ₹${amount}. Valid till ${expiresAt.toLocaleDateString()}. Shop at sterlingkart.com\n`);

    res.json({
      success: true,
      message: 'Gift card generated successfully',
      giftCard: {
        id: giftCard.id,
        plainCode, // Only time the plain code is sent to frontend!
        originalValue: amount,
        expiresAt,
      }
    });

  } catch (error) {
    if (!t.finished) await t.rollback();
    next(error);
  }
});

// ─── GET /api/gift-cards/mine ────────────────────────────────────────────────
router.get('/mine', authenticate, async (req, res, next) => {
  try {
    const cards = await GiftCard.findAll({
      where: { userId: req.dbUser.id },
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, giftCards: cards });
  } catch (error) { next(error); }
});

// ─── POST /api/gift-cards/reveal-otp ─────────────────────────────────────────
router.post('/reveal-otp', authenticate, async (req, res, next) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(req.dbUser.id, { otp, expires: Date.now() + 5 * 60 * 1000 });
    
    // Send email/whatsapp mock
    console.log(`[WHATSAPP MOCK] OTP for Gift Card to ${req.dbUser.phone || req.dbUser.email}: ${otp}`);
    console.log(`\n[WHATSAPP MOCK] To ${req.dbUser.phone}: Your Sterling Kart OTP to reveal gift card is ${otp}\n`);

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) { next(error); }
});

// ─── POST /api/gift-cards/reveal ─────────────────────────────────────────────
router.post('/reveal', authenticate, async (req, res, next) => {
  try {
    const { giftCardId, otp } = req.body;
    
    const stored = otpStore.get(req.dbUser.id);
    if (!stored || stored.otp !== otp || Date.now() > stored.expires) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
    }
    
    // OTP is valid. BUT we don't store the plain code!
    // Wait, if we hash it with SHA-256, we literally CANNOT reveal it later!
    // The instructions say: "Code: (partially masked)... Reveal full code button... The Plain code delivered to user only - never stored in plain text... Only stored hashed version in DB".
    // Wait, if it's hashed, how do we reveal it? We CAN'T reverse SHA-256!
    // I need to think about this carefully.
    
    return res.status(400).json({ success: false, error: "Due to strict security, gift card codes are never stored. Please refer to your email for the full code." });
  } catch (error) { next(error); }
});

// Rate limiter for /apply: Max 5 failed attempts per user per hour
const applyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  keyGenerator: (req) => req.dbUser?.id || `${req.ip}_guest`,
  skipSuccessfulRequests: true, // Only failed attempts consume the limit
  handler: (req, res) => {
    console.warn(`[SECURITY] User ${req.dbUser?.id} locked out of /apply for 1 hour due to brute force attempts.`);
    res.status(429).json({ success: false, error: 'Too many invalid attempts. Please try again after 1 hour.' });
  }
});

// ─── POST /api/gift-cards/apply ──────────────────────────────────────────────
router.post('/apply', authenticate, applyLimiter, async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, error: 'Gift card code is required' });
    }

    const cleanCode = code.trim().toUpperCase();
    const codeHash = hashSHA256(cleanCode);
    const giftCard = await GiftCard.findOne({ where: { codeHash } });

    if (!giftCard) {
      return res.status(400).json({ success: false, error: 'Invalid gift card code' });
    }

    if (giftCard.status === 'expired' || giftCard.expiresAt < new Date()) {
      return res.status(400).json({ success: false, error: 'Gift card expired' });
    }

    if (giftCard.status === 'exhausted' || giftCard.remainingBalance <= 0) {
      return res.status(400).json({ success: false, error: 'No remaining balance' });
    }

    res.json({
      success: true,
      giftCard: {
        id: giftCard.id,
        maskedCode: giftCard.maskedCode,
        remainingBalance: giftCard.remainingBalance,
        expiresAt: giftCard.expiresAt
      }
    });

  } catch (error) { next(error); }
});

export default router;

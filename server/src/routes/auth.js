import { Router } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import process from 'node:process';
import { User, Address, Loyalty, LoyaltyHistory, Notification } from '../models/index.js';
import { syncExpiredPoints } from '../services/loyaltyService.js';
import { authenticate } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = Router();

// ─── GET /api/auth/me — Get current user ─────────────────────────────────────
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.dbUser.id, {
      include: [{ model: Address, as: 'addresses' }]
    });
    res.json({ success: true, user });
  } catch (error) { next(error); }
});

// ─── PUT /api/auth/profile — Update profile ──────────────────────────────────
router.put('/profile', authenticate, [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Invalid email'),
], validate, async (req, res, next) => {
  try {
    const { name, email } = req.body;
    if (name !== undefined) req.dbUser.name = name;
    if (email !== undefined) req.dbUser.email = email;

    await req.dbUser.save();
    res.json({ success: true, user: req.dbUser });
  } catch (error) { next(error); }
});

// ─── POST /api/auth/addresses — Add address ──────────────────────────────────
router.post('/addresses', authenticate, [
  body('fullName').trim().notEmpty(),
  body('addressLine1').trim().notEmpty(),
  body('city').trim().notEmpty(),
  body('state').trim().notEmpty(),
  body('pincode').matches(/^\d{6}$/),
], validate, async (req, res, next) => {
  try {
    const address = req.body;
    address.userId = req.dbUser.id;

    // If marked as default, unset others
    if (address.isDefault) {
      await Address.update({ isDefault: false }, { where: { userId: req.dbUser.id } });
    } else {
      const count = await Address.count({ where: { userId: req.dbUser.id } });
      if (count === 0) address.isDefault = true;
    }

    await Address.create(address);
    const addresses = await Address.findAll({ where: { userId: req.dbUser.id }, order: [['createdAt', 'DESC']] });
    res.status(201).json({ success: true, addresses });
  } catch (error) { next(error); }
});

// ─── PUT /api/auth/addresses/:id — Update address ────────────────────────────
router.put('/addresses/:id', authenticate, async (req, res, next) => {
  try {
    const addr = await Address.findOne({ where: { id: req.params.id, userId: req.dbUser.id } });
    if (!addr) return res.status(404).json({ success: false, error: 'Address not found' });

    if (req.body.isDefault) {
      await Address.update({ isDefault: false }, { where: { userId: req.dbUser.id } });
    }

    await addr.update(req.body);
    const addresses = await Address.findAll({ where: { userId: req.dbUser.id }, order: [['createdAt', 'DESC']] });
    res.json({ success: true, addresses });
  } catch (error) { next(error); }
});

// ─── DELETE /api/auth/addresses/:id — Delete address ─────────────────────────
router.delete('/addresses/:id', authenticate, async (req, res, next) => {
  try {
    const deleted = await Address.destroy({ where: { id: req.params.id, userId: req.dbUser.id } });
    if (!deleted) return res.status(404).json({ success: false, error: 'Address not found' });

    const addresses = await Address.findAll({ where: { userId: req.dbUser.id }, order: [['createdAt', 'DESC']] });
    res.json({ success: true, addresses });
  } catch (error) { next(error); }
});

// ─── POST /api/auth/request-otp — Validate phone & send OTP ─────────────────
router.post('/request-otp', [
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('isSignup').isBoolean().withMessage('isSignup flag is required'),
], validate, async (req, res, next) => {
  try {
    const { phone, isSignup } = req.body;

    const existingUser = await User.findOne({ where: { phone } });

    if (isSignup && existingUser) {
      return res.status(400).json({
        success: false,
        error: 'An account with this phone number already exists. Please sign in instead.',
      });
    }

    if (!isSignup && !existingUser) {
      return res.status(404).json({
        success: false,
        error: 'No account found with this phone number. Please sign up first.',
      });
    }

    // In production: send real OTP via SMS provider here
    // For dev: OTP is always 1234
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) { next(error); }
});

// ─── POST /api/auth/verify-otp — Verify OTP and login/signup ────────────────
router.post('/verify-otp', [
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('otp').trim().notEmpty().withMessage('OTP is required'),
], validate, async (req, res, next) => {
  try {
    const { phone, otp, isSignup, name, email } = req.body;

    // Hardcoded check for "1234" as per user instruction
    if (otp !== '1234') {
      return res.status(400).json({ success: false, error: 'Invalid OTP' });
    }

    let user = await User.findOne({ where: { phone } });
    let isNewUser = false;

    if (isSignup) {
      // Signup: user must NOT exist
      if (user) {
        return res.status(400).json({
          success: false,
          error: 'An account with this phone number already exists. Please sign in.',
        });
      }
      if (!name || !email) {
        return res.status(400).json({
          success: false,
          error: 'Name and email are required to create an account.',
        });
      }
      user = await User.create({ phone, name, email, role: 'user' });
      isNewUser = true;

      // Create Admin Notification
      await Notification.create({
        type: 'info',
        title: 'New customer signed up',
        message: `${name} joined Sterling Kart`,
        link: '/admin/customers',
      });
    } else {
      // Login: user MUST exist
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'No account found with this phone number. Please sign up first.',
        });
      }
      // Optionally fill in missing profile fields if provided
      let updated = false;
      if (name && !user.name) { user.name = name; updated = true; }
      if (email && !user.email) { user.email = email; updated = true; }
      if (updated) await user.save();
    }

    // Ensure loyalty record exists
    let loyalty = await Loyalty.findOne({ where: { userId: user.id } });
    if (!loyalty) {
      loyalty = await Loyalty.create({ userId: user.id, balance: 200 });
      await LoyaltyHistory.create({
        loyaltyId: loyalty.id,
        type: 'earned',
        points: 200,
        description: 'Welcome bonus',
        date: new Date(),
        expiresAt: new Date(new Date().setMonth(new Date().getMonth() + 12))
      });
    } else {
      await syncExpiredPoints(loyalty);
    }

    // Issue Access Token
    const token = jwt.sign(
      { userId: user.id, phone: user.phone, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret-key-for-dev',
      { expiresIn: '15m' }
    );

    // Issue Refresh Token
    const refreshToken = jwt.sign(
      { userId: user.id, phone: user.phone, role: user.role },
      process.env.JWT_REFRESH_SECRET || 'fallback-refresh-key-for-dev',
      { expiresIn: '7d' }
    );

    // Set HTTP-Only Cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    await user.reload({ include: [{ model: Address, as: 'addresses' }] });
    res.json({ success: true, token, user, loyaltyBalance: loyalty.balance, isNewUser });
  } catch (error) { next(error); }
});

// ─── POST /api/auth/refresh — Refresh access token ───────────────────────────
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.status(401).json({ success: false, error: 'No refresh token provided' });

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'fallback-refresh-key-for-dev', (err, decoded) => {
      if (err) return res.status(403).json({ success: false, error: 'Invalid or expired refresh token' });

      // Generate new access token
      const token = jwt.sign(
        { userId: decoded.userId, phone: decoded.phone, role: decoded.role },
        process.env.JWT_SECRET || 'fallback-secret-key-for-dev',
        { expiresIn: '15m' }
      );

      res.json({ success: true, token });
    });
  } catch (error) { next(error); }
});

// ─── POST /api/auth/logout — Logout and clear cookie ─────────────────────────
router.post('/logout', async (req, res, next) => {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) { next(error); }
});

export default router;

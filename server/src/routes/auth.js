import { Router } from 'express';
import { body } from 'express-validator';
import { User, Address, Loyalty, LoyaltyHistory } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = Router();

// ─── GET /api/auth/me — Get current user ─────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
  res.json({ success: true, user: req.dbUser });
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

// ─── POST /api/auth/sync — Create/sync user after Firebase login ─────────────
router.post('/sync', authenticate, async (req, res, next) => {
  try {
    const user = req.dbUser;
    const { name, email } = req.body;

    let updated = false;
    if (name && !user.name) { user.name = name; updated = true; }
    if (email && !user.email) { user.email = email; updated = true; }
    if (updated) await user.save();

    // Ensure loyalty record exists
    let loyalty = await Loyalty.findOne({ where: { userId: user.id } });
    if (!loyalty) {
      loyalty = await Loyalty.create({ userId: user.id, balance: 200 });
      await LoyaltyHistory.create({
        loyaltyId: loyalty.id,
        type: 'earned',
        points: 200,
        description: 'Welcome bonus',
        date: new Date()
      });
    }

    // Refresh user to get full object for response
    await user.reload();
    res.json({ success: true, user, loyaltyBalance: loyalty.balance });
  } catch (error) { next(error); }
});

export default router;

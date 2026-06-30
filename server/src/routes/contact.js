import { Router } from 'express';
import { body } from 'express-validator';
import { ContactMessage } from '../models/index.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { sendContactNotification } from '../services/emailService.js';

const router = Router();

// ─── POST /api/contact — Submit contact form ────────────────────────────────
router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('message').trim().notEmpty().withMessage('Message is required'),
], validate, async (req, res, next) => {
  try {
    const msg = await ContactMessage.create(req.body);

    // Send notification email (non-blocking)
    sendContactNotification(req.body).catch(console.error);

    res.status(201).json({ success: true, message: 'Message sent successfully' });
  } catch (error) { next(error); }
});

// ─── GET /api/contact — List messages (admin) ───────────────────────────────
router.get('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const messages = await ContactMessage.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ success: true, messages });
  } catch (error) { next(error); }
});

// ─── PUT /api/contact/:id/read — Mark as read (admin) ───────────────────────
router.put('/:id/read', authenticate, requireAdmin, async (req, res, next) => {
  try {
    await ContactMessage.update({ isRead: true }, { where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) { next(error); }
});

export default router;

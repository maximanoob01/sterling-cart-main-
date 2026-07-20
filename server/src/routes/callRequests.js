import express from 'express';
import { body } from 'express-validator';
import { CallRequest } from '../models/index.js';
import validate from '../middleware/validate.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { sendCallConfirmation } from '../services/emailService.js';

const router = express.Router();

// ─── POST /api/call-requests — Create a new call request (Public) ────────────
router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('preferredDate').isISO8601().withMessage('Valid date is required'),
  body('timeSlot').isIn(['11:00 AM - 2:00 PM', '2:00 PM - 5:00 PM', '5:00 PM - 8:00 PM']).withMessage('Invalid time slot'),
], validate, async (req, res, next) => {
  try {
    const { name, phone, email, preferredDate, timeSlot, message } = req.body;

    // Optional: Validate that preferredDate is not a Sunday and not in the past
    const dateObj = new Date(preferredDate);
    if (dateObj.getDay() === 0) {
      return res.status(400).json({ success: false, error: 'Sundays are not available for calls' });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateObj < today) {
      return res.status(400).json({ success: false, error: 'Cannot book a past date' });
    }

    const request = await CallRequest.create({
      name, phone, email, preferredDate, timeSlot, message
    });

    // WhatsApp Mock for Admin Notification
    console.log(`\n[WHATSAPP MOCK] To Admin: New Call Request from ${name} (${phone}). Date: ${preferredDate}, Slot: ${timeSlot}. Message: ${message || 'N/A'}\n`);

    res.status(201).json({ success: true, request });
  } catch (error) {
    next(error);
  }
});

// ─── GET /api/admin/call-requests — Fetch all requests (Admin) ───────────────
router.get('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { status } = req.query;
    const whereClause = status && status !== 'All' ? { status } : {};
    
    const requests = await CallRequest.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });
    
    res.json({ success: true, requests });
  } catch (error) {
    next(error);
  }
});

// ─── PUT /api/admin/call-requests/:id — Update request (Admin) ───────────────
router.put('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, finalTime, preferredDate, adminNotes } = req.body;

    const request = await CallRequest.findByPk(id);
    if (!request) return res.status(404).json({ success: false, error: 'Call request not found' });

    // Track old status for mock notification
    const oldStatus = request.status;
    const dateChanged = preferredDate && preferredDate !== request.preferredDate;

    await request.update({
      status: status || request.status,
      finalTime: finalTime || request.finalTime,
      preferredDate: preferredDate || request.preferredDate,
      adminNotes: adminNotes !== undefined ? adminNotes : request.adminNotes,
      confirmedAt: status === 'Confirmed' && oldStatus !== 'Confirmed' ? new Date() : request.confirmedAt
    });

    // WhatsApp Mocks to Customer
    if (status === 'Confirmed' && (oldStatus !== 'Confirmed' || dateChanged)) {
      console.log(`\n[WHATSAPP MOCK] To ${request.phone}: Hi ${request.name}, your personalized consultation has been confirmed for ${request.preferredDate} at ${request.finalTime || request.timeSlot}. We'll call you shortly. Thank you!\n`);

      // Send confirmation email if customer provided one
      if (request.email) {
        sendCallConfirmation({
          name:          request.name,
          email:         request.email,
          preferredDate: request.preferredDate,
          finalTime:     request.finalTime,
          timeSlot:      request.timeSlot,
        }).catch(err => console.error('[EMAIL] Call confirmation failed:', err.message));
      }
    } else if (status === 'Cancelled' && oldStatus !== 'Cancelled') {
      console.log(`\n[WHATSAPP MOCK] To ${request.phone}: Hi ${request.name}, unfortunately your consultation request for ${request.preferredDate} has been cancelled. Please contact us for more info.\n`);
    }

    res.json({ success: true, request });
  } catch (error) {
    next(error);
  }
});

export default router;

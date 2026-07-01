import { Router } from 'express';
import crypto from 'crypto';
import { Order, OrderItem } from '../models/index.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import customUpload from '../middleware/customUpload.js';

const router = Router();
const SESSION_DURATION_MS = 5 * 60 * 1000; // 5 minutes

// ─── POST /api/custom-orders/:orderId/reject ───────────────────────────
// Admin rejects a design, generates a token.
router.post('/:orderId/reject', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ success: false, error: 'Rejection reason is required' });
    }

    const order = await Order.findOne({ where: { orderId: req.params.orderId, isCustomCoin: true } });
    if (!order) {
      return res.status(404).json({ success: false, error: 'Custom order not found' });
    }

    // If order has already been resubmitted once, second rejection cancels and refunds
    if (order.resubmitCount >= 1) {
      let refundId = null;
      if (order.razorpayPaymentId && order.paymentStatus !== 'refunded') {
        try {
          const razorpay = new (await import('razorpay')).default({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
          });
          const refund = await razorpay.payments.refund(order.razorpayPaymentId, { speed: 'normal' });
          refundId = refund.id;
        } catch (err) {
          console.error('Razorpay refund error:', err);
          return res.status(500).json({ success: false, error: 'Failed to process Razorpay refund' });
        }
      }

      await order.update({
        orderStatus: 'Cancelled',
        paymentStatus: 'refunded',
        rejectionReason: reason
      });

      return res.json({
        success: true,
        refunded: true,
        message: 'Order cancelled and refunded due to multiple rejections.'
      });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');

    await order.update({
      orderStatus: 'Rejected',
      rejectionReason: reason,
      resubmitToken: token,
      resubmitTokenStartedAt: null // reset it so timer starts on click
    });

    res.json({
      success: true,
      token,
      resubmitUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/order/${order.orderId}/resubmit/${token}`
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/custom-orders/:orderId/approve ──────────────────────────
// Admin approves a design
router.post('/:orderId/approve', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const order = await Order.findOne({ where: { orderId: req.params.orderId, isCustomCoin: true } });
    if (!order) {
      return res.status(404).json({ success: false, error: 'Custom order not found' });
    }

    await order.update({
      orderStatus: 'Engraving',
      rejectionReason: null,
      resubmitToken: null,
      resubmitTokenStartedAt: null
    });

    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/custom-orders/resubmit/:orderId/:token ───────────────────
// Public endpoint for customer to fetch session
router.get('/resubmit/:orderId/:token', async (req, res, next) => {
  try {
    const { orderId, token } = req.params;
    
    const order = await Order.findOne({ 
      where: { orderId, resubmitToken: token, orderStatus: 'Rejected' },
      include: [{ model: OrderItem, as: 'items' }]
    });

    if (!order) {
      return res.status(401).json({ success: false, error: 'Invalid or expired link' });
    }

    const now = new Date();

    // If session hasn't started, start it
    if (!order.resubmitTokenStartedAt) {
      order.resubmitTokenStartedAt = now;
      await order.save();
    }

    const startedAt = new Date(order.resubmitTokenStartedAt).getTime();
    const expiresAt = startedAt + SESSION_DURATION_MS;

    if (now.getTime() > expiresAt) {
      // Session expired
      return res.status(401).json({ success: false, error: 'Session expired' });
    }

    res.json({
      success: true,
      order: {
        orderId: order.orderId,
        rejectionReason: order.rejectionReason,
        expiresAt,
      }
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/custom-orders/resubmit/:orderId/:token ──────────────────
// Public endpoint for customer to upload new design
router.post('/resubmit/:orderId/:token', (req, res, next) => {
  // Use multer middleware
  customUpload.single('designFile')(req, res, async (err) => {
    if (err) return res.status(400).json({ success: false, error: err.message });
    
    try {
      const { orderId, token } = req.params;
      
      const order = await Order.findOne({ 
        where: { orderId, resubmitToken: token, orderStatus: 'Rejected' },
        include: [{ model: OrderItem, as: 'items' }]
      });

      if (!order) {
        return res.status(401).json({ success: false, error: 'Invalid or expired link' });
      }

      if (!order.resubmitTokenStartedAt) {
        return res.status(400).json({ success: false, error: 'Session not started properly' });
      }

      const startedAt = new Date(order.resubmitTokenStartedAt).getTime();
      if (Date.now() > startedAt + SESSION_DURATION_MS) {
        return res.status(401).json({ success: false, error: 'Session expired' });
      }

      if (!req.file) {
        return res.status(400).json({ success: false, error: 'Design file is required' });
      }

      const filePath = `/uploads/custom-coins/${req.file.filename}`;

      // Update the custom coin order item with the new file path in engravingText or image
      // Assuming the first item that is a coin receives the engraving update.
      const customItem = order.items.find(i => i.name.toLowerCase().includes('coin') || i.engravingText);
      if (customItem) {
        await customItem.update({ engravingText: `Custom Design: ${req.file.filename}` });
      }

      await order.update({
        orderStatus: 'Pending Approval',
        rejectionReason: null,
        resubmitToken: null,
        resubmitTokenStartedAt: null,
        resubmitCount: order.resubmitCount + 1
      });

      res.json({ success: true, message: 'Design resubmitted successfully' });
    } catch (dbErr) {
      next(dbErr);
    }
  });
});

export default router;

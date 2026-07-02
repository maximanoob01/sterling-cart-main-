import express from 'express';
import { Order, OrderTimeline } from '../models/index.js';

const router = express.Router();

// ─── POST /api/webhooks/shiprocket ──────────────────────────────────────────
// Handles Shiprocket status updates
router.post('/shiprocket', async (req, res, next) => {
  try {
    const payload = req.body;
    const awbCode = payload.awb;
    const newStatus = payload.current_status;

    if (!awbCode || !newStatus) {
      return res.status(400).json({ success: false, message: 'Missing awb or status' });
    }

    const order = await Order.findOne({ where: { awbCode } });
    if (!order) {
      // Ignore if order not found
      return res.status(200).json({ success: true, message: 'Order not found, ignored' });
    }

    // Map Shiprocket status to our OrderStatus
    let mappedStatus = order.orderStatus;
    const srStatus = newStatus.toUpperCase();

    if (['PICKED UP', 'IN TRANSIT'].includes(srStatus)) {
      mappedStatus = 'Shipped';
    } else if (['OUT FOR DELIVERY'].includes(srStatus)) {
      mappedStatus = 'Out for Delivery';
    } else if (['DELIVERED'].includes(srStatus)) {
      mappedStatus = 'Delivered';
    } else if (['CANCELED', 'RTO INITIATED', 'RTO DELIVERED'].includes(srStatus)) {
      mappedStatus = 'Cancelled';
    }

    if (mappedStatus !== order.orderStatus) {
      await order.update({ orderStatus: mappedStatus });

      // Update OrderTimeline
      const timelineEntry = await OrderTimeline.findOne({
        where: { orderId: order.id, status: mappedStatus }
      });
      if (timelineEntry && !timelineEntry.completed) {
        await timelineEntry.update({ completed: true, date: new Date() });
      }
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Shiprocket Webhook Error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

export default router;

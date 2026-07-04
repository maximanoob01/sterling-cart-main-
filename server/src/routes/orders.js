import { Router } from 'express';
import { body } from 'express-validator';
import { Op } from 'sequelize';
import { Order, OrderItem, OrderTimeline, Product, Loyalty, LoyaltyHistory, Coupon, GiftCard, GiftCardTransaction, Notification, sequelize } from '../models/index.js';
import { authenticate, requireAdmin, optionalAuth } from '../middleware/auth.js';
import crypto from 'crypto';
import validate from '../middleware/validate.js';
import { sendOrderConfirmation } from '../services/emailService.js';
import shiprocketService from '../services/shiprocketService.js';
import {
  generateOrderId, getItemPrice, FREE_DELIVERY_THRESHOLD,
  DELIVERY_FEE, COD_FEE, GIFT_WRAP_FEE, LOYALTY_EARN_RATE, LOYALTY_REDEEM_CAP,
} from '../config/constants.js';

const router = Router();

const TIMELINE_ORDER = {
  'Order Placed': 1,
  'Confirmed': 2,
  'Engraving': 3,
  'Packed': 4,
  'Shipped': 5,
  'Out for Delivery': 6,
  'Delivered': 7,
  'Cancelled': 99
};

// ─── POST /api/orders — Create order ─────────────────────────────────────────
router.post('/', optionalAuth, [
  body('form.fullName').trim().notEmpty(),
  body('form.email').isEmail(),
  body('form.phone').trim().notEmpty(),
  body('form.addressLine1').trim().notEmpty(),
  body('form.city').trim().notEmpty(),
  body('form.state').trim().notEmpty(),
  body('form.pincode').matches(/^\d{6}$/),
  body('items').isArray({ min: 1 }),
  body('paymentMethod').trim().notEmpty(),
], validate, async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { form, items, paymentMethod, razorpayPaymentId, razorpayOrderId,
      isGiftWrapped, giftNote, couponCode, loyaltyPointsUsed, giftCardCode } = req.body;

    const orderId = generateOrderId();
    let subtotal = 0;
    const orderItems = [];

    // 1. Process items and check stock
    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction: t });
      if (!product) continue;

      const unitPrice = getItemPrice(product);
      subtotal += unitPrice * item.qty;

      orderItems.push({
        productId: product.id,
        name: product.name,
        qty: item.qty,
        price: unitPrice,
        size: item.size || null,
        engravingText: item.engravingText || '',
        image: product.images?.[0] || '',
      });

      if (product.stockQty > 0) {
        await product.update({
          stockQty: Math.max(0, product.stockQty - item.qty),
          inStock: (product.stockQty - item.qty) > 0
        }, { transaction: t });
      }
    }

    // 2. Apply Coupon
    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ where: { code: couponCode.toUpperCase() }, transaction: t });
      if (coupon) {
        const validity = coupon.isValid(subtotal);
        if (validity.valid) {
          discount = coupon.calculateDiscount(subtotal);
          await coupon.increment('usedCount', { by: 1, transaction: t });
        }
      }
    }

    const shipping = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
    const codFee = paymentMethod === 'cod' ? COD_FEE : 0;
    const giftWrapFee = isGiftWrapped ? GIFT_WRAP_FEE : 0;

    // 3. Apply Loyalty
    let loyaltyDiscount = 0;
    let loyaltyAccount = null;
    if (req.dbUser && loyaltyPointsUsed > 0) {
      loyaltyAccount = await Loyalty.findOne({ where: { userId: req.dbUser.id }, transaction: t });
      if (loyaltyAccount) {
        const maxRedeem = Math.min(loyaltyAccount.balance, Math.floor((subtotal + codFee + giftWrapFee) * LOYALTY_REDEEM_CAP));
        loyaltyDiscount = Math.min(loyaltyPointsUsed, maxRedeem);
      }
    }

    const subtotalBeforeGC = Math.max(0, subtotal - discount + shipping + codFee + giftWrapFee - loyaltyDiscount);

    // 3.5 Apply Gift Card
    let giftCardDiscount = 0;
    let giftCardRecord = null;
    if (giftCardCode) {
      const cleanCode = giftCardCode.trim().toUpperCase();
      const codeHash = crypto.createHash('sha256').update(cleanCode).digest('hex');
      giftCardRecord = await GiftCard.findOne({ where: { codeHash }, transaction: t });
      if (giftCardRecord && giftCardRecord.remainingBalance > 0 && giftCardRecord.status !== 'expired') {
        giftCardDiscount = Math.min(giftCardRecord.remainingBalance, subtotalBeforeGC);
      }
    }

    const totalAmount = Math.max(0, subtotalBeforeGC - giftCardDiscount);
    const paymentStatus = paymentMethod === 'cod' ? 'pending' : (razorpayPaymentId ? 'paid' : 'pending');

    // 4. Create Order
    const order = await Order.create({
      orderId,
      userId: req.dbUser?.id || null,
      customerName: form.fullName,
      customerEmail: form.email,
      customerPhone: form.phone,
      shippingAddress: {
        fullName: form.fullName,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2 || '',
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        landmark: form.landmark || '',
      },
      subtotal,
      shipping,
      discount,
      gst: 0,
      codFee,
      giftWrapFee,
      loyaltyDiscount,
      giftCardDiscount,
      totalAmount,
      couponCode: couponCode || null,
      paymentMethod,
      razorpayOrderId: razorpayOrderId || null,
      razorpayPaymentId: razorpayPaymentId || null,
      paymentStatus,
      orderStatus: 'Confirmed',
      isGiftWrapped: isGiftWrapped || false,
      giftNote: giftNote || '',
    }, { transaction: t });

    // 5. Create Order Items
    await OrderItem.bulkCreate(
      orderItems.map(item => ({ ...item, orderId: order.id })),
      { transaction: t }
    );

    // 6. Create Timeline
    await OrderTimeline.bulkCreate([
      { orderId: order.id, status: 'Order Placed', date: new Date(), completed: true },
      { orderId: order.id, status: 'Order Confirmed', date: new Date(), completed: true },
      { orderId: order.id, status: 'Packed', completed: false },
      { orderId: order.id, status: 'Shipped', completed: false },
      { orderId: order.id, status: 'Out for Delivery', completed: false },
      { orderId: order.id, status: 'Delivered', completed: false },
    ], { transaction: t });

    // 6.5 Deduct Gift Card Balance
    if (giftCardDiscount > 0 && giftCardRecord) {
      const newBalance = giftCardRecord.remainingBalance - giftCardDiscount;
      await giftCardRecord.update({
        remainingBalance: newBalance,
        status: newBalance <= 0 ? 'exhausted' : 'partially_used'
      }, { transaction: t });

      await GiftCardTransaction.create({
        giftCardId: giftCardRecord.id,
        orderId: order.orderId,
        amountUsed: giftCardDiscount,
        balanceBefore: giftCardRecord.remainingBalance,
        balanceAfter: newBalance
      }, { transaction: t });
    }

    // 7. Loyalty transactions (Earn / Redeem)
    let earnedPoints = 0;
    if (req.dbUser) {
      if (!loyaltyAccount) {
        loyaltyAccount = await Loyalty.findOne({ where: { userId: req.dbUser.id }, transaction: t });
        if (!loyaltyAccount) {
          loyaltyAccount = await Loyalty.create({ userId: req.dbUser.id, balance: 0 }, { transaction: t });
        }
      }

      if (loyaltyDiscount > 0) {
        await loyaltyAccount.decrement('balance', { by: loyaltyDiscount, transaction: t });
        await LoyaltyHistory.create({
          loyaltyId: loyaltyAccount.id,
          type: 'redeemed',
          points: loyaltyDiscount,
          description: `Redeemed on order #${orderId}`,
          orderId,
          date: new Date()
        }, { transaction: t });
      }

      earnedPoints = Math.floor(totalAmount * LOYALTY_EARN_RATE);
      if (earnedPoints > 0) {
        await LoyaltyHistory.create({
          loyaltyId: loyaltyAccount.id,
          type: 'earned',
          points: earnedPoints,
          status: 'pending',
          description: `Earned from order #${orderId}`,
          orderId,
          date: new Date()
        }, { transaction: t });
      }
    }

    // 8. Create Admin Notification
    await Notification.create({
      type: 'order',
      title: 'New order received',
      message: `${orderId} · ${form.fullName} — ₹${totalAmount.toLocaleString('en-IN')}`,
      link: `/admin/orders?search=${orderId}`,
    }, { transaction: t });

    await t.commit();

    // Send confirmation email (non-blocking)
    sendOrderConfirmation(orderId, form, orderItems, totalAmount).catch(console.error);

    // Create Shiprocket Order and Generate AWB (non-blocking)
    (async () => {
      try {
        // Create custom order in Shiprocket
        const srOrder = await shiprocketService.createCustomOrder(order, items);
        if (srOrder && srOrder.order_id && srOrder.shipment_id) {
          // Generate AWB immediately
          const awbRes = await shiprocketService.generateAWB(srOrder.shipment_id);

          let awbCode = null;
          let courierName = null;
          let routingCode = null;

          if (awbRes && awbRes.response && awbRes.response.data) {
            awbCode = awbRes.response.data.awb_code;
            courierName = awbRes.response.data.courier_name;
            routingCode = awbRes.response.data.routing_code;
          }

          // Update our DB with Shiprocket details
          await order.update({
            shiprocketOrderId: srOrder.order_id.toString(),
            shiprocketShipmentId: srOrder.shipment_id.toString(),
            awbCode: awbCode,
            courierName: courierName || order.courierName,
            trackingUrl: awbCode ? `https://shiprocket.co/tracking/${awbCode}` : null
          });
        }
      } catch (err) {
        console.error('Shiprocket Integration Error during Order Creation:', err.message);
      }
    })();

    res.status(201).json({
      success: true,
      order: { orderId: order.orderId, totalAmount: order.totalAmount, orderStatus: order.orderStatus },
      earnedPoints,
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
});

// ─── GET /api/orders — Get user's orders ─────────────────────────────────────
router.get('/', authenticate, async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      where: {
        [Op.or]: [
          { userId: req.dbUser.id },
          { customerPhone: { [Op.like]: `%${req.dbUser.phone.slice(-10)}%` } }
        ]
      },
      order: [['createdAt', 'DESC']],
      include: [{ model: OrderItem, as: 'items' }, { model: OrderTimeline, as: 'timeline' }]
    });

    orders.forEach(o => {
      if (o.timeline) {
        o.timeline.sort((a, b) => (TIMELINE_ORDER[a.status] || 99) - (TIMELINE_ORDER[b.status] || 99));
      }
    });

    res.json({ success: true, orders });
  } catch (error) { next(error); }
});

// ─── GET /api/orders/track/:orderId — Public order tracking ──────────────────
router.get('/track/:orderId', async (req, res, next) => {
  try {
    const order = await Order.findOne({
      where: { orderId: req.params.orderId },
      include: [{ model: OrderItem, as: 'items' }, { model: OrderTimeline, as: 'timeline' }]
    });
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    if (order.timeline) {
      order.timeline.sort((a, b) => (TIMELINE_ORDER[a.status] || 99) - (TIMELINE_ORDER[b.status] || 99));
    }

    res.json({
      success: true,
      order: {
        orderId: order.orderId,
        orderStatus: order.orderStatus,
        timeline: order.timeline,
        items: order.items.map(i => ({ name: i.name, qty: i.qty, price: i.price, size: i.size, image: i.image })),
        totalAmount: order.totalAmount,
        trackingNumber: order.trackingNumber,
        courierName: order.courierName,
        createdAt: order.createdAt,
        shippingAddress: order.shippingAddress,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail,
        paymentMethod: order.paymentMethod,
        paymentId: order.paymentId,
        paymentStatus: order.paymentStatus,
      },
    });
  } catch (error) { next(error); }
});

// ─── GET /api/orders/:orderId — Single order detail ──────────────────────────
router.get('/:orderId', authenticate, async (req, res, next) => {
  try {
    const order = await Order.findOne({
      where: { orderId: req.params.orderId },
      include: [{ model: OrderItem, as: 'items' }, { model: OrderTimeline, as: 'timeline' }]
    });
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    // Check ownership or admin
    if (req.dbUser.role !== 'admin' && order.userId !== req.dbUser.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    if (order.timeline) {
      order.timeline.sort((a, b) => (TIMELINE_ORDER[a.status] || 99) - (TIMELINE_ORDER[b.status] || 99));
    }

    res.json({ success: true, order });
  } catch (error) { next(error); }
});

// ─── Admin: GET /api/orders/admin/all — All orders ───────────────────────────
router.get('/admin/all', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const where = {};
    if (status) where.orderStatus = status;

    const limitNum = Number(limit);
    const offset = (Number(page) - 1) * limitNum;

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: limitNum,
      offset,
      include: [{ model: OrderItem, as: 'items' }, { model: OrderTimeline, as: 'timeline' }]
    });

    orders.forEach(o => {
      if (o.timeline) {
        o.timeline.sort((a, b) => (TIMELINE_ORDER[a.status] || 99) - (TIMELINE_ORDER[b.status] || 99));
      }
    });

    res.json({
      success: true,
      orders,
      pagination: { page: Number(page), total: count, pages: Math.ceil(count / limitNum) }
    });
  } catch (error) { next(error); }
});

// ─── Admin: POST /api/orders/:orderId/email-invoice — Send invoice via email/WhatsApp ────────────
router.post('/:orderId/email-invoice', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { pdfBase64 } = req.body;
    if (!pdfBase64) return res.status(400).json({ success: false, error: 'pdfBase64 is required' });

    const order = await Order.findOne({
      where: { orderId: req.params.orderId },
      include: [{ model: OrderItem, as: 'items' }]
    });
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    const { sendInvoiceEmail } = await import('../services/emailService.js');
    const result = await sendInvoiceEmail(
      order,
      order.items || [],
      pdfBase64
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// ─── Admin: PUT /api/orders/:orderId/status — Update order status ────────────
router.put('/:orderId/status', authenticate, requireAdmin, [
  body('status').isIn(['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled']),
], validate, async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const order = await Order.findOne({
      where: { orderId: req.params.orderId },
      include: [{ model: OrderTimeline, as: 'timeline' }],
      transaction: t
    });
    if (!order) {
      await t.rollback();
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const { status, trackingNumber, courierName } = req.body;

    const updates = { orderStatus: status };
    if (trackingNumber) updates.trackingNumber = trackingNumber;
    if (courierName) updates.courierName = courierName;
    if (status === 'Cancelled') {
      updates.paymentStatus = 'refunded';

      await Notification.create({
        type: 'alert',
        title: 'Order cancelled',
        message: `${order.orderId} · ${order.customerName} cancelled their order`,
        link: `/admin/orders?search=${order.orderId}`,
      }, { transaction: t });

      if (order.userId) {
        const loyaltyAccount = await Loyalty.findOne({ where: { userId: order.userId }, transaction: t });
        if (loyaltyAccount) {
          const redeemedRow = await LoyaltyHistory.findOne({
            where: { loyaltyId: loyaltyAccount.id, orderId: order.orderId, type: 'redeemed', status: 'confirmed' },
            transaction: t
          });
          if (redeemedRow) {
            await redeemedRow.update({ status: 'cancelled' }, { transaction: t });
            await loyaltyAccount.increment('balance', { by: redeemedRow.points, transaction: t });
          }

          const pendingPointsRow = await LoyaltyHistory.findOne({
            where: { loyaltyId: loyaltyAccount.id, orderId: order.orderId, type: 'earned', status: 'pending' },
            transaction: t
          });
          if (pendingPointsRow) {
            await pendingPointsRow.update({ status: 'cancelled' }, { transaction: t });
          }
        }
      }
    }

    if (status === 'Delivered' && order.orderStatus !== 'Delivered') {
      updates.paymentStatus = 'paid';

      await Notification.create({
        type: 'order',
        title: 'Order delivered',
        message: `${order.orderId} · ${order.customerName} marked as delivered`,
        link: `/admin/orders?search=${order.orderId}`,
      }, { transaction: t });

      // Confirm pending Royal Points
      if (order.userId) {
        const loyaltyAccount = await Loyalty.findOne({ where: { userId: order.userId }, transaction: t });
        if (loyaltyAccount) {
          const pendingPointsRow = await LoyaltyHistory.findOne({
            where: { loyaltyId: loyaltyAccount.id, orderId: order.orderId, type: 'earned', status: 'pending' },
            transaction: t
          });
          if (pendingPointsRow) {
            const expiresAt = new Date();
            expiresAt.setMonth(expiresAt.getMonth() + 12);
            await pendingPointsRow.update({ status: 'confirmed', expiresAt }, { transaction: t });
            await loyaltyAccount.increment('balance', { by: pendingPointsRow.points, transaction: t });

            // Mock WhatsApp message
            console.log(`\n[WHATSAPP MOCK] To User ${order.userId}: "You earned ${pendingPointsRow.points} Sterling Coins! Balance: ${loyaltyAccount.balance + pendingPointsRow.points} coins"\n`);
          }
        }
      }
    }

    await order.update(updates, { transaction: t });

    // Update timelines
    const statusOrder = ['Order Placed', 'Order Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
    const currentIdx = statusOrder.indexOf(status === 'Confirmed' ? 'Order Confirmed' : status);

    for (const timelineEntry of order.timeline) {
      const entryIdx = statusOrder.indexOf(timelineEntry.status);
      if (entryIdx <= currentIdx && !timelineEntry.completed) {
        await timelineEntry.update({ completed: true, date: new Date() }, { transaction: t });
      }
    }

    await t.commit();
    await order.reload({ include: [{ model: OrderItem, as: 'items' }, { model: OrderTimeline, as: 'timeline' }] });
    if (order.timeline) {
      order.timeline.sort((a, b) => (TIMELINE_ORDER[a.status] || 99) - (TIMELINE_ORDER[b.status] || 99));
    }
    res.json({ success: true, order });
  } catch (error) {
    await t.rollback();
    next(error);
  }
});

export default router;

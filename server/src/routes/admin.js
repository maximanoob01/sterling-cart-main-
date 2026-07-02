import { Router } from 'express';
import { Op } from 'sequelize';
import { body } from 'express-validator';
import { sequelize, Order, User, Product, ContactMessage } from '../models/index.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { getSiteSettings, updateSiteSettings } from '../services/siteSettings.js';

const router = Router();

const phoneKey = (phone = '') => phone.replace(/\D/g, '').slice(-10);
const normalizePhone = (phone = '') => {
  const trimmed = phone.trim();
  if (trimmed.startsWith('+')) return trimmed.replace(/\s/g, '');
  return `+91${trimmed.replace(/\D/g, '')}`;
};

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

router.get('/settings', async (req, res, next) => {
  try {
    const settings = await getSiteSettings();
    res.json({
      success: true,
      settings,
      admin: {
        userId: req.dbUser.adminLoginId || req.dbUser.name || 'Admin User',
        phone: req.dbUser.phone || '',
        email: req.dbUser.email || '',
      },
    });
  } catch (error) { next(error); }
});

router.put('/settings/admin-profile', [
  body('userId').trim().isLength({ min: 3 }).withMessage('Admin user ID must be at least 3 characters'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
], validate, async (req, res, next) => {
  try {
    const { userId } = req.body;
    const phone = normalizePhone(req.body.phone);

    const existingUserId = await User.findOne({
      where: {
        adminLoginId: userId,
        id: { [Op.ne]: req.dbUser.id },
      },
    });
    if (existingUserId) {
      return res.status(400).json({ success: false, error: 'This admin user ID is already in use' });
    }

    const existingPhone = await User.findOne({
      where: {
        phone,
        id: { [Op.ne]: req.dbUser.id },
      },
    });
    if (existingPhone) {
      return res.status(400).json({ success: false, error: 'This phone number is already in use' });
    }

    req.dbUser.adminLoginId = userId;
    req.dbUser.name = userId;
    req.dbUser.phone = phone;
    await req.dbUser.save();

    res.json({
      success: true,
      admin: {
        userId: req.dbUser.adminLoginId,
        phone: req.dbUser.phone,
        email: req.dbUser.email || '',
      },
    });
  } catch (error) { next(error); }
});

router.put('/settings/site', [
  body('heroImageUrl').optional({ checkFalsy: true }).trim().isString(),
], validate, async (req, res, next) => {
  try {
    const settings = await updateSiteSettings({
      heroImageUrl: req.body.heroImageUrl || '',
    });
    res.json({ success: true, settings });
  } catch (error) { next(error); }
});

// ─── GET /api/admin/dashboard — Aggregated stats ─────────────────────────────
router.get('/dashboard', async (req, res, next) => {
  try {
    const [
      totalOrders,
      totalRevenueData,
      totalCustomers,
      totalProducts,
      unreadMessages,
      recentOrders,
      ordersByStatusData,
      monthlyRevenueData,
    ] = await Promise.all([
      Order.count(),
      Order.sum('totalAmount'),
      User.count({ where: { role: 'user' } }),
      Product.count(),
      ContactMessage.count({ where: { isRead: false } }),
      Order.findAll({ order: [['createdAt', 'DESC']], limit: 10 }),
      Order.findAll({
        attributes: ['orderStatus', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['orderStatus']
      }),
      sequelize.query(`
        SELECT TO_CHAR("createdAt", 'YYYY-MM') as month, SUM("totalAmount") as revenue, COUNT(*) as count
        FROM orders
        GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
        ORDER BY month ASC
        LIMIT 12
      `, { type: sequelize.QueryTypes.SELECT })
    ]);

    const ordersByStatus = ordersByStatusData.reduce((acc, row) => {
      acc[row.orderStatus] = parseInt(row.dataValues.count, 10);
      return acc;
    }, {});

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenueData || 0,
        totalCustomers,
        totalProducts,
        unreadMessages,
      },
      recentOrders,
      ordersByStatus,
      monthlyRevenue: monthlyRevenueData,
    });
  } catch (error) { next(error); }
});

// ─── GET /api/admin/customers — List all customers ───────────────────────────
router.get('/customers', async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const where = { role: { [Op.ne]: 'admin' } };

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    const limitNum = Number(limit);
    const offset = (Number(page) - 1) * limitNum;

    // Use a subquery/include to get total spent per user
    const { rows: customers } = await User.findAndCountAll({
      where,
      distinct: true,
      order: [['createdAt', 'DESC']],
      limit: limitNum,
      offset,
      include: [{
        model: Order,
        as: 'orders',
        attributes: ['id', 'totalAmount']
      }]
    });

    const result = customers.map(c => {
      const plain = c.get({ plain: true });
      delete plain.orders;
      return { ...plain, orderCount: 0, totalSpent: 0 };
    });

    const customerMap = new Map(result.map(c => [phoneKey(c.phone), c]));
    const orderCustomers = await Order.findAll({
      attributes: ['customerName', 'customerEmail', 'customerPhone', 'totalAmount', 'orderStatus', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    orderCustomers.forEach(order => {
      const plain = order.get({ plain: true });
      const key = phoneKey(plain.customerPhone);
      if (!key) return;

      const existing = customerMap.get(key);
      if (existing) {
        existing.orderCount += 1;
        if (plain.orderStatus !== 'Cancelled') existing.totalSpent += plain.totalAmount || 0;
        return;
      }

      const orderOnlyCustomer = {
        id: `order-customer-${key}`,
        name: plain.customerName || 'Customer',
        email: plain.customerEmail || '',
        phone: plain.customerPhone || '',
        role: 'user',
        isActive: true,
        createdAt: plain.createdAt,
        updatedAt: plain.createdAt,
        orderCount: 1,
        totalSpent: plain.orderStatus !== 'Cancelled' ? plain.totalAmount || 0 : 0,
      };
      customerMap.set(key, orderOnlyCustomer);
      result.push(orderOnlyCustomer);
    });

    res.json({
      success: true,
      customers: result,
      pagination: { page: Number(page), total: result.length, pages: Math.ceil(result.length / limitNum) }
    });
  } catch (error) { next(error); }
});

export default router;

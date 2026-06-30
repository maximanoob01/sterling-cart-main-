import { Router } from 'express';
import { Op } from 'sequelize';
import { sequelize, Order, User, Product, ContactMessage } from '../models/index.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

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
    const where = { role: 'user' };

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const limitNum = Number(limit);
    const offset = (Number(page) - 1) * limitNum;

    // Use a subquery/include to get total spent per user
    const { count, rows: customers } = await User.findAndCountAll({
      where,
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
      const orderCount = plain.orders?.length || 0;
      const totalSpent = plain.orders?.reduce((sum, o) => sum + o.totalAmount, 0) || 0;
      delete plain.orders;
      return { ...plain, orderCount, totalSpent };
    });

    res.json({
      success: true,
      customers: result,
      pagination: { page: Number(page), total: count, pages: Math.ceil(count / limitNum) }
    });
  } catch (error) { next(error); }
});

export default router;

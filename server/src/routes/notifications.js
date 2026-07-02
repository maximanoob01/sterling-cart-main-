import { Router } from 'express';
import { Notification } from '../models/index.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// GET /api/admin/notifications - Get all notifications for admin
router.get('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const notifications = await Notification.findAll({
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    res.json({ success: true, notifications });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/admin/notifications/:id/read - Mark single notification as read
router.patch('/:id/read', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByPk(id);
    if (!notification) {
      return res.status(404).json({ success: false, error: 'Notification not found' });
    }
    
    await notification.update({ read: true });
    res.json({ success: true, notification });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/admin/notifications/read-all - Mark all notifications as read
router.patch('/read-all', authenticate, requireAdmin, async (req, res, next) => {
  try {
    await Notification.update({ read: true }, { where: { read: false } });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
});

export default router;

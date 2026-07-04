import 'dotenv/config';
import process from 'node:process';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import path from 'path';

import connectDB from './config/db.js';
import { connectRedis } from './services/redisService.js';
import errorHandler from './middleware/errorHandler.js';
import { sequelize } from './models/index.js';
import { createHybridStore } from './utils/rateLimitStore.js';

// Route imports
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import couponRoutes from './routes/coupons.js';
import loyaltyRoutes from './routes/loyalty.js';
import wishlistRoutes from './routes/wishlist.js';
import contactRoutes from './routes/contact.js';
import adminRoutes from './routes/admin.js';
import paymentRoutes from './routes/payments.js';
import uploadRoutes from './routes/upload.js';
import customOrderRoutes from './routes/customOrders.js';
import giftCardRoutes from './routes/giftCards.js';
import settingsRoutes from './routes/settings.js';
import notificationRoutes from './routes/notifications.js';
import webhooksRoutes from './routes/webhooks.js';
import callRequestRoutes from './routes/callRequests.js';
import cartRoutes from './routes/cart.js';

// Init Cron Jobs
import './jobs/cronJobs.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting (Global, but auth routes will have stricter ones later)
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  message: { success: false, error: 'Too many requests, please try again later' },
  store: createHybridStore(),
});
app.use('/api/', limiter);

// Serve uploaded images statically
const uploadDir = process.env.UPLOAD_DIR || './uploads';
app.use('/uploads', express.static(path.resolve(uploadDir)));

const addColumnIfMissing = async (tableName, columnName, dataType) => {
  try {
    await sequelize.query(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${dataType};`);
  } catch (error) {
    if (!error.message?.includes('duplicate column name')) throw error;
  }
};

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/transaction', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/custom-orders', customOrderRoutes);
app.use('/api/gift-cards', giftCardRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin/notifications', notificationRoutes);
app.use('/api/admin/call-requests', callRequestRoutes); // Using same router, it handles GET/PUT inside
app.use('/api/call-requests', callRequestRoutes); // Public POST
app.use('/api/webhooks', webhooksRoutes);
app.use('/api/cart', cartRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Sterling Kart API is running (PostgreSQL)', timestamp: new Date().toISOString() });
});

// ─── Error Handler ───────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────────────────────
const startServer = async () => {
  await connectDB();
  await connectRedis();
  await sequelize.sync(); // Create tables if they don't exist
  await addColumnIfMissing('users', 'adminLoginId', 'VARCHAR(255)');

  app.listen(PORT, () => {
    console.log(`\n🚀 Sterling Kart API running on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
  });
};

startServer();

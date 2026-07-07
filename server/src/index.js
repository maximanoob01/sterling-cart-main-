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
import fs from 'fs/promises';
import { sequelize, Product } from './models/index.js';
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
import seoRoutes from './routes/seo.js';

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
    const dialect = sequelize.getDialect();
    const query = dialect === 'postgres'
      ? `ALTER TABLE "${tableName}" ADD COLUMN "${columnName}" ${dataType};`
      : `ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${dataType};`;
    await sequelize.query(query);
  } catch (error) {
    if (!error.message?.includes('duplicate column name') && !error.message?.includes('already exists')) throw error;
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
app.use('/', seoRoutes); // Root level for sitemap.xml and robots.txt

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Sterling Kart API is running (PostgreSQL)', timestamp: new Date().toISOString() });
});

// ─── Frontend Integration (Serve React SPA) ──────────────────────────────────
const frontendDistPath = path.join(process.cwd(), "../dist");
app.use(express.static(frontendDistPath));

app.get('*', async (req, res, next) => {
  if (
    req.originalUrl.startsWith('/api') ||
    req.originalUrl.startsWith('/uploads')
  ) {
    return next();
  }

  const indexPath = path.join(frontendDistPath, 'index.html');

  // Dynamic Open Graph tag injection for products (AEO & Social Sharing)
  if (req.originalUrl.startsWith('/product/')) {
    const idOrSlug = req.originalUrl.split('/')[2];
    if (idOrSlug) {
      try {
        let product = await Product.findOne({ where: { slug: idOrSlug } });
        if (!product && !isNaN(idOrSlug)) {
          product = await Product.findByPk(idOrSlug);
        }

        if (product) {
          let html = await fs.readFile(indexPath, 'utf-8');
          const title = `925 Sterling Silver ${product.name} | Sterling Kart`;
          const description = product.shortDescription || `Shop authentic ${product.name}. Crafted from premium 925 Sterling Silver.`;
          const image = product.images?.[0] || 'https://sterlingkart.in/giftcard.png';
          const url = `https://sterlingkart.in${req.originalUrl}`;
          
          html = html.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);
          html = html.replace(/<meta property="og:title" content="[^"]*" \/>/i, `<meta property="og:title" content="${title}" />`);
          html = html.replace(/<meta property="og:description" content="[^"]*" \/>/i, `<meta property="og:description" content="${description}" />`);
          html = html.replace(/<meta property="og:image" content="[^"]*" \/>/i, `<meta property="og:image" content="${image}" />`);
          html = html.replace(/<meta property="og:url" content="[^"]*" \/>/i, `<meta property="og:url" content="${url}" />`);
          
          return res.send(html);
        }
      } catch (err) {
        console.error('Error injecting OG tags:', err);
      }
    }
  }

  res.sendFile(indexPath);
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

startServer().catch((err) => {
  console.error("❌ Failed to start Sterling Kart:", err);
  process.exit(1);
});

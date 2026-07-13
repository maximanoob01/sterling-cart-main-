import { Router } from 'express';
import { body, query } from 'express-validator';
import { Op } from 'sequelize';
import { Product } from '../models/index.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import crypto from 'crypto';
import redisClient, { safeGet, safeSet, safeDel } from '../services/redisService.js';

const router = Router();

const clearProductCache = async (id, slug) => {
  if (id) await safeDel(`product:${id}`);
  if (slug) await safeDel(`product:${slug}`);
  
  if (redisClient.status === 'ready') {
    try {
      const listKeys = await redisClient.smembers('product_queries');
      if (listKeys && listKeys.length > 0) {
        await redisClient.del(...listKeys);
        await redisClient.del('product_queries');
      }
    } catch (err) {
      console.error('Error clearing product list cache', err);
    }
  }
};

// ─── GET /api/products — List products with filtering & pagination ───────────
router.get('/', async (req, res, next) => {
  try {
    const queryHash = crypto.createHash('md5').update(JSON.stringify(req.query)).digest('hex');
    const cacheKey = `products:list:${queryHash}`;
    const cachedData = await safeGet(cacheKey);
    if (cachedData) return res.json(cachedData);

    const {
      category, occasion, style, color, design, collection, stoneType,
      minPrice, maxPrice, badge, search, sort, page = 1, limit = 50,
      inStock,
    } = req.query;

    const where = {};

    if (category) where.category = category;
    if (occasion) where.occasion = occasion;
    if (style) where.style = style;
    if (color) where.color = color;
    if (design) where.design = design;
    if (collection) where.collection = collection;
    if (stoneType) where.stoneType = stoneType;
    if (badge) where.badge = badge;
    if (inStock === 'true') where.inStock = true;

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = Number(minPrice);
      if (maxPrice) where.price[Op.lte] = Number(maxPrice);
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { shortDescription: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Sorting
    let orderObj = [['createdAt', 'DESC']];
    switch (sort) {
      case 'price-asc': orderObj = [['price', 'ASC']]; break;
      case 'price-desc': orderObj = [['price', 'DESC']]; break;
      case 'rating': orderObj = [['rating', 'DESC']]; break;
      case 'newest': orderObj = [['createdAt', 'DESC']]; break;
      case 'name-asc': orderObj = [['name', 'ASC']]; break;
      case 'name-desc': orderObj = [['name', 'DESC']]; break;
    }

    const limitNum = Math.min(Math.max(Number(limit) || 50, 1), 200);
    const pageNum = Math.max(Number(page) || 1, 1);
    const offset = (pageNum - 1) * limitNum;
    
    const { count, rows: products } = await Product.findAndCountAll({
      where,
      order: orderObj,
      limit: limitNum,
      offset,
    });

    const responseData = {
      success: true,
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        pages: Math.ceil(count / limitNum),
      },
    };

    await safeSet(cacheKey, responseData, 21600); // 6 hours TTL
    if (redisClient.status === 'ready') {
      redisClient.sadd('product_queries', cacheKey).catch(console.error);
    }

    res.json(responseData);
  } catch (error) { next(error); }
});

// ─── GET /api/products/:idOrSlug — Get single product ────────────────────────
router.get('/:idOrSlug', async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const cacheKey = `product:${idOrSlug}`;
    const cachedProduct = await safeGet(cacheKey);
    if (cachedProduct) return res.json({ success: true, product: cachedProduct });

    let product;

    // Try by UUID first, then by slug
    if (idOrSlug.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)) {
      product = await Product.findByPk(idOrSlug);
    }
    if (!product) {
      product = await Product.findOne({ where: { slug: idOrSlug } });
    }

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    await safeSet(cacheKey, product, 21600); // 6 hours TTL
    res.json({ success: true, product });
  } catch (error) { next(error); }
});

// ─── POST /api/products — Create product (admin) ─────────────────────────────
router.post('/', authenticate, requireAdmin, [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('pricingType').optional().isIn(['fixed', 'weight']).withMessage('Invalid pricing type'),
  body('weightGrams').optional({ nullable: true }).isFloat({ min: 0 }),
  body('makingCharges').optional({ nullable: true }).isFloat({ min: 0 }),
  body('stockQty').optional().isInt({ min: 0 }),
], validate, async (req, res, next) => {
  try {
    const slug = req.body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const product = await Product.create({ ...req.body, slug });
    await clearProductCache(product.id, product.slug);
    res.status(201).json({ success: true, product });
  } catch (error) { next(error); }
});

// ─── PUT /api/products/:id — Update product (admin) ──────────────────────────
router.put('/:id', authenticate, requireAdmin, [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be non-negative'),
  body('pricingType').optional().isIn(['fixed', 'weight']).withMessage('Invalid pricing type'),
  body('weightGrams').optional({ nullable: true }).isFloat({ min: 0 }),
  body('makingCharges').optional({ nullable: true }).isFloat({ min: 0 }),
  body('stockQty').optional().isInt({ min: 0 }),
], validate, async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });

    await product.update(req.body);
    await clearProductCache(product.id, product.slug);
    res.json({ success: true, product });
  } catch (error) { next(error); }
});

// ─── DELETE /api/products/:id — Delete product (admin) ───────────────────────
router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });

    await product.destroy();
    await clearProductCache(product.id, product.slug);

    res.json({ success: true, message: 'Product deleted' });
  } catch (error) { next(error); }
});

export default router;

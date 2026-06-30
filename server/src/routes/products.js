import { Router } from 'express';
import { Op } from 'sequelize';
import { Product } from '../models/index.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// ─── GET /api/products — List products with filtering & pagination ───────────
router.get('/', async (req, res, next) => {
  try {
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

    const limitNum = Number(limit);
    const offset = (Number(page) - 1) * limitNum;
    
    const { count, rows: products } = await Product.findAndCountAll({
      where,
      order: orderObj,
      limit: limitNum,
      offset
    });

    res.json({
      success: true,
      products,
      pagination: {
        page: Number(page),
        limit: limitNum,
        total: count,
        pages: Math.ceil(count / limitNum),
      },
    });
  } catch (error) { next(error); }
});

// ─── GET /api/products/:idOrSlug — Get single product ────────────────────────
router.get('/:idOrSlug', async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
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

    res.json({ success: true, product });
  } catch (error) { next(error); }
});

// ─── POST /api/products — Create product (admin) ─────────────────────────────
router.post('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const slug = req.body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const product = await Product.create({ ...req.body, slug });
    res.status(201).json({ success: true, product });
  } catch (error) { next(error); }
});

// ─── PUT /api/products/:id — Update product (admin) ──────────────────────────
router.put('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });

    await product.update(req.body);
    res.json({ success: true, product });
  } catch (error) { next(error); }
});

// ─── DELETE /api/products/:id — Delete product (admin) ───────────────────────
router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const deleted = await Product.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ success: false, error: 'Product not found' });

    res.json({ success: true, message: 'Product deleted' });
  } catch (error) { next(error); }
});

export default router;

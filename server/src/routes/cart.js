import { Router } from 'express';
import { body } from 'express-validator';
import { Cart, CartItem, Product } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { safeGet, safeSet, safeDel } from '../services/redisService.js';

const router = Router();

const getCartWithItems = async (userId) => {
  // Check Redis Cache
  const cacheKey = `cart:${userId}`;
  const cached = await safeGet(cacheKey);
  if (cached) return cached;

  // Fallback to PostgreSQL
  let cart = await Cart.findOne({
    where: { userId },
    include: [{
      model: CartItem,
      as: 'items',
      include: [{ model: Product, attributes: ['id', 'name', 'slug', 'sku', 'price', 'mrp', 'images', 'category', 'pricingType', 'makingCharges', 'weightGrams', 'stockQty', 'inStock', 'badge'] }]
    }]
  });

  if (!cart) {
    cart = await Cart.create({ userId });
    cart.items = [];
  }

  // Set Cache
  // Format items for frontend
  const formattedCart = {
    ...cart.toJSON(),
    items: cart.items.map(item => {
      const prod = item.Product && item.Product.toJSON ? item.Product.toJSON() : item.Product;
      let images = prod.images || [];
      if (typeof images === 'string') {
        try { images = JSON.parse(images); } catch(e) {}
      }
      return {
        ...prod,
        images,
        cartItemId: item.id,
        id: prod.id,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        engravingText: item.engravingText,
        customDesignUrl: item.customDesignUrl
      };
    })
  };

  await safeSet(cacheKey, formattedCart, 3600); // 1 hour TTL
  return formattedCart;
};

// ─── GET /api/cart — Get user cart ───────────────────────────────────────────
router.get('/', authenticate, async (req, res, next) => {
  try {
    const cart = await getCartWithItems(req.dbUser.id);
    res.json({ success: true, cart });
  } catch (error) { next(error); }
});

// ─── POST /api/cart/sync — Merge LocalStorage Cart ───────────────────────────
router.post('/sync', authenticate, async (req, res, next) => {
  try {
    const { items = [] } = req.body;
    let cart = await Cart.findOne({ where: { userId: req.dbUser.id } });
    
    if (!cart) {
      cart = await Cart.create({ userId: req.dbUser.id });
    }

    // Merge Logic
    for (const item of items) {
      const { id: productId, quantity = 1, selectedSize = null, engravingText = null, customDesignUrl = null } = item;
      
      const existingItem = await CartItem.findOne({
        where: { cartId: cart.id, productId, selectedSize, engravingText, customDesignUrl }
      });

      if (existingItem) {
        existingItem.quantity += quantity;
        await existingItem.save();
      } else {
        await CartItem.create({
          cartId: cart.id,
          productId,
          quantity,
          selectedSize,
          engravingText,
          customDesignUrl
        });
      }
    }

    // Invalidate Cache
    await safeDel(`cart:${req.dbUser.id}`);

    const updatedCart = await getCartWithItems(req.dbUser.id);
    res.json({ success: true, cart: updatedCart });
  } catch (error) { next(error); }
});

// ─── POST /api/cart/items — Add/Update Item ──────────────────────────────────
router.post('/items', authenticate, [
  body('productId').isUUID().withMessage('Valid product ID required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], validate, async (req, res, next) => {
  try {
    const { productId, quantity, selectedSize = null, engravingText = null, customDesignUrl = null } = req.body;
    let cart = await Cart.findOne({ where: { userId: req.dbUser.id } });
    if (!cart) cart = await Cart.create({ userId: req.dbUser.id });

    const existingItem = await CartItem.findOne({
      where: { cartId: cart.id, productId, selectedSize, engravingText, customDesignUrl }
    });

    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();
    } else {
      await CartItem.create({
        cartId: cart.id,
        productId,
        quantity,
        selectedSize,
        engravingText,
        customDesignUrl
      });
    }

    await safeDel(`cart:${req.dbUser.id}`);
    const updatedCart = await getCartWithItems(req.dbUser.id);
    res.json({ success: true, cart: updatedCart });
  } catch (error) { next(error); }
});

// ─── PUT /api/cart/items/:itemId — Update Quantity ───────────────────────────
router.put('/items/:itemId', authenticate, [
  body('quantity').isInt({ min: 1 })
], validate, async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ where: { userId: req.dbUser.id } });
    if (!cart) return res.status(404).json({ success: false, error: 'Cart not found' });

    const item = await CartItem.findOne({ where: { id: req.params.itemId, cartId: cart.id } });
    if (!item) return res.status(404).json({ success: false, error: 'Item not found' });

    item.quantity = quantity;
    await item.save();

    await safeDel(`cart:${req.dbUser.id}`);
    const updatedCart = await getCartWithItems(req.dbUser.id);
    res.json({ success: true, cart: updatedCart });
  } catch (error) { next(error); }
});

// ─── DELETE /api/cart/items/:itemId — Remove Item ────────────────────────────
router.delete('/items/:itemId', authenticate, async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ where: { userId: req.dbUser.id } });
    if (!cart) return res.status(404).json({ success: false, error: 'Cart not found' });

    await CartItem.destroy({ where: { id: req.params.itemId, cartId: cart.id } });

    await safeDel(`cart:${req.dbUser.id}`);
    const updatedCart = await getCartWithItems(req.dbUser.id);
    res.json({ success: true, cart: updatedCart });
  } catch (error) { next(error); }
});

// ─── DELETE /api/cart — Clear Cart ───────────────────────────────────────────
router.delete('/', authenticate, async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ where: { userId: req.dbUser.id } });
    if (cart) {
      await CartItem.destroy({ where: { cartId: cart.id } });
      cart.couponCode = null;
      await cart.save();
    }
    
    await safeDel(`cart:${req.dbUser.id}`);
    const updatedCart = await getCartWithItems(req.dbUser.id);
    res.json({ success: true, cart: updatedCart });
  } catch (error) { next(error); }
});

export default router;

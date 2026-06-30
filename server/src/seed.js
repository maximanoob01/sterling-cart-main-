import 'dotenv/config';
import { sequelize, User, Product, Coupon } from './models/index.js';

const categories = ['rings', 'earrings', 'necklaces', 'bracelets', 'anklets', 'nose-pins', 'pendants', 'coins', 'chains', 'bangles', 'sets', 'mangalsutras', 'toe-rings', 'hair-accessories'];
const occasions = ['everyday', 'wedding', 'festivals', 'gifting', 'office'];
const stylesArr = ['minimalist', 'boho', 'traditional', 'statement'];
const colorsArr = ['silver', 'rose-gold', 'yellow-gold', 'beige', 'ruby-red', 'emerald-green'];
const designsArr = ['classic', 'contemporary', 'antique', 'geometric'];
const collectionsArr = ['everyday-essentials', 'the-wedding-collection', 'festive-glow'];
const stoneTypesArr = ['No Stone', 'Cubic Zirconia', 'Pearl', 'Turquoise', 'Onyx', 'Moonstone', 'Amethyst'];
const badges = ['Bestseller', 'New', 'Trending', ''];

const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const productNames = {
  rings: ['Plain Silver Band Ring', 'Floral CZ Ring', 'Moonstone Solitaire Ring', 'Twisted Rope Ring', 'Oxidized Statement Ring', 'Minimal Stacking Ring', 'Heart CZ Ring', 'Celtic Knot Ring'],
  earrings: ['Classic CZ Stud Earrings', 'Traditional Jhumka Earrings', 'Pearl Drop Earrings', 'Hoop Earrings', 'Oxidized Jhumka Earrings', 'CZ Chandelier Earrings', 'Minimal Bar Studs', 'Threader Earrings'],
  necklaces: ['Layered Chain Necklace', 'CZ Pendant Necklace', 'Pearl Choker Necklace', 'Oxidized Temple Necklace', 'Minimal Bar Necklace', 'Coin Charm Necklace', 'Mangalsutra Style Necklace', 'Moonstone Pendant Necklace'],
  bracelets: ['CZ Tennis Bracelet', 'Chain Link Bracelet', 'Charm Bracelet', 'Minimal Cuff Bracelet', 'Oxidized Bangle Bracelet', 'Pearl Strand Bracelet', 'Kada Style Bracelet', 'Infinity Bracelet'],
  anklets: ['Classic Chain Anklet', 'CZ Station Anklet', 'Ghungroo Anklet', 'Minimal Bar Anklet', 'Pearl Anklet', 'Oxidized Anklet'],
  'nose-pins': ['CZ Nose Pin', 'Pearl Nose Pin', 'Minimal Dot Nose Pin', 'Oxidized Nose Pin', 'Floral Nose Ring'],
  pendants: ['CZ Heart Pendant', 'Moonstone Pendant', 'Om Pendant', 'Initial Letter Pendant', 'Tree of Life Pendant', 'Evil Eye Pendant'],
  coins: ['Lakshmi Silver Coin (10g)', 'Ganesh Silver Coin (10g)', 'Lakshmi-Ganesh Coin (20g)', 'Plain Silver Coin (50g)'],
  chains: ['Box Chain', 'Rope Chain', 'Figaro Chain', 'Curb Chain', 'Snake Chain', 'Cable Chain'],
  bangles: ['Plain Silver Bangle', 'CZ Studded Bangle', 'Traditional Carved Bangle', 'Oxidized Bangle', 'Twisted Bangle', 'Kada Bangle'],
  sets: ['Necklace & Earring Set', 'Bridal Complete Set', 'Everyday Essentials Set', 'Pearl Set', 'CZ Cocktail Set'],
  mangalsutras: ['Classic Mangalsutra', 'Modern Short Mangalsutra', 'CZ Mangalsutra Pendant'],
  'toe-rings': ['Plain Toe Ring', 'CZ Toe Ring', 'Oxidized Toe Ring'],
  'hair-accessories': ['Silver Hair Pin', 'CZ Hair Clip', 'Juda Pin'],
};

const generateProducts = () => {
  const products = [];
  let id = 1;

  for (const category of categories) {
    const names = productNames[category] || [`${category} Product`];
    for (const name of names) {
      const isWeight = category === 'coins' || Math.random() < 0.2;
      const price = rand(499, 4999);
      
      products.push({
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        sku: `SC-${category.substring(0, 3).toUpperCase()}-${String(id).padStart(3, '0')}`,
        category,
        price,
        mrp: price + rand(200, 1000),
        pricingType: isWeight ? 'weight' : 'mrp',
        weightGrams: isWeight ? parseFloat((rand(2, 50) + Math.random()).toFixed(1)) : null,
        makingCharges: isWeight ? rand(150, 500) : null,
        description: `Beautiful ${name} crafted in pure 925 sterling silver.`,
        shortDescription: `${name} in 925 sterling silver.`,
        stoneType: pick(stoneTypesArr),
        images: [],
        rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
        reviewCount: rand(10, 500),
        badge: pick(badges),
        inStock: true,
        stockQty: rand(5, 100),
        sizes: category === 'rings' ? [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] : (category === 'bangles' ? [2.4, 2.6, 2.8, 2.10] : []),
        occasion: pick(occasions),
        style: pick(stylesArr),
        color: pick(colorsArr),
        design: pick(designsArr),
        collection: pick(collectionsArr),
        isNew: Math.random() < 0.3,
      });
      id++;
    }
  }
  return products;
};

const defaultCoupons = [
  { code: 'WELCOME10', type: 'percentage', discount: 10, minOrderValue: 999, maxDiscount: 500, isActive: true },
  { code: 'FESTIVE10', type: 'percentage', discount: 10, minOrderValue: 1499, maxDiscount: 750, isActive: true },
  { code: 'FLAT200', type: 'flat', discount: 200, minOrderValue: 1999, isActive: true },
];

const seed = async () => {
  try {
    console.log('🌱 Connecting to PostgreSQL and syncing tables...');
    await sequelize.authenticate();
    
    // Force true drops existing tables and recreates them
    await sequelize.sync({ force: true });
    
    console.log('✅ Tables created successfully');
    
    // Seed products
    const products = generateProducts();
    await Product.bulkCreate(products);
    console.log(`✅ Seeded ${products.length} products`);

    // Seed coupons
    await Coupon.bulkCreate(defaultCoupons);
    console.log(`✅ Seeded ${defaultCoupons.length} coupons`);

    // Create admin user
    await User.create({
      firebaseUid: 'admin-placeholder',
      name: 'Admin User',
      email: 'admin@sterlingkart.com',
      phone: '+919999900000',
      role: 'admin',
    });
    console.log('✅ Created admin user');

    console.log('\n🎉 Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();

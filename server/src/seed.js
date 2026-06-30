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

const getShortDescription = (category, name) => {
  const shortDescs = {
    rings: `A stunning ${name} perfect for everyday elegance.`,
    earrings: `Lightweight and elegant ${name} to elevate your style.`,
    necklaces: `Grace your neckline with this beautiful ${name}.`,
    bracelets: `A delicate ${name} to adorn your wrist.`,
    anklets: `Traditional yet modern ${name} with a comfortable fit.`,
    'nose-pins': `A subtle and glowing ${name} for a classic look.`,
    pendants: `Add a touch of charm with this unique ${name}.`,
    coins: `Pure 999 silver ${name}, ideal for gifting and pooja.`,
    chains: `Durable and shiny ${name}, perfect for layering.`,
    bangles: `Handcrafted ${name} for a timeless traditional look.`,
    sets: `A complete ${name} designed to make you shine.`,
    mangalsutras: `A beautiful ${name} symbolizing eternal love.`,
    'toe-rings': `Comfortable and adjustable ${name} for everyday wear.`,
    'hair-accessories': `Secure and stylish ${name} to complete your hairdo.`
  };
  return shortDescs[category] || `Premium ${name} crafted in pure 925 sterling silver.`;
};

const getLongDescription = (category, name) => {
  const base = `Experience the unmatched brilliance of our ${name}. Carefully handcrafted by expert artisans, this piece embodies the perfect harmony between traditional craftsmanship and contemporary design. `;
  
  const longDescs = {
    rings: base + `Made from premium 925 sterling silver, it features a comfortable fit and a high-polish finish that resists tarnishing. Whether worn as a statement piece or stacked with your favorites, it promises to be a cherished addition to your jewelry collection.`,
    earrings: base + `Designed for both comfort and elegance, these earrings feature secure push-back closures. They are lightweight enough for daily wear yet striking enough for special occasions, adding a touch of timeless sophistication to any outfit.`,
    necklaces: base + `This necklace drapes beautifully along the collarbone, featuring a sturdy clasp and an adjustable chain length. It is hypoallergenic, ensuring comfortable wear throughout the day while catching the light from every angle.`,
    bracelets: base + `Featuring a robust yet delicate link structure, this bracelet offers both durability and style. It is equipped with a secure lobster clasp and an adjustable extender to ensure the perfect fit for any wrist size.`,
    coins: `This ${name} is minted with 999 pure silver, ensuring the highest level of purity and authenticity. It comes in a tamper-proof protective casing, making it an auspicious choice for investments, festivals, or gifting to loved ones.`
  };
  
  return longDescs[category] || (base + `Crafted with hypoallergenic 925 sterling silver, this piece is gentle on sensitive skin. It comes beautifully packaged in our signature Sterling Kart box, making it ready for gifting or a perfect treat for yourself.`);
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
        description: getLongDescription(category, name),
        shortDescription: getShortDescription(category, name),
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

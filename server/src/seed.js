import 'dotenv/config';
import { sequelize, User, Product, Coupon } from './models/index.js';

import fs from 'fs';
import vm from 'vm';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const extractProducts = () => {
  const filePath = path.join(__dirname, '../../src/data/products.js');
  let code = fs.readFileSync(filePath, 'utf-8');
  
  // Strip out imports and convert exports to normal consts
  code = code.replace(/import\s+.*?\s+from\s+['"].*?['"];/g, '');
  code = code.replace(/export\s+const\s+/g, 'const ');
  code += '\n\nproducts;';
  
  const context = vm.createContext({
    ringImg: '', earringImg: '', necklaceImg: '', braceletImg: '', ankletImg: '', pendantImg: '', nosepinImg: '', chainImg: '', setImg: '', bangleImg: '',
    catImg1: '', catImg2: '', catImg3: '', catImg4: '', catImg5: '', catImg6: '', catImg7: '', catImg8: '', catImg9: '', catImg10: '',
    lakshmiCoinImg: '', ganeshCoinImg: '', lakshmiGaneshCoinImg: '', plainCoinImg: ''
  });
  
  const products = vm.runInContext(code, context);
  
  // Remove integer IDs so Sequelize generates UUIDs, and clear images array (frontend handles fallback)
  return products.map(({ id, images, sku, ...rest }, index) => ({
    ...rest,
    sku: sku || `SC-FB-${String(index).padStart(4, '0')}`,
    images: []
  }));
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
    const products = extractProducts();
    await Product.bulkCreate(products);
    console.log(`✅ Seeded ${products.length} products from src/data/products.js`);

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

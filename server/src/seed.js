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
    
    // Use alter instead of force to prevent dropping tables
    await sequelize.sync({ alter: true });
    
    console.log('✅ Tables created/updated successfully');
    
    // Seed products safely
    const products = extractProducts();
    await Product.bulkCreate(products, { ignoreDuplicates: true });
    console.log(`✅ Seeded ${products.length} products from src/data/products.js`);

    // Seed coupons safely
    await Coupon.bulkCreate(defaultCoupons, { ignoreDuplicates: true });
    console.log(`✅ Seeded ${defaultCoupons.length} coupons`);

    // Create admin user safely
    await User.findOrCreate({
      where: { email: 'admin@sterlingkart.com' },
      defaults: {
        name: 'Admin User',
        phone: '+919999900000',
        role: 'admin',
      }
    });
    console.log('✅ Created admin user');

    // Flush Redis Cache so new products appear immediately
    try {
      const { default: redisClient } = await import('./services/redisService.js');
      if (redisClient.status === 'ready') {
        await redisClient.flushall();
        console.log('✅ Cleared Redis cache');
      }
    } catch (e) {
      console.log('⚠️ Could not clear Redis cache, it might be disabled');
    }

    console.log('\n🎉 Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();

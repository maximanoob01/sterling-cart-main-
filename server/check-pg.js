import dotenv from 'dotenv';
dotenv.config();
import { sequelize, Cart, CartItem, Product } from './src/models/index.js';

async function check() {
  await sequelize.authenticate();
  console.log('Connected to PG');
  const cart = await Cart.findOne({
    include: [{
      model: CartItem,
      as: 'items',
      include: [Product]
    }]
  });
  if (cart && cart.items.length) {
    cart.items.forEach(item => {
      console.log(`Product ${item.Product.name}:`);
      console.log(`  images:`, item.Product.images);
      console.log(`  typeof images:`, typeof item.Product.images);
      console.log(`  is array:`, Array.isArray(item.Product.images));
    });
  } else {
    console.log('No cart or items found');
  }
  process.exit(0);
}
check().catch(console.error);

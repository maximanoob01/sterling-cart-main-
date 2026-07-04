import { sequelize, Cart, CartItem, Product } from './server/src/models/index.js';

async function check() {
  await sequelize.authenticate();
  const cart = await Cart.findOne({
    include: [{
      model: CartItem,
      as: 'items',
      include: [Product]
    }]
  });
  if (cart) {
    cart.items.forEach(item => {
      console.log(`Product ${item.Product.name}:`);
      console.log(`  images (raw):`, item.Product.dataValues.images);
      console.log(`  typeof images:`, typeof item.Product.dataValues.images);
    });
  } else {
    console.log('No cart found');
  }
  process.exit(0);
}
check().catch(console.error);

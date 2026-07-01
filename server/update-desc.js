import 'dotenv/config';
import { sequelize, Product } from './src/models/index.js';

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

async function updateDescriptions() {
  await sequelize.authenticate();
  const products = await Product.findAll();
  console.log(`Found ${products.length} products to update`);
  
  for (const product of products) {
    await product.update({
      description: getLongDescription(product.category, product.name),
      shortDescription: getShortDescription(product.category, product.name)
    });
  }
  
  console.log('Descriptions updated successfully');
  process.exit(0);
}

updateDescriptions();

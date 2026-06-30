const fs = require('fs');
let code = fs.readFileSync('src/data/products.js', 'utf8');

// 1. Update categories
if (!code.includes('mangalsutras')) {
  code = code.replace(
    /{ id: 'sets', name: 'Sets', icon: '🎁', image: catImg10 },/,
    `{ id: 'sets', name: 'Sets', icon: '🎁', image: catImg10 },
  { id: 'mangalsutras', name: 'Mangalsutras', icon: '📿', image: catImg3 },
  { id: 'toe-rings', name: 'Toe Rings', icon: '🦶', image: catImg1 },
  { id: 'hair-accessories', name: 'Hair Accessories', icon: '✨', image: catImg2 },`
  );
}

// 2. Add new exported arrays
if (!code.includes('export const colors')) {
  const newExports = `
export const colors = [
  { id: 'silver', name: 'Silver', hex: '#E8E8E8' },
  { id: 'rose-gold', name: 'Rose Gold', hex: '#B76E79' },
  { id: 'yellow-gold', name: 'Yellow Gold', hex: '#D4AF37' },
  { id: 'beige', name: 'Beige', hex: '#F5F5DC' },
  { id: 'ruby-red', name: 'Ruby Red', hex: '#9B111E' },
  { id: 'emerald-green', name: 'Emerald Green', hex: '#50C878' },
];

export const designs = [
  { id: 'classic', name: 'Classic' },
  { id: 'contemporary', name: 'Contemporary' },
  { id: 'antique', name: 'Antique' },
  { id: 'geometric', name: 'Geometric' },
];

export const collections = [
  { id: 'everyday-essentials', name: 'Everyday Essentials' },
  { id: 'the-wedding-collection', name: 'The Wedding Collection' },
  { id: 'festive-glow', name: 'Festive Glow' },
];
`;
  code = code.replace(/export const products = \[/, newExports + '\nexport const products = [');
}

// 3. Add fields to products
const colorsList = ['silver', 'rose-gold', 'yellow-gold', 'beige', 'ruby-red', 'emerald-green'];
const designsList = ['classic', 'contemporary', 'antique', 'geometric'];
const collectionsList = ['everyday-essentials', 'the-wedding-collection', 'festive-glow'];

let productIndex = 0;
// Only replace if not already replaced
if (!code.includes('color: \'silver\'')) {
  code = code.replace(/style:\s*'([^']+)',/g, (match, p1) => {
    productIndex++;
    const c = colorsList[productIndex % colorsList.length];
    const d = designsList[productIndex % designsList.length];
    const col = collectionsList[productIndex % collectionsList.length];
    return `style: '${p1}',\n    color: '${c}',\n    design: '${d}',\n    collection: '${col}',`;
  });
}

fs.writeFileSync('src/data/products.js', code);
console.log('Successfully updated products.js');

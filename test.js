import fs from 'fs';
import vm from 'vm';

let code = fs.readFileSync('src/data/products.js', 'utf-8');
code = code.replace(/import\s+.*?\s+from\s+['"].*?['"];/g, '');
code = code.replace(/export\s+const\s+/g, 'const ');
code += '\n\nproducts;';

const context = vm.createContext({
  ringImg: '', earringImg: '', necklaceImg: '', braceletImg: '', ankletImg: '', pendantImg: '', nosepinImg: '', chainImg: '', setImg: '', bangleImg: '',
  catImg1: '', catImg2: '', catImg3: '', catImg4: '', catImg5: '', catImg6: '', catImg7: '', catImg8: '', catImg9: '', catImg10: '',
  lakshmiCoinImg: '', ganeshCoinImg: '', lakshmiGaneshCoinImg: '', plainCoinImg: ''
});

const products = vm.runInContext(code, context);
const missingSku = products.filter(p => !p.sku);
console.log('Missing SKU count:', missingSku.length);
if (missingSku.length > 0) {
  console.log(missingSku[0].name);
}

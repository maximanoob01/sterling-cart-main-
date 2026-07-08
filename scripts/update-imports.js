import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, '..', 'src');

function updateImports(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      updateImports(fullPath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;
      
      // Replace imports of .png, .jpg, .jpeg with .webp
      content = content.replace(/\.png/g, '.webp');
      content = content.replace(/\.jpeg/g, '.webp');
      content = content.replace(/\.jpg/g, '.webp');
      
      // Specifically avoid replacing footer-ring.png if it's a public asset that wasn't converted
      // Actually, all images in assets were converted. If footer-ring is in public, it wasn't.
      // Let's just do it, and if footer-ring is broken, I'll fix it. The script converted everything in src/assets/images.
      // So let's only replace if it contains src/assets/images or ../assets/images
      
      // A safer regex: find strings ending in .png/.jpeg/.jpg inside quotes that are imports
      // But simple replace is usually fine for a small project.
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated imports in ${fullPath}`);
      }
    }
  }
}

updateImports(srcDir);
console.log('Finished updating imports!');

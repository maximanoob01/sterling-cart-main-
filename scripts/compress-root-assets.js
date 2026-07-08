import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dir = path.join(__dirname, '..', 'src', 'assets');

async function processImages() {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    if (file.endsWith('.png') || file.endsWith('.jpeg') || file.endsWith('.jpg')) {
      const filePath = path.join(dir, file);
      const parsed = path.parse(filePath);
      const outPath = path.join(dir, `${parsed.name}.webp`);

      try {
        await sharp(filePath)
          .webp({ quality: 75, effort: 6 })
          .toFile(outPath);
          
        fs.unlinkSync(filePath);
        console.log(`Converted ${file} -> ${parsed.name}.webp`);
      } catch (err) {
        console.error(`Error processing ${file}:`, err.message);
      }
    }
  }
}

processImages();

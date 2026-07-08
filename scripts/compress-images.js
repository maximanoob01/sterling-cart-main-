import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dir = path.join(__dirname, '..', 'src', 'assets', 'images');

async function processImages() {
  const files = fs.readdirSync(dir);
  let totalSaved = 0;

  for (const file of files) {
    if (file.endsWith('.png') || file.endsWith('.jpeg') || file.endsWith('.jpg')) {
      const filePath = path.join(dir, file);
      const parsed = path.parse(filePath);
      const outPath = path.join(dir, `${parsed.name}.webp`);

      try {
        const inputStats = fs.statSync(filePath);
        const originalSize = inputStats.size;

        await sharp(filePath)
          .webp({ quality: 75, effort: 6 })
          .toFile(outPath);

        const outStats = fs.statSync(outPath);
        const newSize = outStats.size;

        const saved = originalSize - newSize;
        totalSaved += saved;

        console.log(`Converted ${file} -> ${parsed.name}.webp (Saved ${(saved / 1024 / 1024).toFixed(2)} MB)`);
        
        // Remove old file to clean up space
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error(`Error processing ${file}:`, err.message);
      }
    }
  }

  console.log(`\nTotal space saved: ${(totalSaved / 1024 / 1024).toFixed(2)} MB!`);
}

processImages();

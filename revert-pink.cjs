const fs = require('fs');
const path = require('path');

const srcDir = 'E:/cafe websites/sterling cart main/src';

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Revert forceful replacements back to utility classes
      content = content.replace(/bg-\[#E87CA5\]/g, 'bg-pink-50');
      
      // Revert any remaining injected hot pink back to light pink
      content = content.replace(/#E87CA5/gi, '#FFF0F5');
      
      // In index.css, if we accidentally turned pink-100 to FFF0F5, we can manually fix index.css later, 
      // but let's just do it generally here.
      
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

walk(srcDir);
console.log('Reverted all hot pink back to original light pink.');

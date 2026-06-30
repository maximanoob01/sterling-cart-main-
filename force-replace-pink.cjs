const fs = require('fs');
const path = require('path');

const srcDir = 'E:/cafe websites/sterling cart main/src';

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Forcefully replace Tailwind classes
      content = content.replace(/bg-pink-50/g, 'bg-[#E87CA5]');
      content = content.replace(/bg-pink-100/g, 'bg-[#E87CA5]');
      
      // Replace any remaining light pink hex codes
      content = content.replace(/#FFF0F5/gi, '#E87CA5');
      content = content.replace(/#FFE4EE/gi, '#E87CA5');
      content = content.replace(/#FFF7F8/gi, '#E87CA5');
      content = content.replace(/#FFFAF9/gi, '#E87CA5');
      content = content.replace(/#FFF8FA/gi, '#E87CA5');
      content = content.replace(/#F2A8C2/gi, '#E87CA5');
      
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

walk(srcDir);
console.log('Force replaced all pink backgrounds to #E87CA5 directly in source files.');

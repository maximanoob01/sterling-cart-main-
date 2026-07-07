import { Router } from 'express';
import { Product } from '../models/index.js';

const router = Router();
const DOMAIN = process.env.CLIENT_URL || 'https://sterlingkart.in';

router.get('/robots.txt', (req, res) => {
  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api
Disallow: /dashboard

Sitemap: ${DOMAIN}/api/seo/sitemap.xml
`;
  res.header('Content-Type', 'text/plain');
  res.send(robots);
});

router.get('/sitemap.xml', async (req, res) => {
  try {
    const products = await Product.findAll({
      attributes: ['slug', 'updatedAt', 'id'],
      where: { inStock: true }
    });

    const staticPages = ['', '/shop', '/about', '/contact', '/legal', '/return-exchange', '/gifting'];
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static pages
    for (const page of staticPages) {
      xml += '  <url>\n';
      xml += `    <loc>${DOMAIN}${page}</loc>\n`;
      xml += `    <changefreq>${page === '' ? 'daily' : 'weekly'}</changefreq>\n`;
      xml += `    <priority>${page === '' ? '1.0' : '0.8'}</priority>\n`;
      xml += '  </url>\n';
    }

    // Add product pages
    for (const product of products) {
      const productLoc = product.slug ? product.slug : product.id;
      xml += '  <url>\n';
      xml += `    <loc>${DOMAIN}/product/${productLoc}</loc>\n`;
      xml += `    <lastmod>${new Date(product.updatedAt).toISOString()}</lastmod>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      xml += '  </url>\n';
    }

    xml += '</urlset>';

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

export default router;

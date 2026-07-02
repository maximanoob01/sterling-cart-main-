import { Router } from 'express';
import { getSiteSettings } from '../services/siteSettings.js';
import https from 'https';

const router = Router();

const GOLD_API_KEY = 'goldapi-4a0d6b2158fba080159fd070f6f839c4-io';

// Cache to avoid hammering the API (refresh every 5 minutes)
let silverPriceCache = null;
let silverPriceCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ─── GET /api/settings — Site settings ───────────────────────────────────────
router.get('/', async (_req, res, next) => {
  try {
    const settings = await getSiteSettings();
    res.json({ success: true, settings });
  } catch (error) { next(error); }
});

// ─── GET /api/settings/silver-price — Live silver price from goldapi.io ──────
router.get('/silver-price', async (_req, res) => {
  try {
    // Serve from cache if fresh
    if (silverPriceCache && Date.now() - silverPriceCacheTime < CACHE_TTL) {
      return res.json({ success: true, data: silverPriceCache, cached: true });
    }

    // Fetch live from goldapi.io
    const data = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'www.goldapi.io',
        path: '/api/XAG/INR',
        method: 'GET',
        headers: {
          'x-access-token': GOLD_API_KEY,
          'Content-Type': 'application/json',
        },
      };

      const req = https.request(options, (apiRes) => {
        let raw = '';
        apiRes.on('data', (chunk) => { raw += chunk; });
        apiRes.on('end', () => {
          try { resolve(JSON.parse(raw)); }
          catch (e) { reject(new Error('Invalid JSON from goldapi.io')); }
        });
      });

      req.on('error', reject);
      req.setTimeout(8000, () => { req.destroy(); reject(new Error('goldapi.io timeout')); });
      req.end();
    });

    // 925 silver is 92.5% purity of fine (24k/999) silver
    const PURITY_MULTIPLIER = 0.925;

    // Map fields to our format and apply the 925 purity multiplier
    const mapped = {
      today:        data.price_gram_24k * PURITY_MULTIPLIER,   
      previous:     data.prev_close_price ? ((data.prev_close_price / 31.1035) * PURITY_MULTIPLIER) : null,
      low:          data.low_price         ? ((data.low_price         / 31.1035) * PURITY_MULTIPLIER) : null,
      high:         data.high_price        ? ((data.high_price        / 31.1035) * PURITY_MULTIPLIER) : null,
      price_gram_24k: data.price_gram_24k,
      change:       data.ch ? (data.ch / 31.1035) * PURITY_MULTIPLIER : 0,
      changePercent: data.chp,
      ask:          data.ask * PURITY_MULTIPLIER,
      bid:          data.bid * PURITY_MULTIPLIER,
      updatedAt:    new Date().toISOString(),
    };

    silverPriceCache = mapped;
    silverPriceCacheTime = Date.now();

    res.json({ success: true, data: mapped, cached: false });
  } catch (err) {
    console.error('❌ Silver price API error:', err.message);
    // Return last cached data if available, else error
    if (silverPriceCache) {
      return res.json({ success: true, data: silverPriceCache, cached: true, stale: true });
    }
    res.status(503).json({ success: false, error: 'Silver price unavailable', message: err.message });
  }
});

export default router;

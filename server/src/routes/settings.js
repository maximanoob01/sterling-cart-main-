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

    // The API returns the International Spot Price. 
    // In India, physical silver includes ~15% import duty, 3% GST, and dealer premiums.
    // The Google search price (e.g. ₹245) is the retail physical price, not spot.
    // We apply an Indian Market Premium Multiplier (approx 24% total markup) to match local retail rates.
    const INDIAN_RETAIL_MULTIPLIER = 1.24;

    const applyMultiplier = (val) => val ? val * INDIAN_RETAIL_MULTIPLIER : null;

    // Map fields to our format
    const mapped = {
      today:        applyMultiplier(data.price_gram_24k),
      previous:     applyMultiplier(data.prev_close_price ? (data.prev_close_price / 31.1035) : null),
      low:          applyMultiplier(data.low_price         ? (data.low_price         / 31.1035) : null),
      high:         applyMultiplier(data.high_price        ? (data.high_price        / 31.1035) : null),
      price_gram_24k: applyMultiplier(data.price_gram_24k),
      change:       applyMultiplier(data.ch ? data.ch / 31.1035 : 0),
      changePercent: data.chp,
      ask:          applyMultiplier(data.ask),
      bid:          applyMultiplier(data.bid),
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

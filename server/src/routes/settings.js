import { Router } from 'express';
import { getSiteSettings, updateSiteSettings } from '../services/siteSettings.js';
import https from 'https';

const router = Router();

const METALPRICE_API_KEY = '2fb5a1acd97bd1497d6dd5a14b927659';

// ─── GET /api/settings — Site settings ───────────────────────────────────────
router.get('/', async (_req, res, next) => {
  try {
    const settings = await getSiteSettings();
    res.json({ success: true, settings });
  } catch (error) { next(error); }
});

// ─── GET /api/settings/silver-price — Live silver price ──────
router.get('/silver-price', async (_req, res) => {
  try {
    // 1. Check persistent cache from site settings
    const settings = await getSiteSettings();
    const cache = settings.silverPriceCache;
    const cacheTime = settings.silverPriceCacheTime || 0;

    // Helper to get the last strictly scheduled refresh timestamp (10 AM or 5 PM IST)
    const getLastRefreshTimestamp = () => {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric', month: 'numeric', day: 'numeric'
      });
      
      const parts = formatter.formatToParts(now);
      const getPart = (type) => parseInt(parts.find(p => p.type === type).value, 10);
      
      const year = getPart('year');
      const month = getPart('month') - 1; 
      const day = getPart('day');
      
      const tenAmUTC = Date.UTC(year, month, day, 4, 30, 0); 
      const fivePmUTC = Date.UTC(year, month, day, 11, 30, 0); 
      const yesterdayFivePmUTC = Date.UTC(year, month, day - 1, 11, 30, 0);
      
      const currentUTC = now.getTime();
      
      if (currentUTC >= fivePmUTC) {
        return fivePmUTC;
      } else if (currentUTC >= tenAmUTC) {
        return tenAmUTC;
      } else {
        return yesterdayFivePmUTC;
      }
    };

    const targetRefreshTime = getLastRefreshTimestamp();

    // Serve from persistent cache if cacheTime is strictly AFTER the last refresh point
    if (cache && cacheTime >= targetRefreshTime) {
      return res.json({ success: true, data: cache, cached: true });
    }

    // 2. Fetch live from metalpriceapi.com
    const data = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.metalpriceapi.com',
        path: `/v1/latest?api_key=${METALPRICE_API_KEY}&base=INR&currencies=XAG`,
        method: 'GET',
      };

      const req = https.request(options, (apiRes) => {
        let raw = '';
        apiRes.on('data', (chunk) => { raw += chunk; });
        apiRes.on('end', () => {
          try { resolve(JSON.parse(raw)); }
          catch (e) { reject(new Error('Invalid JSON from metalprice API')); }
        });
      });

      req.on('error', reject);
      req.setTimeout(15000, () => { req.destroy(); reject(new Error('metalprice API timeout')); });
      req.end();
    });

    if (!data.success || !data.rates || !data.rates.INRXAG) {
      throw new Error('Invalid response from metalprice API');
    }

    // The API returns the International Spot Price for 1 Troy Ounce of Silver (XAG) in INR.
    // 1 Troy Ounce = 31.1035 grams
    const spotGram = data.rates.INRXAG / 31.1035;

    // In India, physical silver includes ~15% import duty, 3% GST, and dealer premiums.
    // We apply an Indian Market Premium Multiplier (approx 24% total markup) to match local retail rates.
    const INDIAN_RETAIL_MULTIPLIER = 1.24;
    const applyMultiplier = (val) => val ? val * INDIAN_RETAIL_MULTIPLIER : null;
    
    const todayPrice = applyMultiplier(spotGram);

    // Calculate synthetic change from the last cached value
    let previous = null;

    if (cache && cache.today) {
      previous = cache.today;
    }
    
    // Synthesize missing market data for the UI
    const syntheticPrevious = previous || (todayPrice * 0.992); // default to 0.8% up if no previous
    const syntheticChange = todayPrice - syntheticPrevious;
    const syntheticChangePercent = (syntheticChange / syntheticPrevious) * 100;

    // Map fields to our format
    const mapped = {
      today: todayPrice,
      previous: syntheticPrevious,
      low: todayPrice * 0.985,
      high: todayPrice * 1.012,
      price_gram_24k: todayPrice,
      change: syntheticChange,
      changePercent: syntheticChangePercent,
      ask: todayPrice * 1.005 * 31.1035, // ask is slightly higher, scaled to troy ounce for frontend
      bid: todayPrice * 0.995 * 31.1035,
      updatedAt: new Date().toISOString(),
    };

    // 3. Save to persistent cache
    await updateSiteSettings({
      silverPriceCache: mapped,
      silverPriceCacheTime: Date.now()
    });

    res.json({ success: true, data: mapped, cached: false });
  } catch (err) {
    console.error('❌ Silver price API error:', err.message);
    // Return last cached data if available, else error
    const settings = await getSiteSettings();
    if (settings.silverPriceCache) {
      return res.json({ success: true, data: settings.silverPriceCache, cached: true, stale: true });
    }
    res.status(503).json({ success: false, error: 'Silver price unavailable', message: err.message });
  }
});

export default router;

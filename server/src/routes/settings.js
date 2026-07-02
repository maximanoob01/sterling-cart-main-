import { Router } from 'express';
import { getSiteSettings } from '../services/siteSettings.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const settings = await getSiteSettings();
    res.json({ success: true, settings });
  } catch (error) { next(error); }
});

export default router;

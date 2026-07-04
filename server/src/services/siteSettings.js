import fs from 'fs/promises';
import path from 'path';
import process from 'node:process';
import { safeGet, safeSet, safeDel } from './redisService.js';

const settingsPath = path.resolve(process.env.SITE_SETTINGS_PATH || './site-settings.json');

const DEFAULT_SETTINGS = {
  heroImageUrl: '',
};

export const getSiteSettings = async () => {
  const cacheKey = 'site:settings';
  const cached = await safeGet(cacheKey);
  if (cached) return cached;

  try {
    const raw = await fs.readFile(settingsPath, 'utf8');
    const settings = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    await safeSet(cacheKey, settings); // Cache with no TTL
    return settings;
  } catch (error) {
    if (error.code === 'ENOENT') return DEFAULT_SETTINGS;
    throw error;
  }
};

export const updateSiteSettings = async (updates) => {
  const current = await getSiteSettings();
  const next = { ...current, ...updates };
  await fs.writeFile(settingsPath, JSON.stringify(next, null, 2));
  await safeDel('site:settings'); // Invalidate cache instantly
  return next;
};

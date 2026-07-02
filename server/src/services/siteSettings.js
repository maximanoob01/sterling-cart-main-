import fs from 'fs/promises';
import path from 'path';
import process from 'node:process';

const settingsPath = path.resolve(process.env.SITE_SETTINGS_PATH || './site-settings.json');

const DEFAULT_SETTINGS = {
  heroImageUrl: '',
};

export const getSiteSettings = async () => {
  try {
    const raw = await fs.readFile(settingsPath, 'utf8');
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (error) {
    if (error.code === 'ENOENT') return DEFAULT_SETTINGS;
    throw error;
  }
};

export const updateSiteSettings = async (updates) => {
  const current = await getSiteSettings();
  const next = { ...current, ...updates };
  await fs.writeFile(settingsPath, JSON.stringify(next, null, 2));
  return next;
};

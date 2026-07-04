import { sequelize, SiteSetting } from './server/src/models/index.js';
import { clearCache } from './server/src/services/siteSettings.js';
import redisClient from './server/src/services/redisService.js';

async function updateSilver() {
  await sequelize.sync();
  let setting = await SiteSetting.findOne({ where: { key: 'silverPricePerGram' } });
  if (!setting) {
    setting = await SiteSetting.create({ key: 'silverPricePerGram', value: 200.5, type: 'number' });
  } else {
    setting.value = 200.5;
    await setting.save();
  }
  await clearCache();
  console.log('Silver price updated to 200.5');
  process.exit(0);
}
updateSilver().catch(console.error);

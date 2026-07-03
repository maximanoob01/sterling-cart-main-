import { sequelize } from './src/config/db.js';
async function test() {
  const [res] = await sequelize.query("SELECT sql FROM sqlite_master WHERE type='table' AND name='Orders'");
  console.log(res);
  process.exit(0);
}
test();

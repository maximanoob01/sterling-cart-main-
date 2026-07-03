import { sequelize } from './src/config/db.js';
async function test() {
  const [res] = await sequelize.query("SELECT name, sql FROM sqlite_master WHERE type='table'");
  console.log(JSON.stringify(res, null, 2));
  process.exit(0);
}
test();

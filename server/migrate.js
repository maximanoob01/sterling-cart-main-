import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: console.log,
});

async function run() {
  try {
    await sequelize.query(`ALTER TABLE orders ADD COLUMN giftCardDiscount FLOAT DEFAULT 0;`);
    console.log('Migration successful');
  } catch (e) {
    if (e.message.includes('duplicate column name')) {
      console.log('Column already exists');
    } else {
      console.error(e);
    }
  }
}

run();

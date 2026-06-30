import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: console.log,
});

async function run() {
  try {
    await sequelize.query(`ALTER TABLE loyalty_history ADD COLUMN status VARCHAR(255) DEFAULT 'confirmed';`);
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

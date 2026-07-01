import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false, // Set to console.log to see SQL queries
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ PostgreSQL connected`);
    
    // In production you typically use migrations (Umzug/Sequelize-CLI)
    // For this migration, we'll sync models in index.js or seed.js
  } catch (error) {
    console.error(`❌ PostgreSQL connection error: ${error.message}`);
    process.exit(1);
  }
};

export { sequelize };
export default connectDB;

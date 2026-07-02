import connectDB from './config/db.js';
import { sequelize } from './models/index.js';
import process from 'node:process';

const patchDB = async () => {
  await connectDB();
  
  const addColumnIfNotExists = async (tableName, columnName, dataType) => {
    try {
      await sequelize.query(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${dataType};`);
      console.log(`Successfully added ${columnName} to ${tableName}`);
    } catch (err) {
      if (err.message.includes('duplicate column name')) {
        console.log(`Column ${columnName} already exists in ${tableName}`);
      } else {
        console.error(`Error adding ${columnName}:`, err.message);
      }
    }
  };

  await addColumnIfNotExists('orders', 'isCustomCoin', 'TINYINT(1) DEFAULT 0');
  await addColumnIfNotExists('orders', 'rejectionReason', 'TEXT');
  await addColumnIfNotExists('orders', 'resubmitCount', 'INTEGER DEFAULT 0');
  await addColumnIfNotExists('orders', 'resubmitToken', 'VARCHAR(255)');
  await addColumnIfNotExists('orders', 'resubmitTokenStartedAt', 'DATETIME');
  await addColumnIfNotExists('users', 'adminLoginId', 'VARCHAR(255)');

  console.log('Database patching complete.');
  process.exit(0);
};

patchDB();

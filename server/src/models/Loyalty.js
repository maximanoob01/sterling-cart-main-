import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

class Loyalty extends Model {}

Loyalty.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true
  },
  balance: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: { min: 0 }
  }
}, {
  sequelize,
  modelName: 'Loyalty',
  tableName: 'loyalty_accounts',
  timestamps: true
});

export default Loyalty;

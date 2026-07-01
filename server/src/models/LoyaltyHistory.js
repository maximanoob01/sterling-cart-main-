import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

class LoyaltyHistory extends Model {}

LoyaltyHistory.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  loyaltyId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('earned', 'redeemed', 'expired'),
    allowNull: false
  },
  points: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled'),
    defaultValue: 'confirmed'
  },
  description: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  orderId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'LoyaltyHistory',
  tableName: 'loyalty_history',
  timestamps: false
});

export default LoyaltyHistory;

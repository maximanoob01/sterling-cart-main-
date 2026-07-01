import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const GiftCardTransaction = sequelize.define('GiftCardTransaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  giftCardId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  orderId: {
    type: DataTypes.STRING,
    allowNull: false, // The ID of the order where this was applied
  },
  amountUsed: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  balanceBefore: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  balanceAfter: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  usedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: true,
});

export default GiftCardTransaction;

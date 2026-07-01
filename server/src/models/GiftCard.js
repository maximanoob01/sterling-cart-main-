import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const GiftCard = sequelize.define('GiftCard', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  codeHash: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  maskedCode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  originalValue: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  remainingBalance: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'partially_used', 'exhausted', 'expired'),
    defaultValue: 'active',
  },
  purchasedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  }
}, {
  timestamps: true,
});

export default GiftCard;

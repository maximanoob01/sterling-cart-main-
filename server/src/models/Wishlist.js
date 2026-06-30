import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

class Wishlist extends Model {}

Wishlist.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Wishlist',
  tableName: 'wishlists',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['userId', 'productId'] }
  ]
});

export default Wishlist;

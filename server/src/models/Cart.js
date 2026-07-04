import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

class Cart extends Model {}

Cart.init({
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
  couponCode: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Cart',
  tableName: 'carts',
  timestamps: true
});

export default Cart;

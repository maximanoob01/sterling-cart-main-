import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

class CartItem extends Model {}

CartItem.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  cartId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: { min: 1 }
  },
  selectedSize: {
    type: DataTypes.STRING,
    allowNull: true
  },
  engravingText: {
    type: DataTypes.STRING,
    allowNull: true
  },
  customDesignUrl: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'CartItem',
  tableName: 'cart_items',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['cartId', 'productId', 'selectedSize', 'engravingText', 'customDesignUrl'],
      name: 'unique_cart_item_config'
    }
  ]
});

export default CartItem;

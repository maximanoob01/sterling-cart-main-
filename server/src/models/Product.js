import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

class Product extends Model {}

Product.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  mrp: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  pricingType: {
    type: DataTypes.ENUM('mrp', 'weight'),
    defaultValue: 'mrp'
  },
  weightGrams: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  makingCharges: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  shortDescription: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  metal: {
    type: DataTypes.STRING,
    defaultValue: '925 Sterling Silver'
  },
  stoneType: {
    type: DataTypes.STRING,
    defaultValue: 'No Stone'
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  reviewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  badge: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  inStock: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  stockQty: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  sizes: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  occasion: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  style: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  design: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  collection: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  isNew: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  sequelize,
  modelName: 'Product',
  tableName: 'products',
  timestamps: true,
  indexes: [
    { fields: ['category'] },
    { fields: ['slug'] }
  ]
});

export default Product;

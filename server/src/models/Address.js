import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

class Address extends Model {}

Address.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  addressLine1: {
    type: DataTypes.STRING,
    allowNull: false
  },
  addressLine2: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pincode: {
    type: DataTypes.STRING,
    allowNull: false
  },
  landmark: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  sequelize,
  modelName: 'Address',
  tableName: 'addresses',
  timestamps: true
});

export default Address;

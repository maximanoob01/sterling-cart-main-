import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

class ContactMessage extends Model {}

ContactMessage.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  orderId: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  sequelize,
  modelName: 'ContactMessage',
  tableName: 'contact_messages',
  timestamps: true
});

export default ContactMessage;

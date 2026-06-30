import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

class OrderTimeline extends Model {}

OrderTimeline.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  sequelize,
  modelName: 'OrderTimeline',
  tableName: 'order_timeline',
  timestamps: false
});

export default OrderTimeline;

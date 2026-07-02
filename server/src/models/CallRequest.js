import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

class CallRequest extends Model {}

CallRequest.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  preferredDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  timeSlot: {
    type: DataTypes.ENUM('11:00 AM - 2:00 PM', '2:00 PM - 5:00 PM', '5:00 PM - 8:00 PM'),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Confirmed', 'Completed', 'Cancelled'),
    defaultValue: 'Pending'
  },
  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  confirmedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  finalTime: {
    type: DataTypes.STRING, // Specifically for exact time assigned by Admin (e.g. 11:30 AM)
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'CallRequest',
  tableName: 'call_requests',
  timestamps: true
});

export default CallRequest;

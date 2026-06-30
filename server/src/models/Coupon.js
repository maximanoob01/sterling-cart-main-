import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

class Coupon extends Model {
  isValid(orderValue) {
    if (!this.isActive) return { valid: false, reason: 'Coupon is inactive' };
    if (this.expiresAt && new Date() > this.expiresAt) return { valid: false, reason: 'Coupon has expired' };
    if (this.usageLimit !== null && this.usedCount >= this.usageLimit) return { valid: false, reason: 'Coupon usage limit reached' };
    if (orderValue < this.minOrderValue) return { valid: false, reason: `Minimum order value is ₹${this.minOrderValue}` };
    return { valid: true };
  }

  calculateDiscount(orderValue) {
    let disc = this.type === 'percentage'
      ? Math.round(orderValue * (this.discount / 100))
      : this.discount;

    if (this.maxDiscount !== null) {
      disc = Math.min(disc, this.maxDiscount);
    }
    return disc;
  }
}

Coupon.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  type: {
    type: DataTypes.ENUM('percentage', 'flat'),
    allowNull: false
  },
  discount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  minOrderValue: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  maxDiscount: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  usageLimit: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  usedCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Coupon',
  tableName: 'coupons',
  timestamps: true
});

export default Coupon;

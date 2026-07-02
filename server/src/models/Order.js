import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/db.js';

class Order extends Model {}

Order.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  customerEmail: {
    type: DataTypes.STRING,
    allowNull: false
  },
  customerPhone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Store snapshot of address as JSON string (SQLite compatible)
  shippingAddress: {
    type: DataTypes.TEXT,
    allowNull: false,
    get() {
      const raw = this.getDataValue('shippingAddress');
      try { return typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { return raw; }
    },
    set(value) {
      this.setDataValue('shippingAddress', typeof value === 'string' ? value : JSON.stringify(value));
    }
  },
  subtotal: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  shipping: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  discount: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  gst: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  codFee: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  giftWrapFee: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  loyaltyDiscount: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  giftCardDiscount: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  couponCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false
  },
  razorpayOrderId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  razorpayPaymentId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
    defaultValue: 'pending'
  },
  orderStatus: {
    type: DataTypes.ENUM('Pending Approval', 'Engraving', 'Rejected', 'Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'),
    defaultValue: 'Pending'
  },
  trackingNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  courierName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isGiftWrapped: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  giftNote: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  isCustomCoin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  resubmitCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  resubmitToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resubmitTokenStartedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  shiprocketOrderId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  shiprocketShipmentId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  awbCode: {
    type: DataTypes.STRING,
    allowNull: true
  },
  shippingLabelUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  manifestUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  trackingUrl: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Order',
  tableName: 'orders',
  timestamps: true
});

export default Order;

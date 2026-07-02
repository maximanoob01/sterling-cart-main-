import User from './User.js';
import Address from './Address.js';
import Product from './Product.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';
import OrderTimeline from './OrderTimeline.js';
import Coupon from './Coupon.js';
import Loyalty from './Loyalty.js';
import LoyaltyHistory from './LoyaltyHistory.js';
import Wishlist from './Wishlist.js';
import ContactMessage from './ContactMessage.js';
import GiftCard from './GiftCard.js';
import GiftCardTransaction from './GiftCardTransaction.js';
import Notification from './Notification.js';
import CallRequest from './CallRequest.js';
import { sequelize } from '../config/db.js';

// User <-> Address (1:N)
User.hasMany(Address, { foreignKey: 'userId', as: 'addresses' });
Address.belongsTo(User, { foreignKey: 'userId' });

// Order <-> OrderItem (1:N)
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

// Order <-> OrderTimeline (1:N)
Order.hasMany(OrderTimeline, { foreignKey: 'orderId', as: 'timeline' });
OrderTimeline.belongsTo(Order, { foreignKey: 'orderId' });

// User <-> Order (1:N)
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId' });

// Product <-> OrderItem (1:N)
Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

// User <-> Loyalty (1:1)
User.hasOne(Loyalty, { foreignKey: 'userId', as: 'loyalty' });
Loyalty.belongsTo(User, { foreignKey: 'userId' });

// Loyalty <-> LoyaltyHistory (1:N)
Loyalty.hasMany(LoyaltyHistory, { foreignKey: 'loyaltyId', as: 'history' });
LoyaltyHistory.belongsTo(Loyalty, { foreignKey: 'loyaltyId' });

// User <-> Wishlist (1:N)
User.hasMany(Wishlist, { foreignKey: 'userId', as: 'wishlist' });
Wishlist.belongsTo(User, { foreignKey: 'userId' });

// Product <-> Wishlist (1:N)
Product.hasMany(Wishlist, { foreignKey: 'productId', as: 'wishlistedBy' });
Wishlist.belongsTo(Product, { foreignKey: 'productId' });

// User <-> GiftCard (1:N)
User.hasMany(GiftCard, { foreignKey: 'userId', as: 'giftCards' });
GiftCard.belongsTo(User, { foreignKey: 'userId' });

// GiftCard <-> GiftCardTransaction (1:N)
GiftCard.hasMany(GiftCardTransaction, { foreignKey: 'giftCardId', as: 'transactions' });
GiftCardTransaction.belongsTo(GiftCard, { foreignKey: 'giftCardId' });

export {
  sequelize,
  User,
  Address,
  Product,
  Order,
  OrderItem,
  OrderTimeline,
  Coupon,
  Loyalty,
  LoyaltyHistory,
  Wishlist,
  ContactMessage,
  GiftCard,
  GiftCardTransaction,
  Notification,
  CallRequest
};

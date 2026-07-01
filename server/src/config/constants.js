// Silver rate & pricing
export const SILVER_RATE_PER_GRAM = 102.4;
export const GST_RATE = 0.03; // 3%

// Shipping
export const FREE_DELIVERY_THRESHOLD = 2499;
export const DELIVERY_FEE = 69;
export const COD_FEE = 9;
export const GIFT_WRAP_FEE = 49;

// Loyalty
export const LOYALTY_EARN_RATE = 0.01;  // 1 point per ₹100 spent
export const LOYALTY_REDEEM_CAP = 0.10;  // max 10% of order value

// Pricing helpers
export const computeWeightBasedPrice = (weightGrams, makingCharges, silverRate = SILVER_RATE_PER_GRAM) => {
  return Math.round(silverRate * weightGrams + makingCharges);
};

export const getItemPrice = (item, silverRate = SILVER_RATE_PER_GRAM) => {
  let basePrice = item.price;
  if (item.pricingType === 'weight' && item.weightGrams != null && item.makingCharges != null) {
    basePrice = computeWeightBasedPrice(item.weightGrams, item.makingCharges, silverRate);
  }
  return Math.round(basePrice * (1 + GST_RATE));
};

export const generateOrderId = () => {
  const prefix = 'SC';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

import axios from 'axios';
import process from 'node:process';

const BASE_URL = 'https://apiv2.shiprocket.in/v1/payload';

let tokenCache = null;
let tokenExpiresAt = 0;

/**
 * Authenticates with Shiprocket and returns a bearer token.
 */
export const getToken = async () => {
  if (tokenCache && Date.now() < tokenExpiresAt) {
    return tokenCache;
  }

  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new Error('Shiprocket credentials are not configured.');
  }

  try {
    const res = await axios.post(`${BASE_URL}/user/login/email`, {
      email,
      password
    });

    tokenCache = res.data.token;
    // Token is usually valid for 10 days, we'll refresh every 24 hours just in case
    tokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
    return tokenCache;
  } catch (error) {
    console.error('Shiprocket Authentication Failed:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with Shiprocket');
  }
};

/**
 * Creates a custom order in Shiprocket.
 * Returns order_id, shipment_id, and other details.
 */
export const createCustomOrder = async (orderData, itemsData) => {
  const token = await getToken();

  // Calculate dimensions and weight (defaults for jewelry)
  const weight = 0.5; // kg
  const length = 10;  // cm
  const breadth = 10; // cm
  const height = 5;   // cm

  const payload = {
    order_id: orderData.orderId,
    order_date: new Date().toISOString().replace('T', ' ').substring(0, 19),
    pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary',
    billing_customer_name: orderData.customerName.split(' ')[0],
    billing_last_name: orderData.customerName.split(' ').slice(1).join(' ') || '',
    billing_address: orderData.shippingAddress.addressLine1,
    billing_address_2: orderData.shippingAddress.addressLine2 || '',
    billing_city: orderData.shippingAddress.city,
    billing_pincode: orderData.shippingAddress.pincode,
    billing_state: orderData.shippingAddress.state,
    billing_country: 'India',
    billing_email: orderData.customerEmail,
    billing_phone: orderData.customerPhone,
    shipping_is_billing: true,
    order_items: itemsData.map(item => ({
      name: item.name,
      sku: item.productId || 'SKU',
      units: item.qty,
      selling_price: item.price,
      discount: 0,
      tax: 0,
      hsn: ''
    })),
    payment_method: orderData.paymentMethod.toLowerCase() === 'cod' ? 'COD' : 'Prepaid',
    sub_total: orderData.subtotal,
    length,
    breadth,
    height,
    weight
  };

  try {
    const res = await axios.post(`${BASE_URL}/orders/create/adhoc`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.error('Shiprocket Create Order Failed:', error.response?.data || error.message);
    throw new Error('Failed to create order in Shiprocket');
  }
};

/**
 * Generates an AWB for a shipment ID.
 */
export const generateAWB = async (shipmentId) => {
  const token = await getToken();
  try {
    const res = await axios.post(`${BASE_URL}/courier/assign/awb`, {
      shipment_id: shipmentId
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.error('Shiprocket Generate AWB Failed:', error.response?.data || error.message);
    throw new Error('Failed to generate AWB');
  }
};

/**
 * Requests pickup for a shipment.
 */
export const requestPickup = async (shipmentId) => {
  const token = await getToken();
  try {
    const res = await axios.post(`${BASE_URL}/courier/generate/pickup`, {
      shipment_id: [shipmentId]
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.error('Shiprocket Request Pickup Failed:', error.response?.data || error.message);
    throw new Error('Failed to request pickup');
  }
};

/**
 * Generates a shipping label for a shipment.
 */
export const generateLabel = async (shipmentId) => {
  const token = await getToken();
  try {
    const res = await axios.post(`${BASE_URL}/courier/generate/label`, {
      shipment_id: [shipmentId]
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (error) {
    console.error('Shiprocket Generate Label Failed:', error.response?.data || error.message);
    throw new Error('Failed to generate label');
  }
};

export default {
  getToken,
  createCustomOrder,
  generateAWB,
  requestPickup,
  generateLabel
};

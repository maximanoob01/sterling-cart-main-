import { createContext, useContext, useReducer, useCallback } from 'react';
import toast from 'react-hot-toast';
import { SILVER_RATE_PER_GRAM, computeWeightBasedPrice } from '../utils/silverRate';

const CartContext = createContext();

/**
 * Returns the price for an item inclusive of 3% GST.
 * - weight: ((silverRate × weightGrams) + makingCharges) * 1.03
 * - mrp: product.price * 1.03
 */
export const getItemPrice = (item, silverRate = SILVER_RATE_PER_GRAM) => {
  let basePrice = item.price;
  if (item.pricingType === 'weight' && item.weightGrams != null && item.makingCharges != null) {
    basePrice = computeWeightBasedPrice(item.weightGrams, item.makingCharges, silverRate);
  }
  return Math.round(basePrice * 1.03);
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(
        item => item.id === action.payload.id && 
                item.selectedSize === action.payload.selectedSize &&
                item.engravingText === action.payload.engravingText
      );
      if (existingIndex >= 0) {
        const newItems = [...state.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + (action.payload.quantity || 1),
        };
        return { ...state, items: newItems };
      }
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }],
      };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(
          item => !(item.id === action.payload.id && 
                    item.selectedSize === action.payload.selectedSize &&
                    item.engravingText === action.payload.engravingText)
        ),
      };
    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item => {
        if (item.id === action.payload.id && 
            item.selectedSize === action.payload.selectedSize &&
            item.engravingText === action.payload.engravingText) {
          return { ...item, quantity: Math.max(1, action.payload.quantity) };
        }
        return item;
      });
      return { ...state, items: newItems };
    }
    case 'APPLY_COUPON':
      return { ...state, coupon: action.payload };
    case 'REMOVE_COUPON':
      return { ...state, coupon: null };
    case 'CLEAR_CART':
      return { ...state, items: [], coupon: null };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [], coupon: null });

  const addItem = useCallback((product, selectedSize, quantity = 1, engravingText = '') => {
    dispatch({ type: 'ADD_ITEM', payload: { ...product, selectedSize, quantity, engravingText } });
    toast.success(`${product.name} added to cart`, {
      style: { background: '#FFF0F5', color: '#2D2D2D', border: '1px solid #FFF0F5' },
      iconTheme: { primary: '#F4A0B0', secondary: '#FFF' },
    });
  }, []);

  const removeItem = useCallback((productId, selectedSize, engravingText = '') => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id: productId, selectedSize, engravingText } });
    toast.success('Item removed from cart', {
      style: { background: '#FFF0F5', color: '#2D2D2D', border: '1px solid #FFF0F5' },
      iconTheme: { primary: '#F4A0B0', secondary: '#FFF' },
    });
  }, []);

  const updateQuantity = useCallback((productId, selectedSize, quantity, engravingText = '') => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, selectedSize, quantity, engravingText } });
  }, []);

  const applyCoupon = useCallback((coupon) => {
    dispatch({ type: 'APPLY_COUPON', payload: coupon });
  }, []);

  const removeCoupon = useCallback(() => {
    dispatch({ type: 'REMOVE_COUPON' });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);

  // Subtotal: use computed GST-inclusive price × quantity
  const subtotal = state.items.reduce(
    (sum, item) => sum + getItemPrice(item) * item.quantity,
    0
  );

  let discount = 0;
  if (state.coupon) {
    if (state.coupon.type === 'percentage') {
      discount = Math.round(subtotal * (state.coupon.discount / 100));
    } else {
      discount = state.coupon.discount;
    }
  }

  // Free delivery above ₹2,499; otherwise ₹69 flat
  const FREE_DELIVERY_THRESHOLD = 2499;
  const DELIVERY_FEE = 69;
  const shipping = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;

  // GST is now included in the item price, so no additional GST calculation is needed
  const gst = 0; 
  const totalAmount = subtotal - discount + shipping;

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        coupon: state.coupon,
        addItem,
        removeItem,
        updateQuantity,
        applyCoupon,
        removeCoupon,
        clearCart,
        totalItems,
        subtotal,
        discount,
        shipping,
        gst,
        totalAmount,
        silverRate: SILVER_RATE_PER_GRAM,
        freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
        deliveryFee: DELIVERY_FEE,
        getItemPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

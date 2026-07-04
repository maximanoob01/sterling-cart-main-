import { createContext, useContext, useReducer, useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { computeWeightBasedPrice } from '../utils/silverRate';

const CartContext = createContext();

export const getItemPrice = (item, silverRate) => {
  let basePrice = item.price;
  if (item.pricingType === 'weight' && item.weightGrams != null && item.makingCharges != null) {
    basePrice = computeWeightBasedPrice(item.weightGrams, item.makingCharges, silverRate);
  }
  return Math.round(basePrice * 1.03);
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART':
      return { ...state, items: action.payload };
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(
        item => item.id === action.payload.id && 
                item.selectedSize === action.payload.selectedSize &&
                item.engravingText === action.payload.engravingText &&
                item.customDesignUrl === action.payload.customDesignUrl
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
                    item.engravingText === action.payload.engravingText &&
                    item.customDesignUrl === action.payload.customDesignUrl)
        ),
      };
    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item => {
        if (item.id === action.payload.id && 
            item.selectedSize === action.payload.selectedSize &&
            item.engravingText === action.payload.engravingText &&
            item.customDesignUrl === action.payload.customDesignUrl) {
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
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [liveSilverRate, setLiveSilverRate] = useState(102.4);

  // Fetch live silver rate on mount
  useEffect(() => {
    const fetchSilverRate = async () => {
      try {
        const res = await api.get('/settings/silver-price');
        if (res.success && res.price) {
          setLiveSilverRate(res.price);
        }
      } catch (err) {
        console.error('Failed to fetch live silver rate:', err);
      }
    };
    fetchSilverRate();
  }, []);

  // Lazy initialize from localStorage for guests
  const [state, dispatch] = useReducer(cartReducer, { items: [], coupon: null }, (initial) => {
    try {
      const local = localStorage.getItem('guestCart');
      if (local) return { ...initial, items: JSON.parse(local) };
    } catch {}
    return initial;
  });

  // Sync logic
  useEffect(() => {
    if (authLoading) return;

    if (isAuthenticated) {
      const syncCart = async () => {
        try {
          const localItems = JSON.parse(localStorage.getItem('guestCart') || '[]');
          
          if (localItems.length > 0) {
            // Merge guest cart with backend
            const res = await api.post('/cart/sync', { items: localItems });
            dispatch({ type: 'SET_CART', payload: res.cart.items });
            if (res.cart.couponCode) {
               // Optional: fetch coupon details and apply here if needed
            }
            localStorage.removeItem('guestCart');
          } else {
            // Just fetch backend cart
            const res = await api.get('/cart');
            dispatch({ type: 'SET_CART', payload: res.cart.items });
          }
        } catch (error) {
          console.error('Failed to sync cart:', error);
        }
      };
      syncCart();
    }
  }, [isAuthenticated, authLoading, user]);

  // Save guest cart to localStorage when it changes (only if NOT authenticated)
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      localStorage.setItem('guestCart', JSON.stringify(state.items));
    }
  }, [state.items, isAuthenticated, authLoading]);

  const addItem = useCallback(async (product, selectedSize, quantity = 1, engravingText = null, customDesignUrl = null) => {
    if (isAuthenticated) {
      try {
        const res = await api.post('/cart/items', { 
          productId: product.id, 
          quantity, 
          selectedSize, 
          engravingText, 
          customDesignUrl 
        });
        dispatch({ type: 'SET_CART', payload: res.cart.items });
      } catch (err) {
        toast.error('Failed to add item to cart');
        return;
      }
    } else {
      dispatch({ type: 'ADD_ITEM', payload: { ...product, selectedSize, quantity, engravingText, customDesignUrl } });
    }
    toast.success(`${product.name} added to cart`, {
      style: { background: '#FFF0F5', color: '#2D2D2D', border: '1px solid #FFF0F5' },
      iconTheme: { primary: '#F4A0B0', secondary: '#FFF' },
    });
  }, [isAuthenticated]);

  const removeItem = useCallback(async (productId, selectedSize, engravingText = null, customDesignUrl = null) => {
    if (isAuthenticated) {
      // Find the cartItemId
      const item = state.items.find(i => 
        i.id === productId && 
        i.selectedSize === selectedSize && 
        i.engravingText === engravingText && 
        i.customDesignUrl === customDesignUrl
      );
      if (item && item.cartItemId) {
        try {
          const res = await api.delete(`/cart/items/${item.cartItemId}`);
          dispatch({ type: 'SET_CART', payload: res.cart.items });
        } catch {
          toast.error('Failed to remove item');
          return;
        }
      }
    } else {
      dispatch({ type: 'REMOVE_ITEM', payload: { id: productId, selectedSize, engravingText, customDesignUrl } });
    }
    toast.success('Item removed from cart', {
      style: { background: '#FFF0F5', color: '#2D2D2D', border: '1px solid #FFF0F5' },
      iconTheme: { primary: '#F4A0B0', secondary: '#FFF' },
    });
  }, [isAuthenticated, state.items]);

  const updateQuantity = useCallback(async (productId, selectedSize, quantity, engravingText = null, customDesignUrl = null) => {
    if (isAuthenticated) {
      const item = state.items.find(i => 
        i.id === productId && 
        i.selectedSize === selectedSize && 
        i.engravingText === engravingText && 
        i.customDesignUrl === customDesignUrl
      );
      if (item && item.cartItemId) {
        try {
          const res = await api.put(`/cart/items/${item.cartItemId}`, { quantity: Math.max(1, quantity) });
          dispatch({ type: 'SET_CART', payload: res.cart.items });
        } catch {
          toast.error('Failed to update quantity');
        }
      }
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, selectedSize, quantity, engravingText, customDesignUrl } });
    }
  }, [isAuthenticated, state.items]);

  const clearCart = useCallback(async () => {
    if (isAuthenticated) {
      try {
        const res = await api.delete('/cart');
        dispatch({ type: 'SET_CART', payload: res.cart.items });
      } catch {
        toast.error('Failed to clear cart');
        return;
      }
    } else {
      dispatch({ type: 'CLEAR_CART' });
    }
  }, [isAuthenticated]);

  const applyCoupon = useCallback((coupon) => {
    dispatch({ type: 'APPLY_COUPON', payload: coupon });
  }, []);

  const removeCoupon = useCallback(() => {
    dispatch({ type: 'REMOVE_COUPON' });
  }, []);

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = state.items.reduce(
    (sum, item) => sum + getItemPrice(item, liveSilverRate) * item.quantity,
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

  const FREE_DELIVERY_THRESHOLD = 2499;
  const DELIVERY_FEE = 69;
  const shipping = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
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
        silverRate: liveSilverRate,
        freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
        deliveryFee: DELIVERY_FEE,
        getItemPrice: (item) => getItemPrice(item, liveSilverRate),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

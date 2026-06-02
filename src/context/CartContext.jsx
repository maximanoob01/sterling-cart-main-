import { createContext, useContext, useReducer, useCallback } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(
        item => item.id === action.payload.id && item.selectedSize === action.payload.selectedSize
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
          item => !(item.id === action.payload.id && item.selectedSize === action.payload.selectedSize)
        ),
      };
    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item => {
        if (item.id === action.payload.id && item.selectedSize === action.payload.selectedSize) {
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

  const addItem = useCallback((product, selectedSize = null, quantity = 1) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: { ...product, selectedSize, quantity },
    });
    toast.success(`${product.name} added to cart`, {
      style: { background: '#FFF0F5', color: '#2D2D2D', border: '1px solid #FFF0F5' },
      iconTheme: { primary: '#F4A0B0', secondary: '#FFF' },
    });
  }, []);

  const removeItem = useCallback((id, selectedSize = null) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id, selectedSize } });
    toast.success('Item removed from cart', {
      style: { background: '#FFF0F5', color: '#2D2D2D', border: '1px solid #FFF0F5' },
      iconTheme: { primary: '#F4A0B0', secondary: '#FFF' },
    });
  }, []);

  const updateQuantity = useCallback((id, selectedSize, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, selectedSize, quantity } });
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
  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let discount = 0;
  if (state.coupon) {
    if (state.coupon.type === 'percentage') {
      discount = Math.round(subtotal * (state.coupon.discount / 100));
    } else {
      discount = state.coupon.discount;
    }
  }

  const shipping = subtotal >= 999 ? 0 : 49;
  const gst = Math.round((subtotal - discount) * 0.18);
  const totalAmount = subtotal - discount + shipping + gst;

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

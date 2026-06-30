import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import api from '../services/api';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const { user } = useAuth();

  // Load wishlist from API when user logs in
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setItems([]);
        return;
      }
      try {
        const res = await api.get('/wishlist');
        if (res.success && res.products) {
          // Map _id to id for frontend compatibility
          setItems(res.products.map(p => ({ ...p, id: p._id || p.id })));
        }
      } catch (err) {
        console.warn('Wishlist API unavailable:', err.message);
      }
    };
    fetchWishlist();
  }, [user]);

  const toggleItem = useCallback(async (product) => {
    const toastStyle = {
      style: { background: '#FFF0F5', color: '#2D2D2D', border: '1px solid #FFF0F5' },
      iconTheme: { primary: '#F4A0B0', secondary: '#FFF' },
    };

    setItems(prev => {
      const exists = prev.find(item => (item.id === product.id || item._id === product._id));
      if (exists) {
        toast.success(`${product.name} removed from wishlist`, toastStyle);
        return prev.filter(item => item.id !== product.id && item._id !== product._id);
      } else {
        toast.success(`${product.name} added to wishlist ♡`, toastStyle);
        return [...prev, product];
      }
    });

    // Sync with API (non-blocking)
    try {
      const productId = product._id || product.id;
      await api.post(`/wishlist/${productId}`);
    } catch (err) {
      // Silently fail — local state is already updated
    }
  }, []);

  const isWishlisted = useCallback((productId) => {
    return items.some(item => item.id === productId || item._id === productId);
  }, [items]);

  const removeItem = useCallback(async (productId) => {
    setItems(prev => prev.filter(item => item.id !== productId && item._id !== productId));
    try {
      await api.delete(`/wishlist/${productId}`);
    } catch (err) { /* silent */ }
  }, []);

  return (
    <WishlistContext.Provider value={{ items, toggleItem, isWishlisted, removeItem }}>
      {children}
    </WishlistContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};

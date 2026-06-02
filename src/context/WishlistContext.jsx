import { createContext, useContext, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  const toggleItem = useCallback((product) => {
    setItems(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        toast.success(`${product.name} removed from wishlist`, {
          style: { background: '#FFF0F5', color: '#2D2D2D', border: '1px solid #FFF0F5' },
          iconTheme: { primary: '#F4A0B0', secondary: '#FFF' },
        });
        return prev.filter(item => item.id !== product.id);
      } else {
        toast.success(`${product.name} added to wishlist ♡`, {
          style: { background: '#FFF0F5', color: '#2D2D2D', border: '1px solid #FFF0F5' },
          iconTheme: { primary: '#F4A0B0', secondary: '#FFF' },
        });
        return [...prev, product];
      }
    });
  }, []);

  const isWishlisted = useCallback((productId) => {
    return items.some(item => item.id === productId);
  }, [items]);

  const removeItem = useCallback((productId) => {
    setItems(prev => prev.filter(item => item.id !== productId));
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

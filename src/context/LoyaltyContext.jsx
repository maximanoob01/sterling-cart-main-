import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const LoyaltyContext = createContext();

// 1 point per ₹100 spent
export const pointsEarned = (orderValue) => Math.floor(orderValue * 0.01);

// Max redeemable per order: 3% of order value, capped by actual balance
export const maxRedeemable = (orderValue, balance) =>
  Math.min(balance, Math.floor(orderValue * 0.03));

export const LoyaltyProvider = ({ children }) => {
  const { user } = useAuth();
  const [loyaltyData, setLoyaltyData] = useState({ balance: 0, history: [] });

  const fetchLoyalty = useCallback(async () => {
    if (!user) {
      setLoyaltyData({ balance: 0, history: [] });
      return;
    }

    try {
      const res = await api.get('/loyalty');
      if (res.success) {
        setLoyaltyData({ balance: res.balance, history: res.history });
      }
    } catch (err) {
      console.warn('Loyalty API unavailable, using fallback:', err.message);
    }
  }, [user]);

  // Load loyalty data initially
  useEffect(() => {
    fetchLoyalty();
  }, [fetchLoyalty]);

  // Expose refresh function so CheckoutPage can update balance after a backend transaction
  const refreshLoyalty = useCallback(async () => {
    await fetchLoyalty();
  }, [fetchLoyalty]);

  return (
    <LoyaltyContext.Provider value={{ balance: loyaltyData.balance, history: loyaltyData.history, refreshLoyalty, pointsEarned, maxRedeemable }}>
      {children}
    </LoyaltyContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLoyalty = () => {
  const ctx = useContext(LoyaltyContext);
  if (!ctx) throw new Error('useLoyalty must be used within LoyaltyProvider');
  return ctx;
};

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const LoyaltyContext = createContext();

// 10% of order value → points earned
export const pointsEarned = (orderValue) => Math.floor(orderValue * 0.1);

// Max redeemable per order: 5% of order value, capped by actual balance
export const maxRedeemable = (orderValue, balance) =>
  Math.min(balance, Math.floor(orderValue * 0.05));

export const LoyaltyProvider = ({ children }) => {
  const { user } = useAuth();
  const [loyaltyData, setLoyaltyData] = useState({ balance: 0, history: [] });

  // Load loyalty data from API when user changes
  useEffect(() => {
    const fetchLoyalty = async () => {
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
        console.warn('Loyalty API unavailable, using localStorage fallback:', err.message);
        // Fallback to localStorage
        const key = `sterling_loyalty_${user._id || user.id || 'guest'}`;
        const stored = localStorage.getItem(key);
        if (stored) {
          try { setLoyaltyData(JSON.parse(stored)); } catch { /* ignore */ }
        } else {
          const initial = {
            balance: 200,
            history: [{ id: 1, type: 'earned', points: 200, description: 'Welcome bonus', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() }],
          };
          setLoyaltyData(initial);
          localStorage.setItem(key, JSON.stringify(initial));
        }
      }
    };

    fetchLoyalty();
  }, [user]);

  // Add points after a successful order
  const addPoints = useCallback((orderValue, orderId) => {
    const earned = pointsEarned(orderValue);
    setLoyaltyData(prev => {
      const updated = {
        balance: prev.balance + earned,
        history: [
          { id: Date.now(), type: 'earned', points: earned, description: `Order #${orderId}`, date: new Date().toISOString() },
          ...prev.history,
        ],
      };
      return updated;
    });
    return earned;
  }, []);

  // Deduct points when redeemed at checkout
  const redeemPoints = useCallback((pointsToRedeem, orderId) => {
    setLoyaltyData(prev => ({
      balance: Math.max(0, prev.balance - pointsToRedeem),
      history: [
        { id: Date.now(), type: 'redeemed', points: pointsToRedeem, description: `Redeemed on order #${orderId}`, date: new Date().toISOString() },
        ...prev.history,
      ],
    }));
  }, []);

  return (
    <LoyaltyContext.Provider value={{ balance: loyaltyData.balance, history: loyaltyData.history, addPoints, redeemPoints, pointsEarned, maxRedeemable }}>
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

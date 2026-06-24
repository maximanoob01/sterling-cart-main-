import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';

const LoyaltyContext = createContext();

// 10% of order value → points earned
export const pointsEarned = (orderValue) => Math.floor(orderValue * 0.1);

// Max redeemable per order: 5% of order value, capped by actual balance
export const maxRedeemable = (orderValue, balance) =>
  Math.min(balance, Math.floor(orderValue * 0.05));

const STORAGE_KEY = (userId) => `sterling_loyalty_${userId}`;

const DEFAULT_STATE = { balance: 0, history: [] };

export const LoyaltyProvider = ({ children }) => {
  const { user } = useAuth();
  const [loyaltyData, setLoyaltyData] = useState(DEFAULT_STATE);

  // Load from localStorage whenever user changes
  useEffect(() => {
    if (user?.id) {
      const stored = localStorage.getItem(STORAGE_KEY(user.id));
      if (stored) {
        try {
          setLoyaltyData(JSON.parse(stored));
        } catch {
          setLoyaltyData(DEFAULT_STATE);
        }
      } else {
        // Give demo user 200 starting points so the feature is visible
        const initial = { balance: 200, history: [
          {
            id: 1,
            type: 'earned',
            points: 200,
            description: 'Welcome bonus',
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          }
        ]};
        setLoyaltyData(initial);
        localStorage.setItem(STORAGE_KEY(user.id), JSON.stringify(initial));
      }
    } else {
      setLoyaltyData(DEFAULT_STATE);
    }
  }, [user?.id]);

  const persist = useCallback((newData) => {
    if (user?.id) {
      localStorage.setItem(STORAGE_KEY(user.id), JSON.stringify(newData));
    }
    setLoyaltyData(newData);
  }, [user?.id]);

  // Add points after a successful order
  const addPoints = useCallback((orderValue, orderId) => {
    const earned = pointsEarned(orderValue);
    setLoyaltyData((prev) => {
      const updated = {
        balance: prev.balance + earned,
        history: [
          {
            id: Date.now(),
            type: 'earned',
            points: earned,
            description: `Order #${orderId}`,
            date: new Date().toISOString(),
          },
          ...prev.history,
        ],
      };
      if (user?.id) {
        localStorage.setItem(STORAGE_KEY(user.id), JSON.stringify(updated));
      }
      return updated;
    });
    return earned;
  }, [user?.id]);

  // Deduct points when redeemed at checkout
  const redeemPoints = useCallback((pointsToRedeem, orderId) => {
    setLoyaltyData((prev) => {
      const updated = {
        balance: Math.max(0, prev.balance - pointsToRedeem),
        history: [
          {
            id: Date.now(),
            type: 'redeemed',
            points: pointsToRedeem,
            description: `Redeemed on order #${orderId}`,
            date: new Date().toISOString(),
          },
          ...prev.history,
        ],
      };
      if (user?.id) {
        localStorage.setItem(STORAGE_KEY(user.id), JSON.stringify(updated));
      }
      return updated;
    });
  }, [user?.id]);

  return (
    <LoyaltyContext.Provider
      value={{
        balance: loyaltyData.balance,
        history: loyaltyData.history,
        addPoints,
        redeemPoints,
        pointsEarned,
        maxRedeemable,
      }}
    >
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

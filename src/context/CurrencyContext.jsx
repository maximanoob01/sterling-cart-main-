import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('INR'); // Default
  const [exchangeRate, setExchangeRate] = useState(1); // INR to USD multiplier
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initCurrency = async () => {
      try {
        // 1. Detect Location
        let userCountry = 'IN';
        try {
          const locRes = await fetch('https://ipapi.co/json/');
          if (locRes.ok) {
            const locData = await locRes.json();
            userCountry = locData.country_code;
          }
        } catch (err) {
          console.warn('IP detection failed, defaulting to INR', err);
        }

        // 2. Set Currency based on location
        const targetCurrency = userCountry === 'IN' ? 'INR' : 'USD';
        setCurrency(targetCurrency);

        // 3. Fetch Exchange Rate if USD
        if (targetCurrency === 'USD') {
          try {
            const rateRes = await fetch('https://open.er-api.com/v6/latest/INR');
            if (rateRes.ok) {
              const rateData = await rateRes.json();
              setExchangeRate(rateData.rates.USD || 0.012); // Fallback to ~0.012
            }
          } catch (err) {
            console.warn('Exchange rate fetch failed', err);
            setExchangeRate(0.012); // Approximate fallback
          }
        }
      } catch (err) {
        console.error('Currency initialization error', err);
      } finally {
        setIsReady(true);
      }
    };

    initCurrency();
  }, []);

  // Smart price formatter
  const formatPrice = (priceInINR) => {
    if (currency === 'USD') {
      const converted = priceInINR * exchangeRate;
      return '$' + converted.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
    // Default INR formatting
    return '₹' + Math.round(priceInINR).toLocaleString('en-IN');
  };

  return (
    <CurrencyContext.Provider value={{ currency, exchangeRate, formatPrice, isReady }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
  return context;
};

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
          const cachedCountry = sessionStorage.getItem('user_country');
          if (cachedCountry) {
            userCountry = cachedCountry;
          } else {
            const locRes = await fetch('https://ipinfo.io/json');
            if (locRes.ok) {
              const locData = await locRes.json();
              userCountry = locData.country;
              sessionStorage.setItem('user_country', userCountry);
            }
          }
        } catch (err) {
          // Silent catch to prevent console spam when ipapi.co rate limits us (CORS/429)
        }

        // 2. Set Currency based on location
        const targetCurrency = userCountry === 'IN' ? 'INR' : 'USD';
        setCurrency(targetCurrency);

        // 3. Fetch Exchange Rate if USD
        if (targetCurrency === 'USD') {
          try {
            const cachedRate = sessionStorage.getItem('exchange_rate');
            if (cachedRate) {
              setExchangeRate(parseFloat(cachedRate));
            } else {
              const rateRes = await fetch('https://open.er-api.com/v6/latest/INR');
              if (rateRes.ok) {
                const rateData = await rateRes.json();
                const rate = rateData.rates.USD || 0.012;
                setExchangeRate(rate);
                sessionStorage.setItem('exchange_rate', rate.toString());
              } else {
                setExchangeRate(0.012);
              }
            }
          } catch (err) {
            // Silent catch to prevent console spam
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

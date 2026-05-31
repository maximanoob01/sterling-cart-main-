import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import BackToTop from './components/layout/BackToTop';
import LoadingScreen from './components/ui/LoadingScreen';
import PageTransition from './components/layout/PageTransition';

import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import TrackOrderPage from './pages/TrackOrderPage';
import LoginPage from './pages/LoginPage';
import UserDashboardPage from './pages/UserDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
        <Route path="/shop" element={<PageTransition><ShopPage /></PageTransition>} />
        <Route path="/product/:id" element={<PageTransition><ProductDetailRoute /></PageTransition>} />
        <Route path="/cart" element={<PageTransition><CartPage /></PageTransition>} />
        <Route path="/checkout" element={<PageTransition><CheckoutPage /></PageTransition>} />
        <Route path="/track-order" element={<PageTransition><TrackOrderPage /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><UserDashboardPage /></PageTransition>} />
        <Route path="/admin" element={<PageTransition><AdminDashboardPage /></PageTransition>} />
        <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><ContactPage /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial soothing loading screen duration
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ScrollToTop />
              
              <AnimatePresence>
                {isLoading && <LoadingScreen key="loading" />}
              </AnimatePresence>

              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">
                  <AnimatedRoutes />
                </main>
                <Footer />
                <BackToTop />
              </div>
              
              <LoginPage />
              
              <Toaster position="bottom-right" toastOptions={{ className: 'toast-custom', duration: 4000 }} />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

function ProductDetailRoute() {
  const { pathname } = useLocation();
  return <ProductDetailPage key={pathname} />;
}

export default App;

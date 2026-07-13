import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

const AuthContext = createContext();

const toastStyle = {
  style: { background: '#FFF0F5', color: '#2D2D2D', border: '1px solid #FFF0F5' },
  iconTheme: { primary: '#F4A0B0', secondary: '#FFF' },
};

// Maps a caught ApiError to a user-readable string
const friendlyAuthError = (error, fallback) => {
  if (error?.status === 0) {
    return 'Unable to reach the server. Please check your internet connection and try again.';
  }
  return error?.message || fallback;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  // On app load, fetch user (interceptor will handle refresh if needed)
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await api.get('/auth/me');
        setUser(res.user);
      } catch {
        api.removeToken();
        setUser(null);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const requestOtp = useCallback(async (phone, isSignup = false) => {
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/\s/g, '')}`;
      await api.post('/auth/request-otp', { phone: formattedPhone, isSignup });
      return { success: true, message: `OTP sent to ${formattedPhone}` };
    } catch (error) {
      return { success: false, error: friendlyAuthError(error, 'Failed to send OTP') };
    }
  }, []);

  const verifyOtp = useCallback(async (phone, otp, isSignup = false, name = '', email = '') => {
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/\s/g, '')}`;
      const res = await api.post('/auth/verify-otp', { phone: formattedPhone, otp, isSignup, name, email });

      api.setToken(res.token);
      setUser(res.user);
      closeAuthModal();

      if (res.isNewUser || isSignup) {
        toast.success(`Welcome to Sterling Kart, ${res.user.name || 'there'}!`, toastStyle);
      } else {
        toast.success(`Welcome back, ${res.user.name || 'there'}!`, toastStyle);
      }

      return { success: true, user: res.user };
    } catch (error) {
      return { success: false, error: friendlyAuthError(error, 'Invalid OTP. Please try again.') };
    }
  }, [closeAuthModal]);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      api.removeToken();
      setUser(null);
      toast.success('Logged out successfully', toastStyle);
    }
  }, []);

  const updateProfile = useCallback(async (updates) => {
    try {
      const res = await api.put('/auth/profile', updates);
      setUser(res.user);
      toast.success('Profile updated successfully', toastStyle);
    } catch {
      // Fallback: update locally
      setUser(prev => ({ ...prev, ...updates }));
      toast.success('Profile updated', toastStyle);
    }
  }, []);

  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user, setUser, requestOtp, verifyOtp, logout, updateProfile, isAdmin, isAuthenticated,
        isAuthModalOpen, openAuthModal, closeAuthModal, loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

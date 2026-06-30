import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { auth, RecaptchaVerifier, signInWithPhoneNumber, signOut as firebaseSignOut } from '../services/firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  // On app load, check if Firebase user is logged in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          api.setToken(token);

          // Sync user with our backend
          const res = await api.post('/auth/sync', {
            name: firebaseUser.displayName || '',
            email: firebaseUser.email || '',
          });

          setUser(res.user);
        } catch (err) {
          console.error('Auth sync failed:', err);
          // Fallback — still set user from Firebase data
          setUser({
            name: firebaseUser.displayName || '',
            phone: firebaseUser.phoneNumber || '',
            email: firebaseUser.email || '',
            role: 'user',
          });
        }
      } else {
        setUser(null);
        api.removeToken();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Refresh token periodically (Firebase tokens expire after 1 hour)
  useEffect(() => {
    const interval = setInterval(async () => {
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken(true);
        api.setToken(token);
      }
    }, 50 * 60 * 1000); // Refresh every 50 minutes

    return () => clearInterval(interval);
  }, []);

  const setupRecaptcha = useCallback((elementId) => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, elementId, {
        size: 'invisible',
        callback: () => { /* reCAPTCHA solved */ },
      });
    }
    return window.recaptchaVerifier;
  }, []);

  const requestOtp = useCallback(async (phone) => {
    try {
      const appVerifier = setupRecaptcha('recaptcha-container');
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/\s/g, '')}`;
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      return { success: true, message: `OTP sent to ${formattedPhone}` };
    } catch (error) {
      console.error('OTP request error:', error);
      // Reset recaptcha on failure
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
      return { success: false, error: error.message || 'Failed to send OTP' };
    }
  }, [setupRecaptcha]);

  const verifyOtp = useCallback(async (phone, otp, isSignup = false, name = '', email = '') => {
    try {
      if (!confirmationResult) {
        return { success: false, error: 'Please request OTP first' };
      }

      const credential = await confirmationResult.confirm(otp);
      const token = await credential.user.getIdToken();
      api.setToken(token);

      // Sync with backend — send name/email for signup
      const res = await api.post('/auth/sync', { name, email });
      setUser(res.user);
      closeAuthModal();

      const toastStyle = {
        style: { background: '#FFF0F5', color: '#2D2D2D', border: '1px solid #FFF0F5' },
        iconTheme: { primary: '#F4A0B0', secondary: '#FFF' },
      };

      if (isSignup) {
        toast.success(`Welcome to Sterling Kart, ${name || 'there'}!`, toastStyle);
      } else {
        toast.success(`Welcome back, ${res.user?.name || 'there'}!`, toastStyle);
      }

      return { success: true, user: res.user };
    } catch (error) {
      console.error('OTP verify error:', error);
      return { success: false, error: error.message || 'Invalid OTP' };
    }
  }, [confirmationResult, closeAuthModal]);

  const logout = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      api.removeToken();
      setUser(null);
      toast.success('Logged out successfully', {
        style: { background: '#FFF0F5', color: '#2D2D2D', border: '1px solid #FFF0F5' },
        iconTheme: { primary: '#F4A0B0', secondary: '#FFF' },
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const updateProfile = useCallback(async (updates) => {
    try {
      const res = await api.put('/auth/profile', updates);
      setUser(res.user);
      toast.success('Profile updated successfully', {
        style: { background: '#FFF0F5', color: '#2D2D2D', border: '1px solid #FFF0F5' },
        iconTheme: { primary: '#F4A0B0', secondary: '#FFF' },
      });
    } catch (error) {
      // Fallback: update locally
      setUser(prev => ({ ...prev, ...updates }));
      toast.success('Profile updated', {
        style: { background: '#FFF0F5', color: '#2D2D2D', border: '1px solid #FFF0F5' },
        iconTheme: { primary: '#F4A0B0', secondary: '#FFF' },
      });
    }
  }, []);

  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user, requestOtp, verifyOtp, logout, updateProfile, isAdmin, isAuthenticated,
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

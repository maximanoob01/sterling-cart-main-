import { createContext, useContext, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const mockUsers = [
  {
    id: 1,
    name: 'Priya Sharma',
    email: 'user@test.com',
    password: 'password123',
    phone: '+91 98765 43210',
    role: 'user',
    addresses: [
      {
        id: 1,
        fullName: 'Priya Sharma',
        addressLine1: '42, Rose Garden Apartments',
        addressLine2: 'MG Road',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        landmark: 'Near Forum Mall',
        isDefault: true,
      },
    ],
  },
  {
    id: 100,
    name: 'Admin User',
    email: 'admin@sterlingcart.com',
    password: 'admin123',
    phone: '+91 99999 00000',
    role: 'admin',
    addresses: [],
  },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const openAuthModal = useCallback(() => setIsAuthModalOpen(true), []);
  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  const requestOtp = useCallback(async (phone, isSignup = false) => {
    // Mock sending OTP
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: `OTP sent successfully to ${phone}` });
      }, 800);
    });
  }, []);

  const verifyOtp = useCallback(async (phone, otp, isSignup = false, name = '', email = '') => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (otp === '1234') { // Mock valid OTP
          if (isSignup) {
            const exists = mockUsers.find(u => u.phone === phone);
            if (exists) {
              resolve({ success: false, error: 'Phone number already registered. Please login.' });
              return;
            }
            const newUser = {
              id: Date.now(),
              name,
              email,
              phone,
              role: 'user',
              addresses: [],
            };
            mockUsers.push(newUser);
            setUser(newUser);
            closeAuthModal();
            toast.success(`Welcome to Sterling Kart, ${name}!`, {
              style: { background: '#FFF0F5', color: '#2D2D2D', border: '1px solid #FFF0F5' },
              iconTheme: { primary: '#F4A0B0', secondary: '#FFF' },
            });
            resolve({ success: true, user: newUser });
          } else {
            const found = mockUsers.find(u => u.phone === phone);
            if (found) {
              const safeUser = Object.fromEntries(Object.entries(found).filter(([key]) => key !== 'password'));
              setUser(safeUser);
              closeAuthModal();
              toast.success(`Welcome back, ${found.name}!`, {
                style: { background: '#FFF0F5', color: '#2D2D2D', border: '1px solid #FFF0F5' },
                iconTheme: { primary: '#F4A0B0', secondary: '#FFF' },
              });
              resolve({ success: true, user: safeUser });
            } else {
              resolve({ success: false, error: 'Account not found. Please sign up.' });
            }
          }
        } else {
          resolve({ success: false, error: 'Invalid OTP. Please enter 1234.' });
        }
      }, 500);
    });
  }, [closeAuthModal]);

  const logout = useCallback(() => {
    setUser(null);
    toast.success('Logged out successfully', {
      style: { background: '#FFF0F5', color: '#2D2D2D', border: '1px solid #FFF0F5' },
      iconTheme: { primary: '#F4A0B0', secondary: '#FFF' },
    });
  }, []);

  const updateProfile = useCallback((updates) => {
    setUser(prev => ({ ...prev, ...updates }));
    toast.success('Profile updated successfully', {
      style: { background: '#FFF0F5', color: '#2D2D2D', border: '1px solid #FFF0F5' },
      iconTheme: { primary: '#F4A0B0', secondary: '#FFF' },
    });
  }, []);

  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{ 
        user, requestOtp, verifyOtp, logout, updateProfile, isAdmin, isAuthenticated,
        isAuthModalOpen, openAuthModal, closeAuthModal
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

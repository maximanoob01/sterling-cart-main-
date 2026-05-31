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

  const login = useCallback((email, password) => {
    const found = mockUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (found) {
      const safeUser = Object.fromEntries(Object.entries(found).filter(([key]) => key !== 'password'));
      setUser(safeUser);
      closeAuthModal();
      toast.success(`Welcome back, ${found.name}!`, {
        style: { background: '#FFF0F5', color: '#2D2D2D', border: '1px solid #FFE4EE' },
        iconTheme: { primary: '#F4A0B0', secondary: '#FFF' },
      });
      return { success: true, user: safeUser };
    }
    return { success: false, error: 'Invalid email or password' };
  }, [closeAuthModal]);

  const signup = useCallback((name, email, password, phone) => {
    const exists = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return { success: false, error: 'Email already registered' };
    }
    const newUser = {
      id: Date.now(),
      name,
      email,
      phone,
      role: 'user',
      addresses: [],
    };
    setUser(newUser);
    closeAuthModal();
    toast.success(`Welcome to Sterling Cart, ${name}!`, {
      style: { background: '#FFF0F5', color: '#2D2D2D', border: '1px solid #FFE4EE' },
      iconTheme: { primary: '#F4A0B0', secondary: '#FFF' },
    });
    return { success: true, user: newUser };
  }, [closeAuthModal]);

  const logout = useCallback(() => {
    setUser(null);
    toast.success('Logged out successfully', {
      style: { background: '#FFF0F5', color: '#2D2D2D', border: '1px solid #FFE4EE' },
      iconTheme: { primary: '#F4A0B0', secondary: '#FFF' },
    });
  }, []);

  const updateProfile = useCallback((updates) => {
    setUser(prev => ({ ...prev, ...updates }));
    toast.success('Profile updated successfully', {
      style: { background: '#FFF0F5', color: '#2D2D2D', border: '1px solid #FFE4EE' },
      iconTheme: { primary: '#F4A0B0', secondary: '#FFF' },
    });
  }, []);

  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{ 
        user, login, signup, logout, updateProfile, isAdmin, isAuthenticated,
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

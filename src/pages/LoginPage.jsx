import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

import slide1 from '../assets/images/login1.jpeg';
import slide2 from '../assets/images/login2.jpeg';
import slide3 from '../assets/images/login3.jpeg';

const slides = [slide1, slide2, slide3];

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [slideIndex, setSlideIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [error, setError] = useState('');
  
  const { login, signup, isAuthModalOpen, closeAuthModal } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthModalOpen) return;
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAuthModalOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      if (!formData.email || !formData.password) {
        setError('Please fill in all fields');
        return;
      }
      const res = login(formData.email, formData.password);
      if (res.success) {
        navigate(res.user.role === 'admin' ? '/admin' : '/dashboard');
      } else {
        setError(res.error);
      }
    } else {
      if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all required fields');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      const res = signup(formData.name, formData.email, formData.password, formData.phone);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.error);
      }
    }
  };

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-[850px] bg-bg-surface rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[500px] relative"
      >
        
        {/* Close Button top right */}
        <button onClick={closeAuthModal} className="absolute top-5 right-5 z-20 text-gray-400 hover:text-gray-700 transition-colors">
          <X size={22} />
        </button>

        {/* Left Side: Image Slider */}
        <div className="hidden md:block md:w-[45%] relative bg-pink-50 overflow-hidden">
          <AnimatePresence initial={false}>
            <motion.img
              key={slideIndex}
              src={slides[slideIndex]}
              alt="Sterling Cart Jewelry"
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            />
          </AnimatePresence>
          
          {/* Watermark Logo */}
          <div className="absolute top-8 left-8 z-10 drop-shadow-md flex flex-col items-center leading-none">
            <span className="whitespace-nowrap font-[var(--font-logo)] text-[22px] font-semibold uppercase tracking-[0.7px] text-white/90">
              Sterling Kart
            </span>
            <span className="mt-1.5 whitespace-nowrap font-sans text-[7.5px] font-bold uppercase tracking-[2.2px] text-white/80">
              925 Silver Jewels
            </span>
          </div>

          {/* Gradient Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#8E2D48]/90 via-[#8E2D48]/30 to-transparent flex flex-col justify-end p-8">
            <h3 className="font-serif text-[32px] leading-tight text-white mb-4">Benefits</h3>
            <ul className="text-white/90 space-y-2.5 text-[14px] font-medium tracking-wide">
              <li className="flex items-center gap-3">
                <span className="text-[#F4A0B0]">✦</span> Earn and use Sterling Coins.
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#F4A0B0]">✦</span> Personalised shopping journey.
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#F4A0B0]">✦</span> Exclusive early access to sales.
              </li>
            </ul>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-[55%] p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-bg-surface relative z-10">
          <div className="mb-8">
            <h2 className="font-serif text-[28px] text-text-main leading-tight">
              Sign in Or Sign up
            </h2>
            <p className="text-gray-500 mt-1 text-[14px]">
              Access your personalized premium jewelry experience.
            </p>
          </div>

          <div className="flex bg-gray-100 rounded-lg p-1 mb-6 max-w-[220px]">
            <button
              type="button"
              onClick={() => {setIsLogin(true); setError('');}}
              className={`flex-1 py-1.5 text-[13px] font-semibold rounded-md transition-all ${isLogin ? 'bg-bg-surface text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {setIsLogin(false); setError('');}}
              className={`flex-1 py-1.5 text-[13px] font-semibold rounded-md transition-all ${!isLogin ? 'bg-bg-surface text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-[13px] p-2.5 rounded-lg mb-5 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
            {!isLogin && (
              <div className="col-span-1">
                <label className="block text-[12px] font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Full Name</label>
                <div className="relative flex items-center">
                  <User size={16} className="absolute left-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 rounded-xl border border-gray-200 focus:bg-bg-surface focus:border-[#D4527A] focus:ring-1 focus:ring-[#D4527A] outline-none text-[13px] transition-all"
                  />
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="col-span-1">
                <label className="block text-[12px] font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Phone Number</label>
                <div className="relative flex items-center">
                  <Phone size={16} className="absolute left-4 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 rounded-xl border border-gray-200 focus:bg-bg-surface focus:border-[#D4527A] focus:ring-1 focus:ring-[#D4527A] outline-none text-[13px] transition-all"
                  />
                </div>
              </div>
            )}

            <div className="col-span-1 sm:col-span-2">
              <label className="block text-[12px] font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Email Address</label>
              <div className="relative flex items-center">
                <Mail size={16} className="absolute left-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 rounded-xl border border-gray-200 focus:bg-bg-surface focus:border-[#D4527A] focus:ring-1 focus:ring-[#D4527A] outline-none text-[13px] transition-all"
                />
              </div>
            </div>

            <div className={!isLogin ? "col-span-1" : "col-span-1 sm:col-span-2"}>
              <label className="block text-[12px] font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative flex items-center">
                <Lock size={16} className="absolute left-4 text-gray-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 rounded-xl border border-gray-200 focus:bg-bg-surface focus:border-[#D4527A] focus:ring-1 focus:ring-[#D4527A] outline-none text-[13px] transition-all"
                />
              </div>
            </div>

            {!isLogin && (
              <div className="col-span-1">
                <label className="block text-[12px] font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Confirm Password</label>
                <div className="relative flex items-center">
                  <Lock size={16} className="absolute left-4 text-gray-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 rounded-xl border border-gray-200 focus:bg-bg-surface focus:border-[#D4527A] focus:ring-1 focus:ring-[#D4527A] outline-none text-[13px] transition-all"
                  />
                </div>
              </div>
            )}

            {isLogin && (
              <div className="col-span-1 sm:col-span-2 flex items-center justify-between mt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#B94B68] focus:ring-[#B94B68] accent-[#B94B68] cursor-pointer" />
                  <span className="text-[14px] text-gray-600 group-hover:text-gray-900">Remember Me</span>
                </label>
                <a href="#" className="text-[14px] text-gray-500 hover:text-[#B94B68] hover:underline transition-colors">Forgot Password?</a>
              </div>
            )}

            <div className="col-span-1 sm:col-span-2 pt-2">
              <p className="text-[11px] text-gray-500 mb-4">
                By continuing, I agree to <a href="#" className="text-[#D4527A] font-semibold hover:underline">Terms of use</a> and <a href="#" className="text-[#D4527A] font-semibold hover:underline">Privacy Policy</a>
              </p>
              
              <button type="submit" className="w-full py-3 bg-[#E5E5E5] hover:bg-[#D4527A] text-gray-500 hover:text-white font-semibold rounded-full transition-all duration-300 text-[14px]">
                Continue
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

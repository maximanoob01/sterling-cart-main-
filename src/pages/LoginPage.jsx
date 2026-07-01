import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

import slide1 from '../assets/images/login1.jpeg';
import slide2 from '../assets/images/login2.jpeg';
import slide3 from '../assets/images/login3.jpeg';

const slides = [slide1, slide2, slide3];

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [authStep, setAuthStep] = useState('PHONE'); // 'PHONE' or 'OTP'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    otp: '',
  });
  const [error, setError] = useState('');
  
  const { requestOtp, verifyOtp, isAuthModalOpen, closeAuthModal } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthModalOpen) return;
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAuthModalOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (authStep === 'PHONE') {
      if (!formData.phone) {
        setError('Phone number is required');
        return;
      }
      if (!isLogin && (!formData.name || !formData.email)) {
        setError('Name and Email are required for signup');
        return;
      }

      setIsSubmitting(true);
      const res = await requestOtp(formData.phone, !isLogin);
      setIsSubmitting(false);

      if (res.success) {
        setAuthStep('OTP');
      } else {
        setError(res.error || 'Failed to send OTP');
      }
    } else {
      if (!formData.otp) {
        setError('Please enter the OTP');
        return;
      }

      setIsSubmitting(true);
      const res = await verifyOtp(formData.phone, formData.otp, !isLogin, formData.name, formData.email);
      setIsSubmitting(false);

      if (res.success) {
        navigate(res.user?.role === 'admin' ? '/admin' : '/dashboard');
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
              alt="Sterling Cart Jewellery"
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            />
          </AnimatePresence>
          
          {/* Watermark Logo */}
          <div className="absolute top-8 left-8 z-10 drop-shadow-md flex flex-col items-center leading-none">
            <span className="brand-wordmark whitespace-nowrap text-[22px] text-white/90">
              STERLING KART
            </span>
            <span className="brand-submark mt-1.5 whitespace-nowrap text-[7.5px] text-white/80">
              925 SILVER JEWELS
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
              Access your personalized premium jewellery experience.
            </p>
          </div>

          <div className="flex bg-gray-100 rounded-lg p-1 mb-6 max-w-[220px]">
            <button
              type="button"
              onClick={() => {setIsLogin(true); setError(''); setAuthStep('PHONE');}}
              className={`flex-1 py-1.5 text-[13px] font-semibold rounded-md transition-all ${isLogin ? 'bg-bg-surface text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {setIsLogin(false); setError(''); setAuthStep('PHONE');}}
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

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-4">
            {authStep === 'PHONE' ? (
              <>
                {!isLogin && (
                  <>
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
                    <div className="col-span-1">
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
                  </>
                )}
                
                <div className="col-span-1">
                  <label className="block text-[12px] font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Phone Number</label>
                  <div className="relative flex items-center">
                    <Phone size={16} className="absolute left-4 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="Enter mobile number"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 rounded-xl border border-gray-200 focus:bg-bg-surface focus:border-[#D4527A] focus:ring-1 focus:ring-[#D4527A] outline-none text-[13px] transition-all"
                    />
                  </div>
                </div>

                <div className="col-span-1 pt-2">
                  <p className="text-[11px] text-gray-500 mb-4">
                    By continuing, I agree to <Link to="/legal" className="text-[#D4527A] font-semibold hover:underline">Terms of use & Privacy Policy</Link>
                  </p>
                  
                  <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-[#E5E5E5] hover:bg-[#D4527A] text-gray-500 hover:text-white font-semibold rounded-full transition-all duration-300 text-[14px] flex justify-center items-center">
                    {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="col-span-1">
                  <div className="mb-4">
                    <p className="text-[13px] text-gray-600">Enter the 4-digit OTP sent to <span className="font-semibold text-gray-900">{formData.phone}</span></p>
                    <button type="button" onClick={() => setAuthStep('PHONE')} className="text-[#D4527A] text-[12px] hover:underline mt-1 font-medium">Change Phone Number</button>
                  </div>
                  
                  <label className="block text-[12px] font-bold text-gray-700 mb-1.5 uppercase tracking-wider">One Time Password</label>
                  <div className="relative flex items-center">
                    <Lock size={16} className="absolute left-4 text-gray-400" />
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="1 2 3 4"
                      value={formData.otp}
                      onChange={e => setFormData({...formData, otp: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 tracking-[0.5em] font-bold text-center bg-gray-50/50 rounded-xl border border-gray-200 focus:bg-bg-surface focus:border-[#D4527A] focus:ring-1 focus:ring-[#D4527A] outline-none text-[16px] transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 mt-2 text-center">For testing, use <span className="font-bold text-gray-800">1234</span></p>
                </div>

                <div className="col-span-1 pt-2">
                  <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-[#1A1A1A] hover:bg-[#D4527A] text-white font-semibold rounded-full transition-all duration-300 text-[14px] flex justify-center items-center shadow-md">
                    {isSubmitting ? 'Verifying...' : 'Verify & Continue'}
                  </button>
                  <div className="mt-4 text-center">
                    <button type="button" onClick={() => requestOtp(formData.phone, !isLogin)} className="text-[12px] text-gray-500 hover:text-[#D4527A] transition-colors font-medium">Resend OTP</button>
                  </div>
                </div>
              </>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
}

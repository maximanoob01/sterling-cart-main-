import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, X, Search, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const COUNTRIES = [
  { code: 'IN', name: 'India', dial: '+91', flag: '\uD83C\uDDEE\uD83C\uDDF3' },
  { code: 'US', name: 'United States', dial: '+1', flag: '\uD83C\uDDFA\uD83C\uDDF8' },
  { code: 'GB', name: 'United Kingdom', dial: '+44', flag: '\uD83C\uDDEC\uD83C\uDDE7' },
  { code: 'AE', name: 'UAE', dial: '+971', flag: '\uD83C\uDDE6\uD83C\uDDEA' },
  { code: 'CA', name: 'Canada', dial: '+1', flag: '\uD83C\uDDE8\uD83C\uDDE6' },
  { code: 'AU', name: 'Australia', dial: '+61', flag: '\uD83C\uDDE6\uD83C\uDDFA' },
  { code: 'SG', name: 'Singapore', dial: '+65', flag: '\uD83C\uDDF8\uD83C\uDDEC' },
  { code: 'MY', name: 'Malaysia', dial: '+60', flag: '\uD83C\uDDF2\uD83C\uDDFE' },
  { code: 'NZ', name: 'New Zealand', dial: '+64', flag: '\uD83C\uDDF3\uD83C\uDDFF' },
  { code: 'ZA', name: 'South Africa', dial: '+27', flag: '\uD83C\uDDFF\uD83C\uDDE6' },
  { code: 'BD', name: 'Bangladesh', dial: '+880', flag: '\uD83C\uDDE7\uD83C\uDDE9' },
  { code: 'PK', name: 'Pakistan', dial: '+92', flag: '\uD83C\uDDF5\uD83C\uDDF0' },
  { code: 'LK', name: 'Sri Lanka', dial: '+94', flag: '\uD83C\uDDF1\uD83C\uDDF0' },
  { code: 'NP', name: 'Nepal', dial: '+977', flag: '\uD83C\uDDF3\uD83C\uDDF5' },
  { code: 'DE', name: 'Germany', dial: '+49', flag: '\uD83C\uDDE9\uD83C\uDDEA' },
  { code: 'FR', name: 'France', dial: '+33', flag: '\uD83C\uDDEB\uD83C\uDDF7' },
  { code: 'NL', name: 'Netherlands', dial: '+31', flag: '\uD83C\uDDF3\uD83C\uDDF1' },
  { code: 'JP', name: 'Japan', dial: '+81', flag: '\uD83C\uDDEF\uD83C\uDDF5' },
  { code: 'KR', name: 'South Korea', dial: '+82', flag: '\uD83C\uDDF0\uD83C\uDDF7' },
  { code: 'HK', name: 'Hong Kong', dial: '+852', flag: '\uD83C\uDDED\uD83C\uDDF0' },
  { code: 'QA', name: 'Qatar', dial: '+974', flag: '\uD83C\uDDF6\uD83C\uDDE6' },
  { code: 'SA', name: 'Saudi Arabia', dial: '+966', flag: '\uD83C\uDDF8\uD83C\uDDE6' },
  { code: 'KW', name: 'Kuwait', dial: '+965', flag: '\uD83C\uDDF0\uD83C\uDDFC' },
  { code: 'OM', name: 'Oman', dial: '+968', flag: '\uD83C\uDDF4\uD83C\uDDF2' },
];

function CountryCodePicker({ selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = COUNTRIES.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.dial.includes(search)
  );

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setSearch(''); }}
        className="flex h-full items-center gap-1.5 bg-gray-100 px-3 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-gray-200 transition-colors focus:outline-none"
        aria-label="Select country code"
      >
        <span className="text-[15px] leading-none">{selected.flag}</span>
        <span className="text-[12px] text-gray-500 tabular-nums">{selected.dial}</span>
        <ChevronDown size={11} className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.25, 1, 0.5, 1] }}
            className="absolute left-0 top-[calc(100%+6px)] z-[200] w-[260px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.14)]"
          >
            <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
              <Search size={13} className="shrink-0 text-gray-400" />
              <input
                autoFocus
                type="text"
                placeholder="Search country or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="min-w-0 flex-1 border-none bg-transparent text-[12px] outline-none placeholder:text-gray-400"
              />
            </div>
            <div className="max-h-[220px] overflow-y-auto">
              {filtered.length > 0 ? filtered.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => { onSelect(c); setOpen(false); }}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] transition-colors hover:bg-[#FFF0F5] ${selected.code === c.code ? 'bg-[#FFF0F5] font-semibold' : ''}`}
                >
                  <span className="text-[15px]">{c.flag}</span>
                  <span className="flex-1 truncate text-gray-800">{c.name}</span>
                  <span className="shrink-0 text-[11px] tabular-nums text-gray-400">{c.dial}</span>
                </button>
              )) : (
                <p className="px-4 py-4 text-center text-[12px] text-gray-400">No results</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import slide1 from '../assets/images/auth_slide_1.webp';
import slide2 from '../assets/images/auth_slide_2.webp';
import slide3 from '../assets/images/auth_slide_3.webp';

const slides = [slide1, slide2, slide3];

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [authStep, setAuthStep] = useState('PHONE'); // 'PHONE' or 'OTP'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]); // India default
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    otp: '',
  });
  const [error, setError] = useState('');

  // Full E.164 number: country dial + local digits (strip leading 0)
  const fullPhone = selectedCountry.dial + formData.phone.replace(/^0+/, '');
  
  const { requestOtp, verifyOtp, isAuthModalOpen, closeAuthModal, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Auto-close if already authenticated
  useEffect(() => {
    if (isAuthenticated && isAuthModalOpen) {
      closeAuthModal();
    }
  }, [isAuthenticated, isAuthModalOpen, closeAuthModal]);

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
      if (!/^\d{5,15}$/.test(formData.phone.replace(/\s/g, ''))) {
        setError('Please enter a valid phone number (digits only)');
        return;
      }
      if (!isLogin && (!formData.name || !formData.email)) {
        setError('Name and Email are required for signup');
        return;
      }

      setIsSubmitting(true);
      const res = await requestOtp(fullPhone, !isLogin);
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
      const res = await verifyOtp(fullPhone, formData.otp, !isLogin, formData.name, formData.email);
      setIsSubmitting(false);

      if (res.success) {
        if (!isLogin) {
          toast.success('Account created successfully');
          navigate('/');
        } else {
          navigate(res.user?.role === 'admin' ? '/admin' : '/dashboard');
        }
      } else {
        setError(res.error);
      }
    }
  };

  if (!isAuthModalOpen || isAuthenticated) return null;

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
                  <div className="flex overflow-hidden rounded-xl border border-gray-200 bg-gray-50/50 transition-all focus-within:border-[#D4527A] focus-within:ring-1 focus-within:ring-[#D4527A] focus-within:bg-bg-surface">
                    <CountryCodePicker selected={selectedCountry} onSelect={setSelectedCountry} />
                    <div className="w-px shrink-0 bg-gray-200" />
                    <input
                      type="tel"
                      placeholder="Enter mobile number"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value.replace(/[^0-9\s]/g, '')})}
                      className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-[13px] outline-none placeholder:text-gray-400"
                    />
                  </div>
                  {formData.phone && (
                    <p className="mt-1.5 text-[11px] text-gray-400">Full number: <span className="font-semibold text-gray-600">{fullPhone}</span></p>
                  )}
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
                    <p className="text-[13px] text-gray-600">Enter the 4-digit OTP sent to <span className="font-semibold text-gray-900">{fullPhone}</span></p>
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
                    <button type="button" onClick={() => requestOtp(fullPhone, !isLogin)} className="text-[12px] text-gray-500 hover:text-[#D4527A] transition-colors font-medium">Resend OTP</button>
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

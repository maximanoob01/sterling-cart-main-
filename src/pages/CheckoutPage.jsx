import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, CreditCard, Smartphone, Building2, Wallet, Banknote, Shield, Lock, ChevronRight, Home, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';
import { generateOrderId } from '../utils/formatPrice';
import toast from 'react-hot-toast';

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry',
  'Chandigarh', 'Dadra & Nagar Haveli', 'Lakshadweep', 'Andaman & Nicobar Islands',
];

const paymentMethods = [
  { id: 'upi', name: 'UPI', description: 'Google Pay, PhonePe, Paytm', icon: Smartphone },
  { id: 'netbanking', name: 'Net Banking', description: 'All major banks supported', icon: Building2 },
  { id: 'card', name: 'Credit / Debit Card', description: 'Visa, Mastercard, Rupay', icon: CreditCard },
  { id: 'wallet', name: 'Wallet', description: 'Paytm, MobiKwik, Amazon Pay', icon: Wallet },
  { id: 'cod', name: 'Cash on Delivery', description: 'Pay when you receive', icon: Banknote },
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const {
    items,
    subtotal,
    discount,
    shipping,
    gst,
    totalAmount,
    totalItems,
    clearCart,
  } = useCart();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState('upi');
  const [errors, setErrors] = useState({});
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
  });

  useEffect(() => {
    if (items.length === 0 && !isPlacingOrder) {
      navigate('/cart');
    }
  }, [items, navigate, isPlacingOrder]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email address';
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, ''))) newErrors.phone = 'Invalid phone number';
    if (!form.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
    if (!form.city.trim()) newErrors.city = 'City is required';
    if (!form.state) newErrors.state = 'State is required';
    if (!form.pincode.trim()) newErrors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(form.pincode)) newErrors.pincode = 'Invalid pincode';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueToReview = () => {
    if (validateForm()) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleContinueToPayment = () => {
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = () => {
    setIsPlacingOrder(true);
    const orderId = generateOrderId();

    setTimeout(() => {
      clearCart();
      toast.success('Order placed successfully! 🎉', {
        duration: 4000,
        style: { background: '#1A1A1A', color: '#FFF', border: '1px solid #333' },
        iconTheme: { primary: '#D4527A', secondary: '#FFF' },
      });
      navigate('/track-order', { state: { orderId } });
    }, 2000);
  };

  const steps = [
    { number: 1, label: 'Delivery' },
    { number: 2, label: 'Review' },
    { number: 3, label: 'Payment' },
  ];

  if (items.length === 0 && !isPlacingOrder) return null;

  const inputClass = (field) =>
    `w-full h-[40px] px-[16px] border border-white/60 rounded-[12px] font-sans text-[13px] bg-white/50 text-text-main outline-none transition-all duration-300 placeholder:text-text-muted/60 focus:bg-white focus:border-[#D4527A] focus:shadow-[0_2px_10px_rgba(212,82,122,0.1)] ${
      errors[field] ? 'border-[#D4527A] bg-red-50/50' : ''
    }`;

  return (
    <div className="relative min-h-screen pb-[60px] bg-bg-surface overflow-hidden">
      {/* Background Liquid Glass Effects */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#D4527A]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[80px] pointer-events-none" />

      {/* Breadcrumb */}
      <div className="relative z-10 py-[16px] px-5 md:px-10 lg:px-20 text-[11px] font-sans text-text-muted mb-[10px]">
        <div className="max-w-[1320px] mx-auto flex items-center gap-[8px] uppercase tracking-[1px] font-semibold">
          <Link to="/" className="flex items-center gap-1.5 hover:text-[#D4527A] transition-colors">
            <Home size={12} /> Home
          </Link>
          <ChevronRight size={10} className="text-[#C0C0C0]" />
          <Link to="/cart" className="hover:text-[#D4527A] transition-colors">Cart</Link>
          <ChevronRight size={10} className="text-[#C0C0C0]" />
          <span className="text-[#D4527A]">Checkout</span>
        </div>
      </div>

      <div className="relative z-10 max-w-[1320px] mx-auto px-5 md:px-10 lg:px-20">
        <h1 className="font-serif text-[28px] md:text-[36px] text-text-main mb-[20px] text-center">Secure Checkout</h1>

        {/* Progress Bar */}
        <div className="mb-[32px] max-w-xl mx-auto relative">
          <div className="absolute top-[20px] left-[10%] right-[10%] h-[2px] bg-white shadow-sm z-0">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#D4527A] to-[#1A1A1A]"
              initial={{ width: '0%' }}
              animate={{ width: `${((currentStep - 1) / 2) * 100}%` }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            />
          </div>
          <div className="flex items-center justify-between relative z-10">
            {steps.map((step) => (
              <div key={step.number} className="flex flex-col items-center w-[80px]">
                <div
                  className={`w-[40px] h-[40px] rounded-full flex items-center justify-center font-sans text-[13px] font-bold transition-all duration-500 shadow-sm ${
                    currentStep > step.number
                      ? 'bg-[#1A1A1A] text-white border-none'
                      : currentStep === step.number
                      ? 'bg-[#D4527A] text-white shadow-[0_4px_16px_rgba(212,82,122,0.3)] ring-4 ring-[#D4527A]/20 border-none scale-105'
                      : 'glass bg-white/60 border border-white text-text-muted'
                  }`}
                >
                  {currentStep > step.number ? <Check size={16} strokeWidth={3} /> : step.number}
                </div>
                <span
                  className={`font-sans text-[10px] uppercase tracking-[1px] font-bold mt-[10px] transition-colors ${
                    currentStep >= step.number ? 'text-text-main' : 'text-[#A8A8A8]'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-[24px] lg:gap-[40px]">
          {/* Main Content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {/* Step 1: Delivery Details */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="glass-panel rounded-[24px] border border-white/60 p-[20px] md:p-[28px] shadow-xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4527A]/5 rounded-full blur-[30px] pointer-events-none" />
                  
                  <h2 className="font-serif text-[22px] text-text-main mb-[20px] relative z-10">Delivery Details</h2>

                  <div className="space-y-[16px] relative z-10">
                    <div>
                      <label className="block font-sans text-[10px] font-bold uppercase tracking-[1px] text-text-muted mb-[6px]">
                        Full Name <span className="text-[#D4527A]">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={form.fullName}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        className={inputClass('fullName')}
                      />
                      {errors.fullName && <p className="font-sans text-[11px] font-medium text-[#D4527A] mt-[4px]">{errors.fullName}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
                      <div>
                        <label className="block font-sans text-[10px] font-bold uppercase tracking-[1px] text-text-muted mb-[6px]">
                          Email <span className="text-[#D4527A]">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleInputChange}
                          placeholder="your@email.com"
                          className={inputClass('email')}
                        />
                        {errors.email && <p className="font-sans text-[11px] font-medium text-[#D4527A] mt-[4px]">{errors.email}</p>}
                      </div>
                      <div>
                        <label className="block font-sans text-[10px] font-bold uppercase tracking-[1px] text-text-muted mb-[6px]">
                          Phone <span className="text-[#D4527A]">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={form.phone}
                          onChange={handleInputChange}
                          placeholder="10-digit mobile number"
                          className={inputClass('phone')}
                        />
                        {errors.phone && <p className="font-sans text-[11px] font-medium text-[#D4527A] mt-[4px]">{errors.phone}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block font-sans text-[10px] font-bold uppercase tracking-[1px] text-text-muted mb-[6px]">
                        Address Line 1 <span className="text-[#D4527A]">*</span>
                      </label>
                      <input
                        type="text"
                        name="addressLine1"
                        value={form.addressLine1}
                        onChange={handleInputChange}
                        placeholder="House/Flat No., Building Name, Street"
                        className={inputClass('addressLine1')}
                      />
                      {errors.addressLine1 && <p className="font-sans text-[11px] font-medium text-[#D4527A] mt-[4px]">{errors.addressLine1}</p>}
                    </div>

                    <div>
                      <label className="block font-sans text-[10px] font-bold uppercase tracking-[1px] text-text-muted mb-[6px]">
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        name="addressLine2"
                        value={form.addressLine2}
                        onChange={handleInputChange}
                        placeholder="Area, Colony, Locality"
                        className={inputClass('addressLine2')}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
                      <div>
                        <label className="block font-sans text-[10px] font-bold uppercase tracking-[1px] text-text-muted mb-[6px]">
                          City <span className="text-[#D4527A]">*</span>
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={form.city}
                          onChange={handleInputChange}
                          placeholder="Enter city"
                          className={inputClass('city')}
                        />
                        {errors.city && <p className="font-sans text-[11px] font-medium text-[#D4527A] mt-[4px]">{errors.city}</p>}
                      </div>
                      <div>
                        <label className="block font-sans text-[10px] font-bold uppercase tracking-[1px] text-text-muted mb-[6px]">
                          State <span className="text-[#D4527A]">*</span>
                        </label>
                        <div className="relative">
                          <select
                            name="state"
                            value={form.state}
                            onChange={handleInputChange}
                            className={`${inputClass('state')} appearance-none`}
                          >
                            <option value="">Select State</option>
                            {indianStates.map(state => (
                              <option key={state} value={state}>{state}</option>
                            ))}
                          </select>
                          <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none rotate-90" />
                        </div>
                        {errors.state && <p className="font-sans text-[11px] font-medium text-[#D4527A] mt-[4px]">{errors.state}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
                      <div>
                        <label className="block font-sans text-[10px] font-bold uppercase tracking-[1px] text-text-muted mb-[6px]">
                          Pincode <span className="text-[#D4527A]">*</span>
                        </label>
                        <input
                          type="text"
                          name="pincode"
                          value={form.pincode}
                          onChange={handleInputChange}
                          placeholder="6-digit pincode"
                          maxLength={6}
                          className={inputClass('pincode')}
                        />
                        {errors.pincode && <p className="font-sans text-[11px] font-medium text-[#D4527A] mt-[4px]">{errors.pincode}</p>}
                      </div>
                      <div>
                        <label className="block font-sans text-[10px] font-bold uppercase tracking-[1px] text-text-muted mb-[6px]">
                          Landmark <span className="text-text-muted/60 font-normal normal-case tracking-normal">(optional)</span>
                        </label>
                        <input
                          type="text"
                          name="landmark"
                          value={form.landmark}
                          onChange={handleInputChange}
                          placeholder="Nearby landmark"
                          className={inputClass('landmark')}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleContinueToReview}
                    className="w-full mt-[28px] h-[48px] rounded-full bg-[#1A1A1A] text-white text-[12px] font-bold uppercase tracking-[1.5px] hover:bg-[#D4527A] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-[8px] shadow-lg relative z-10"
                  >
                    Continue to Review
                    <ChevronRight size={16} strokeWidth={2.5} />
                  </button>
                </motion.div>
              )}

              {/* Step 2: Order Review */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-[24px]"
                >
                  <div className="glass-panel rounded-[24px] border border-white/60 p-[20px] md:p-[28px] shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4527A]/5 rounded-full blur-[30px] pointer-events-none" />
                    
                    <div className="flex items-center justify-between mb-[16px] relative z-10">
                      <h2 className="font-serif text-[22px] text-text-main">Delivery Address</h2>
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="font-sans text-[10px] uppercase tracking-[1px] font-bold text-[#D4527A] hover:text-text-main transition-colors flex items-center gap-1 bg-white/50 px-3 py-1.5 rounded-full border border-white/60 shadow-sm"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="glass bg-white/40 rounded-[16px] p-[16px] border border-white relative z-10 shadow-sm">
                      <p className="font-serif text-[18px] text-text-main">{form.fullName}</p>
                      <p className="font-sans text-[13px] text-text-muted mt-[8px] leading-relaxed max-w-sm">{form.addressLine1}</p>
                      {form.addressLine2 && <p className="font-sans text-[13px] text-text-muted leading-relaxed max-w-sm">{form.addressLine2}</p>}
                      <p className="font-sans text-[13px] text-text-muted mt-1">
                        {form.city}, {form.state} - {form.pincode}
                      </p>
                      {form.landmark && <p className="font-sans text-[12px] text-[#A8A8A8] mt-[6px] italic">Landmark: {form.landmark}</p>}
                      <p className="font-sans text-[13px] text-text-main font-medium mt-[12px] flex items-center gap-2">
                        {form.phone} <span className="w-1 h-1 rounded-full bg-[#D4527A]" /> {form.email}
                      </p>
                    </div>
                  </div>

                  <div className="glass-panel rounded-[24px] border border-white/60 p-[20px] md:p-[28px] shadow-xl relative overflow-hidden">
                    <h2 className="font-serif text-[22px] text-text-main mb-[16px] relative z-10">
                      Order Items ({totalItems})
                    </h2>
                    <div className="space-y-[16px] relative z-10">
                      {items.map((item) => (
                        <div key={`${item.id}-${item.selectedSize}`} className="flex gap-[16px] items-center py-[12px] border-b border-white last:border-b-0 last:pb-0">
                          <img
                            src={item.images?.[0]}
                            alt={item.name}
                            className="w-[60px] h-[60px] object-cover rounded-[12px] bg-[#F7F5F4] border border-white/50 shadow-sm"
                          />
                          <div className="flex-1 min-w-0 pr-4">
                            <p className="font-serif text-[15px] text-text-main line-clamp-1 leading-[1.3]">{item.name}</p>
                            <div className="flex gap-4 mt-[4px]">
                              {item.selectedSize && (
                                <p className="font-sans text-[11px] uppercase tracking-[0.5px] font-medium text-text-muted">Size: {item.selectedSize}</p>
                              )}
                              <p className="font-sans text-[11px] uppercase tracking-[0.5px] font-medium text-text-muted">Qty: {item.quantity}</p>
                            </div>
                          </div>
                          <p className="font-sans text-[16px] font-semibold text-text-main shrink-0">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-[16px]">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="h-[48px] px-[32px] rounded-full glass bg-white/60 text-text-main border border-white text-[12px] font-bold uppercase tracking-[1px] hover:bg-white transition-all duration-300 flex items-center justify-center gap-[8px] shadow-sm"
                    >
                      <ArrowLeft size={14} strokeWidth={2.5} />
                      Back
                    </button>
                    <button
                      onClick={handleContinueToPayment}
                      className="flex-1 h-[48px] rounded-full bg-[#1A1A1A] text-white text-[12px] font-bold uppercase tracking-[1.5px] hover:bg-[#D4527A] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-[8px] shadow-lg"
                    >
                      Continue to Payment
                      <ChevronRight size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-[24px]"
                >
                  <div className="glass-panel rounded-[24px] border border-white/60 p-[20px] md:p-[28px] shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4527A]/5 rounded-full blur-[30px] pointer-events-none" />
                    
                    <h2 className="font-serif text-[22px] text-text-main mb-[20px] relative z-10">Select Payment Method</h2>

                    <div className="space-y-[12px] relative z-10">
                      {paymentMethods.map((method) => {
                        const Icon = method.icon;
                        return (
                          <label
                            key={method.id}
                            className={`flex items-center gap-[16px] p-[16px] rounded-[16px] border-2 cursor-pointer transition-all duration-300 ${
                              selectedPayment === method.id
                                ? 'border-[#1A1A1A] bg-white/80 shadow-md transform scale-[1.01]'
                                : 'border-white/60 glass bg-white/40 hover:bg-white/60'
                            }`}
                          >
                            <input
                              type="radio"
                              name="payment"
                              value={method.id}
                              checked={selectedPayment === method.id}
                              onChange={(e) => setSelectedPayment(e.target.value)}
                              className="sr-only"
                            />
                            <div
                              className={`w-[20px] h-[20px] rounded-full border-[2px] flex items-center justify-center shrink-0 transition-colors ${
                                selectedPayment === method.id ? 'border-[#1A1A1A]' : 'border-[#C0C0C0] bg-white/50'
                              }`}
                            >
                              {selectedPayment === method.id && (
                                <motion.div 
                                  initial={{ scale: 0 }} 
                                  animate={{ scale: 1 }} 
                                  className="w-[10px] h-[10px] rounded-full bg-[#1A1A1A]" 
                                />
                              )}
                            </div>
                            <div className={`w-[40px] h-[40px] rounded-[12px] flex items-center justify-center shrink-0 transition-colors ${
                              selectedPayment === method.id ? 'bg-[#1A1A1A] text-white shadow-md' : 'bg-white border border-white shadow-sm text-text-muted'
                            }`}>
                              <Icon size={20} strokeWidth={selectedPayment === method.id ? 2 : 1.5} />
                            </div>
                            <div>
                              <p className="font-sans text-[14px] font-semibold text-text-main">{method.name}</p>
                              <p className="font-sans text-[12px] text-[#A8A8A8] mt-[2px] italic">{method.description}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* SSL Badge */}
                  <div className="glass-panel bg-white/80 border border-white rounded-[20px] p-[16px] flex items-center gap-[16px] shadow-sm">
                    <div className="w-[48px] h-[48px] rounded-full bg-green-50 border border-green-100 flex items-center justify-center shrink-0 shadow-sm">
                      <Shield size={24} className="text-[#15803D]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="font-serif text-[16px] text-[#166534] flex items-center gap-[6px] mb-[4px]">
                        <Lock size={14} />
                        Bank-Grade Security
                      </p>
                      <p className="font-sans text-[11px] text-[#15803D] opacity-80">Your payment information is encrypted with 256-bit SSL technology.</p>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-[16px]">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="h-[48px] px-[32px] rounded-full glass bg-white/60 text-text-main border border-white text-[12px] font-bold uppercase tracking-[1px] hover:bg-white transition-all duration-300 flex items-center justify-center gap-[8px] shadow-sm"
                    >
                      <ArrowLeft size={14} strokeWidth={2.5} />
                      Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isPlacingOrder}
                      className="flex-1 h-[48px] rounded-full bg-[#1A1A1A] text-white text-[12px] font-bold uppercase tracking-[1.5px] hover:bg-[#D4527A] transition-all duration-300 flex items-center justify-center gap-[8px] shadow-lg disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-xl hover:-translate-y-0.5"
                    >
                      {isPlacingOrder ? (
                        <>
                          <svg className="animate-spin h-[18px] w-[18px]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          Pay {formatPrice(totalAmount)}
                          <Lock size={14} strokeWidth={2.5} />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="w-full lg:w-[320px] shrink-0">
            <div className="lg:sticky lg:top-[100px]">
              <div className="glass-panel rounded-[24px] p-[24px] shadow-xl border border-white/60 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4527A]/10 rounded-full blur-[30px] pointer-events-none" />
                
                <h3 className="font-serif text-[20px] text-text-main mb-[20px] pb-[16px] border-b border-white relative z-10">
                  Order Summary
                </h3>

                <div className="flex flex-col gap-[12px] font-sans text-[13px] relative z-10">
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted">Subtotal ({totalItems} items)</span>
                    <span className="text-text-main font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted">Shipping</span>
                    {shipping === 0 ? (
                      <span className="text-[#D4527A] font-medium uppercase tracking-[1px] text-[10px]">Complimentary</span>
                    ) : (
                      <span className="text-text-main font-medium">{formatPrice(shipping)}</span>
                    )}
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between items-center text-[#D4527A]">
                      <span>Discount</span>
                      <span className="font-medium">-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted">GST (18%)</span>
                    <span className="text-text-main font-medium">{formatPrice(gst)}</span>
                  </div>
                </div>

                <div className="border-t border-white mt-[20px] pt-[20px] relative z-10">
                  <div className="flex justify-between items-end">
                    <span className="font-serif text-[18px] text-text-main">Total</span>
                    <span className="font-sans text-[22px] font-bold text-text-main">{formatPrice(totalAmount)}</span>
                  </div>
                </div>

                {/* Item Thumbnails */}
                <div className="mt-[24px] pt-[24px] border-t border-white relative z-10">
                  <div className="flex items-center gap-[10px] flex-wrap">
                    {items.slice(0, 4).map((item, i) => (
                      <div key={`${item.id}-${item.selectedSize}-${i}`} className="w-[44px] h-[44px] rounded-[10px] bg-white border border-white/60 p-1 shadow-sm">
                        <img
                          src={item.images?.[0]}
                          alt={item.name}
                          className="w-full h-full rounded-[6px] object-cover"
                        />
                      </div>
                    ))}
                    {items.length > 4 && (
                      <div className="w-[44px] h-[44px] rounded-[10px] glass bg-white/60 flex items-center justify-center font-sans text-[12px] font-bold text-[#D4527A] border border-white shadow-sm">
                        +{items.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

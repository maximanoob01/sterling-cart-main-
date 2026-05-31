import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
        style: { background: '#FFF0F5', color: '#2D2D2D', border: '1px solid #FFE4EE' },
        iconTheme: { primary: '#F4A0B0', secondary: '#FFF' },
      });
      navigate('/track-order', { state: { orderId } });
    }, 1500);
  };

  const steps = [
    { number: 1, label: 'Details' },
    { number: 2, label: 'Review' },
    { number: 3, label: 'Payment' },
  ];

  if (items.length === 0 && !isPlacingOrder) return null;

  const inputClass = (field) =>
    `w-full h-[48px] px-[16px] border border-border-main rounded-[12px] font-sans text-[14px] bg-bg-surface text-text-main outline-none transition-colors ${
      errors[field]
        ? 'border-red-400 bg-red-50'
        : 'focus:border-[#1A1A1A]'
    }`;

  return (
    <div className="min-h-screen bg-[#FFFAF9] pb-[80px]">
      {/* Breadcrumb */}
      <div className="bg-[#FFF0F5] border-b border-[#F4A0B0]/30 py-[16px]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20 text-[13px] font-sans text-text-main">
          <nav className="flex items-center gap-[8px]">
            <Link to="/" className="flex items-center gap-1 hover:text-[#F4A0B0] transition-colors">
              <Home size={14} /> Home
            </Link>
            <ChevronRight size={12} className="text-[#A8A8A8]" />
            <Link to="/cart" className="hover:text-[#F4A0B0] transition-colors">Cart</Link>
            <ChevronRight size={12} className="text-[#A8A8A8]" />
            <span className="text-[#F4A0B0] font-medium">Checkout</span>
          </nav>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20 py-[40px] md:py-[56px]">
        {/* Progress Bar */}
        <div className="mb-[48px] max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <div key={step.number} className="flex items-center flex-1 last:flex-none">
                {/* Step Circle */}
                <div className="flex flex-col items-center relative z-10 w-[120px]">
                  <div
                    className={`w-[40px] h-[40px] rounded-full flex items-center justify-center font-sans text-[14px] font-medium transition-all duration-300 ${
                      currentStep > step.number
                        ? 'bg-[#1A1A1A] text-white'
                        : currentStep === step.number
                        ? 'bg-[#1A1A1A] text-white shadow-[0_4px_16px_rgba(26,26,26,0.15)]'
                        : 'bg-bg-surface border-[2px] border-border-main text-[#A8A8A8]'
                    }`}
                  >
                    {currentStep > step.number ? <Check size={18} /> : step.number}
                  </div>
                  <span
                    className={`font-sans text-[13px] font-medium mt-[12px] absolute top-[44px] whitespace-nowrap ${
                      currentStep >= step.number ? 'text-text-main' : 'text-[#A8A8A8]'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector Line */}
                {idx < steps.length - 1 && (
                  <div className="flex-1 h-[2px] mx-[-40px] z-0">
                    <div
                      className={`h-full transition-all duration-500 ${
                        currentStep > step.number ? 'bg-[#1A1A1A]' : 'bg-[#E8E8E8]'
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-[48px] mt-[64px]">
          {/* Main Content */}
          <div className="flex-1">
            {/* Step 1: Delivery Details */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-bg-surface rounded-[16px] border border-border-main p-[32px] shadow-[0_2px_16px_rgba(0,0,0,0.04)]"
              >
                <h2 className="font-serif text-[24px] font-bold text-text-main mb-[24px]">Delivery Details</h2>

                <div className="space-y-[20px]">
                  {/* Full Name */}
                  <div>
                    <label className="block font-sans text-[13px] font-medium text-text-main mb-[8px]">
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
                    {errors.fullName && <p className="font-sans text-[12px] text-red-500 mt-[4px]">{errors.fullName}</p>}
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-[20px]">
                    <div>
                      <label className="block font-sans text-[13px] font-medium text-text-main mb-[8px]">
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
                      {errors.email && <p className="font-sans text-[12px] text-red-500 mt-[4px]">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block font-sans text-[13px] font-medium text-text-main mb-[8px]">
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
                      {errors.phone && <p className="font-sans text-[12px] text-red-500 mt-[4px]">{errors.phone}</p>}
                    </div>
                  </div>

                  {/* Address Line 1 */}
                  <div>
                    <label className="block font-sans text-[13px] font-medium text-text-main mb-[8px]">
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
                    {errors.addressLine1 && <p className="font-sans text-[12px] text-red-500 mt-[4px]">{errors.addressLine1}</p>}
                  </div>

                  {/* Address Line 2 */}
                  <div>
                    <label className="block font-sans text-[13px] font-medium text-text-main mb-[8px]">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      name="addressLine2"
                      value={form.addressLine2}
                      onChange={handleInputChange}
                      placeholder="Area, Colony, Locality"
                      className="w-full h-[48px] px-[16px] border border-border-main rounded-[12px] font-sans text-[14px] bg-bg-surface text-text-main outline-none transition-colors focus:border-[#1A1A1A]"
                    />
                  </div>

                  {/* City & State */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-[20px]">
                    <div>
                      <label className="block font-sans text-[13px] font-medium text-text-main mb-[8px]">
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
                      {errors.city && <p className="font-sans text-[12px] text-red-500 mt-[4px]">{errors.city}</p>}
                    </div>
                    <div>
                      <label className="block font-sans text-[13px] font-medium text-text-main mb-[8px]">
                        State <span className="text-[#D4527A]">*</span>
                      </label>
                      <select
                        name="state"
                        value={form.state}
                        onChange={handleInputChange}
                        className={inputClass('state')}
                      >
                        <option value="">Select State</option>
                        {indianStates.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                      {errors.state && <p className="font-sans text-[12px] text-red-500 mt-[4px]">{errors.state}</p>}
                    </div>
                  </div>

                  {/* Pincode & Landmark */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-[20px]">
                    <div>
                      <label className="block font-sans text-[13px] font-medium text-text-main mb-[8px]">
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
                      {errors.pincode && <p className="font-sans text-[12px] text-red-500 mt-[4px]">{errors.pincode}</p>}
                    </div>
                    <div>
                      <label className="block font-sans text-[13px] font-medium text-text-main mb-[8px]">
                        Landmark <span className="text-[#A8A8A8] font-normal">(optional)</span>
                      </label>
                      <input
                        type="text"
                        name="landmark"
                        value={form.landmark}
                        onChange={handleInputChange}
                        placeholder="Nearby landmark"
                        className="w-full h-[48px] px-[16px] border border-border-main rounded-[12px] font-sans text-[14px] bg-bg-surface text-text-main outline-none transition-colors focus:border-[#1A1A1A]"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleContinueToReview}
                  className="btn-primary w-full mt-[32px] h-[56px] text-[15px] flex items-center justify-center gap-[8px]"
                >
                  Continue to Review
                  <ChevronRight size={18} />
                </button>
              </motion.div>
            )}

            {/* Step 2: Order Review */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-[24px]"
              >
                {/* Delivery Address */}
                <div className="bg-bg-surface rounded-[16px] border border-border-main p-[32px] shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
                  <div className="flex items-center justify-between mb-[16px]">
                    <h2 className="font-serif text-[20px] font-bold text-text-main">Delivery Address</h2>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="font-sans text-[13px] text-[#D4527A] hover:text-[#F4A0B0] font-medium transition-colors"
                    >
                      Edit Address
                    </button>
                  </div>
                  <div className="bg-[#FAFAFA] rounded-[12px] p-[16px] border border-border-main">
                    <p className="font-sans font-semibold text-text-main text-[14px]">{form.fullName}</p>
                    <p className="font-sans text-[14px] text-text-muted mt-[8px]">{form.addressLine1}</p>
                    {form.addressLine2 && <p className="font-sans text-[14px] text-text-muted">{form.addressLine2}</p>}
                    <p className="font-sans text-[14px] text-text-muted">
                      {form.city}, {form.state} - {form.pincode}
                    </p>
                    {form.landmark && <p className="font-sans text-[14px] text-[#A8A8A8] mt-[4px]">Landmark: {form.landmark}</p>}
                    <p className="font-sans text-[14px] text-text-main font-medium mt-[12px]">{form.phone} • {form.email}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-bg-surface rounded-[16px] border border-border-main p-[32px] shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
                  <h2 className="font-serif text-[20px] font-bold text-text-main mb-[16px]">
                    Order Items ({totalItems})
                  </h2>
                  <div className="space-y-[16px]">
                    {items.map((item) => (
                      <div key={`${item.id}-${item.selectedSize}`} className="flex gap-[16px] items-center py-[12px] border-b border-border-main last:border-b-0 last:pb-0">
                        <img
                          src={item.images?.[0]}
                          alt={item.name}
                          className="w-[64px] h-[64px] object-cover rounded-[8px] bg-[#FAFAFA]"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-[14px] font-medium text-text-main line-clamp-1 leading-[1.4]">{item.name}</p>
                          {item.selectedSize && (
                            <p className="font-sans text-[12px] text-[#A8A8A8] mt-[4px]">Size: {item.selectedSize}</p>
                          )}
                          <p className="font-sans text-[12px] text-[#A8A8A8] mt-[2px]">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-sans text-[14px] font-semibold text-text-main shrink-0">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-[16px]">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="btn-secondary h-[56px] px-[32px] flex items-center justify-center gap-[8px]"
                  >
                    <ArrowLeft size={16} />
                    Edit Address
                  </button>
                  <button
                    onClick={handleContinueToPayment}
                    className="btn-primary flex-1 h-[56px] text-[15px] flex items-center justify-center gap-[8px]"
                  >
                    Continue to Payment
                    <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-[24px]"
              >
                <div className="bg-bg-surface rounded-[16px] border border-border-main p-[32px] shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
                  <h2 className="font-serif text-[20px] font-bold text-text-main mb-[24px]">Select Payment Method</h2>

                  <div className="space-y-[16px]">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      return (
                        <label
                          key={method.id}
                          className={`flex items-center gap-[16px] p-[16px] rounded-[12px] border-[2px] cursor-pointer transition-all ${
                            selectedPayment === method.id
                              ? 'border-[#1A1A1A] bg-[#FAFAFA]'
                              : 'border-border-main hover:border-[#C0C0C0]'
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
                            className={`w-[20px] h-[20px] rounded-full border-[2px] flex items-center justify-center shrink-0 ${
                              selectedPayment === method.id ? 'border-[#1A1A1A]' : 'border-[#C0C0C0]'
                            }`}
                          >
                            {selectedPayment === method.id && (
                              <div className="w-[10px] h-[10px] rounded-full bg-[#1A1A1A]" />
                            )}
                          </div>
                          <div className={`w-[40px] h-[40px] rounded-[10px] flex items-center justify-center shrink-0 ${
                            selectedPayment === method.id ? 'bg-[#1A1A1A] text-white' : 'bg-[#FAFAFA] text-text-muted'
                          }`}>
                            <Icon size={20} />
                          </div>
                          <div>
                            <p className="font-sans text-[14px] font-medium text-text-main">{method.name}</p>
                            <p className="font-sans text-[12px] text-[#A8A8A8] mt-[2px]">{method.description}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* SSL Badge */}
                <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-[12px] p-[16px] flex items-center gap-[16px]">
                  <div className="w-[40px] h-[40px] rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0">
                    <Shield size={20} className="text-[#15803D]" />
                  </div>
                  <div>
                    <p className="font-sans text-[14px] font-semibold text-[#166534] flex items-center gap-[4px] mb-[4px]">
                      <Lock size={14} />
                      SSL Secure Checkout
                    </p>
                    <p className="font-sans text-[12px] text-[#15803D]">Your data is 100% protected with 256-bit encryption</p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-[16px]">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="btn-secondary h-[56px] px-[32px] flex items-center justify-center gap-[8px]"
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder}
                    className="btn-primary flex-1 h-[56px] text-[15px] flex items-center justify-center gap-[8px] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isPlacingOrder ? (
                      <>
                        <svg className="animate-spin h-[20px] w-[20px]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Placing Order...
                      </>
                    ) : (
                      <>
                        Place Order • {formatPrice(totalAmount)}
                        <ChevronRight size={18} />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="w-full lg:w-[320px] shrink-0">
            <div className="lg:sticky lg:top-[100px]">
              <div className="bg-[#FFF0F5] rounded-[16px] p-[24px] shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
                <h3 className="font-serif text-[18px] font-bold text-text-main mb-[16px] pb-[16px] border-b border-[#F4A0B0]/30">
                  Order Summary
                </h3>

                <div className="flex flex-col gap-[12px] font-sans text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Subtotal ({totalItems} items)</span>
                    <span className="text-text-main font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Shipping</span>
                    {shipping === 0 ? (
                      <span className="text-[#D4527A] font-medium">Free</span>
                    ) : (
                      <span className="text-text-main font-medium">{formatPrice(shipping)}</span>
                    )}
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[#D4527A]">
                      <span>Discount</span>
                      <span className="font-medium">-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-text-muted">GST (18%)</span>
                    <span className="text-text-main font-medium">{formatPrice(gst)}</span>
                  </div>
                </div>

                <div className="border-t border-[#F4A0B0]/30 mt-[16px] pt-[16px]">
                  <div className="flex justify-between items-center">
                    <span className="font-serif text-[16px] font-bold text-text-main">Total</span>
                    <span className="font-serif text-[20px] font-bold text-text-main">{formatPrice(totalAmount)}</span>
                  </div>
                </div>

                {/* Item Thumbnails */}
                <div className="mt-[24px] pt-[24px] border-t border-[#F4A0B0]/30">
                  <div className="flex items-center gap-[8px] flex-wrap">
                    {items.slice(0, 4).map((item, i) => (
                      <img
                        key={`${item.id}-${item.selectedSize}-${i}`}
                        src={item.images?.[0]}
                        alt={item.name}
                        className="w-[48px] h-[48px] rounded-[8px] object-cover bg-bg-surface border border-border-main"
                      />
                    ))}
                    {items.length > 4 && (
                      <div className="w-[48px] h-[48px] rounded-[8px] bg-bg-surface flex items-center justify-center font-sans text-[12px] font-semibold text-text-muted border border-border-main">
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

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, CreditCard, Smartphone, Building2, Wallet, Banknote, Shield, Lock, ChevronRight, Home, ArrowLeft, Scale, ShoppingCart, ChevronDown, Sparkles, ArrowRight, Gift, Coins, Star, X, PenTool } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { useLoyalty } from '../context/LoyaltyContext';
import { getItemPrice } from '../context/CartContext';
import { generateOrderId } from '../utils/formatPrice';
import api from '../services/api';
import toast from 'react-hot-toast';
import FreeDeliveryBar from '../components/cart/FreeDeliveryBar';
import { VisaLogo, MastercardLogo, AmexLogo, RazorpayLogo, GPayLogo, PhonePeLogo, PaytmLogo, RupayLogo, AmazonPayLogo, MobikwikLogo, BankLogo, CashLogo } from '../components/ui/PaymentLogos';

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
  { id: 'upi', name: 'UPI', description: 'Google Pay, PhonePe, Paytm', icon: Smartphone, logos: [GPayLogo, PhonePeLogo, PaytmLogo] },
  { id: 'netbanking', name: 'Net Banking', description: 'All major banks supported', icon: Building2, logos: [BankLogo] },
  { id: 'card', name: 'Credit / Debit Card', description: 'Visa, Mastercard, Rupay', icon: CreditCard, logos: [VisaLogo, MastercardLogo, RupayLogo] },
  { id: 'wallet', name: 'Wallet', description: 'Paytm, MobiKwik, Amazon Pay', icon: Wallet, logos: [PaytmLogo, MobikwikLogo, AmazonPayLogo] },
  { id: 'cod', name: 'Cash on Delivery', description: 'Pay when you receive', icon: Banknote, logos: [CashLogo] },
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
  const { formatPrice, currency } = useCurrency();
  const { isAuthenticated } = useAuth();
  const { balance, refreshLoyalty, maxRedeemable, pointsEarned } = useLoyalty();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState('upi');
  const [errors, setErrors] = useState({});
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState(null);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [isGiftWrapped, setIsGiftWrapped] = useState(false);
  const [giftNote, setGiftNote] = useState('');
  const [isGiftDetailsOpen, setIsGiftDetailsOpen] = useState(false);
  const [loyaltyApplied, setLoyaltyApplied] = useState(false);
  const [loyaltyInput, setLoyaltyInput] = useState('');
  const [appliedPoints, setAppliedPoints] = useState(0);
  const [showLoyaltyEarnedDialog, setShowLoyaltyEarnedDialog] = useState(false);

  const codFee = selectedPayment === 'cod' ? 9 : 0;
  const giftWrapFee = isGiftWrapped ? 49 : 0;
  const loyaltyDiscount = appliedPoints; // 1 pt = ₹1
  const finalTotalAmount = Math.max(0, totalAmount + codFee + giftWrapFee - loyaltyDiscount);

  // How many points this order will earn (10% of final)
  const willEarnPoints = pointsEarned(finalTotalAmount);
  // Max redeemable for this order
  const orderMaxRedeemable = maxRedeemable(totalAmount + codFee + giftWrapFee, balance);

  const handleApplyLoyalty = () => {
    const pts = parseInt(loyaltyInput, 10);
    if (!pts || pts <= 0) { toast.error('Enter a valid number of points'); return; }
    if (pts > balance) { toast.error(`You only have ${balance} pts`); return; }
    if (pts > orderMaxRedeemable) { toast.error(`Max redeemable for this order is ${orderMaxRedeemable} pts`); return; }
    setAppliedPoints(pts);
    setLoyaltyApplied(true);
    toast.success(`✨ ${pts} Royal Points applied!`, {
      style: { background: '#FFF0F5', color: '#2D2D2D', border: '1px solid #F4A0B0' },
      iconTheme: { primary: '#D4527A', secondary: '#FFF' },
    });
  };

  const handleRemoveLoyalty = () => {
    setAppliedPoints(0);
    setLoyaltyApplied(false);
    setLoyaltyInput('');
  };

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
    if (items.length === 0 && !isPlacingOrder && !orderSuccessData) {
      navigate('/cart');
    }
  }, [items, navigate, isPlacingOrder, orderSuccessData]);

  // Sequence: success screen (3 s) → exit animation (0.8 s) → loyalty dialog → redirect
  useEffect(() => {
    if (orderSuccessData) {
      setShowSuccessScreen(true);
      // Hide success card after 3 s (exit animation takes ~0.8 s)
      const hideSuccessTimer = setTimeout(() => setShowSuccessScreen(false), 3000);
      // Show loyalty dialog after success card is fully gone
      const dialogTimer = setTimeout(() => setShowLoyaltyEarnedDialog(true), 3900);
      // Auto-redirect if user doesn't interact with dialog
      const redirectTimer = setTimeout(() => {
        navigate('/shop', { state: { showTrackOrderPointer: true } });
      }, 9000);
      return () => {
        clearTimeout(hideSuccessTimer);
        clearTimeout(dialogTimer);
        clearTimeout(redirectTimer);
      };
    }
  }, [orderSuccessData, navigate]);

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

  const createOrderOnBackend = async (paymentId, razorpayOrderId) => {
    const orderPayload = {
      form,
      items: items.map(item => ({
        productId: item._id || item.id,
        name: item.name,
        qty: item.quantity,
        price: getItemPrice(item),
        size: item.selectedSize,
        engravingText: item.engravingText,
      })),
      paymentMethod: selectedPayment,
      razorpayPaymentId: paymentId || null,
      razorpayOrderId: razorpayOrderId || null,
      isGiftWrapped,
      giftNote,
      couponCode: null, // TODO: pass coupon if applied
      loyaltyPointsUsed: appliedPoints,
    };

    try {
      const res = await api.post('/orders', orderPayload);
      if (res.success) {
        toast.success('Order placed successfully!');
        return res;
      }
    } catch (err) {
      console.error('Order API error:', err);
      toast.error('Order placed, but confirmation may be delayed.');
    }
    return { order: { orderId: generateOrderId() }, earnedPoints: 0 };
  };

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);

    try {
      // COD — skip Razorpay, create order directly
      if (selectedPayment === 'cod') {
        const res = await createOrderOnBackend(null, null);
        const earned = res.earnedPoints || 0;

        if (isAuthenticated) await refreshLoyalty();

        clearCart();
        setIsPlacingOrder(false);
        setOrderSuccessData({ orderId: res.order?.orderId || generateOrderId(), earnedPoints: earned });
        return;
      }

      // Online payment — create Razorpay order
      let rzpOrder;
      try {
        rzpOrder = await api.post('/payments/create-order', {
          amount: finalTotalAmount,
          currency: currency === 'USD' ? 'USD' : 'INR',
          receipt: `rcpt_${Date.now()}`,
        });
      } catch (err) {
        // Razorpay unavailable — fallback to direct order
        console.warn('Razorpay unavailable, creating order directly:', err.message);
        const res = await createOrderOnBackend(null, null);
        clearCart();
        setIsPlacingOrder(false);
        setOrderSuccessData({ orderId: res.order?.orderId || generateOrderId(), earnedPoints: res.earnedPoints || 0 });
        return;
      }

      // Open Razorpay checkout modal
      const options = {
        key: rzpOrder.key || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: rzpOrder.order.amount,
        currency: rzpOrder.order.currency,
        name: 'Sterling Kart',
        description: `Order for ${totalItems} item(s)`,
        order_id: rzpOrder.order.id,
        prefill: {
          name: form.fullName,
          email: form.email,
          contact: form.phone,
        },
        theme: { color: '#D4527A' },
        handler: async (response) => {
          // Verify payment
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
          } catch (err) {
            console.error('Payment verification failed:', err);
          }

          // Create order with payment details
          const res = await createOrderOnBackend(response.razorpay_payment_id, response.razorpay_order_id);
          const earned = res.earnedPoints || 0;

          if (isAuthenticated) await refreshLoyalty();

          clearCart();
          setIsPlacingOrder(false);
          setOrderSuccessData({ orderId: res.order?.orderId || generateOrderId(), earnedPoints: earned });
        },
        modal: {
          ondismiss: () => {
            setIsPlacingOrder(false);
            toast.error('Payment cancelled');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Checkout error:', error);
      setIsPlacingOrder(false);
      toast.error('Something went wrong. Please try again.');
    }
  };

  const steps = [
    { number: 1, label: 'Delivery' },
    { number: 2, label: 'Review' },
    { number: 3, label: 'Payment' },
  ];

  if (orderSuccessData) {
    return (
      <div className="fixed inset-0 z-50 bg-[#1A1A1A] flex flex-col items-center justify-center p-6 overflow-hidden">
        {/* Background Particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full ${i % 3 === 0 ? 'bg-[#D4527A]' : i % 3 === 1 ? 'bg-[#F4A0B0]' : 'bg-white'}`}
            style={{
              width: Math.random() * 10 + 5 + 'px',
              height: Math.random() * 10 + 5 + 'px',
              top: '50%',
              left: '50%',
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
            animate={{ 
              x: (Math.random() - 0.5) * (typeof window !== 'undefined' ? window.innerWidth : 800) * 1.5,
              y: (Math.random() - 0.5) * (typeof window !== 'undefined' ? window.innerHeight : 800) * 1.5,
              opacity: 0,
              scale: Math.random() * 1.5 + 0.5,
              rotate: Math.random() * 360
            }}
            transition={{ duration: Math.random() * 2 + 1.5, ease: 'easeOut' }}
          />
        ))}

        {/* ── Success Card (exits after 3 s) ── */}
        <AnimatePresence mode="wait">
          {showSuccessScreen && (
            <motion.div
              key="success-card"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0, y: -30 }}
              transition={{ type: 'spring', duration: 0.8, bounce: 0.4 }}
              className="relative z-10 glass-panel bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-[32px] text-center max-w-md w-full shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2, duration: 0.6 }}
                className="w-24 h-24 bg-[#D4527A] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_60px_rgba(212,82,122,0.6)] relative"
              >
                <Check size={48} strokeWidth={3} className="text-white" />
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 border-[4px] border-dashed border-white/40 rounded-full" 
                />
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                <h1 className="font-serif text-[32px] md:text-[40px] text-white mb-2 flex items-center justify-center gap-3">
                  <Sparkles className="text-[#F4A0B0]" size={28} />
                  Success!
                  <Sparkles className="text-[#F4A0B0]" size={28} />
                </h1>
                <p className="font-sans text-[14px] text-white/70 mb-8 max-w-[280px] mx-auto leading-relaxed">
                  Your order is confirmed. We're packing it with care and getting it ready for delivery.
                </p>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6"
              >
                <p className="font-sans text-[11px] uppercase tracking-[2px] font-bold text-[#D4527A] mb-1">Order Number</p>
                <p className="font-sans text-[20px] font-bold tracking-[1.5px] text-white">{orderSuccessData.orderId}</p>
              </motion.div>

              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ delay: 0.6 }}
                onClick={() => navigate('/shop', { state: { showTrackOrderPointer: true } })}
                className="w-full h-[54px] bg-white text-[#1A1A1A] rounded-full font-bold text-[13px] tracking-[1.5px] uppercase flex items-center justify-center gap-2 hover:bg-[#D4527A] hover:text-white transition-all duration-300 shadow-lg"
              >
                Continue Shopping
                <ArrowRight size={18} strokeWidth={2.5} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Loyalty Points Earned Dialog ── */}
        <AnimatePresence>
          {showLoyaltyEarnedDialog && isAuthenticated && orderSuccessData.earnedPoints > 0 && (
            <motion.div
              initial={{ scale: 0.7, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              className="relative z-10 max-w-sm w-full rounded-[28px] overflow-hidden shadow-[0_32px_80px_rgba(212,82,122,0.5)]"
            >
                {/* Gradient top band */}
                <div className="h-2 w-full bg-gradient-to-r from-[#D4527A] via-[#F4A0B0] to-[#D4527A]" />

                <div className="bg-[#1A1A1A] border border-white/10 px-8 py-8 text-center relative">
                  <button
                    onClick={() => setShowLoyaltyEarnedDialog(false)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
                  >
                    <X size={14} />
                  </button>

                  {/* Coin animation */}
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 10, 0], y: [0, -6, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-[#D4527A] to-[#F4A0B0] flex items-center justify-center shadow-[0_0_40px_rgba(212,82,122,0.5)]"
                  >
                    <Coins size={36} className="text-white" />
                  </motion.div>

                  {/* Sparkle dots */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1.5 h-1.5 rounded-full bg-[#F4A0B0]"
                      style={{
                        top: `${20 + Math.sin(i * 60 * Math.PI / 180) * 50}%`,
                        left: `${50 + Math.cos(i * 60 * Math.PI / 180) * 40}%`,
                      }}
                      animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.25 }}
                    />
                  ))}

                  <p className="font-sans text-[11px] uppercase tracking-[2.5px] font-bold text-[#F4A0B0] mb-2">Congratulations!</p>
                  <h2 className="font-serif text-[28px] text-white leading-tight mb-1">
                    You earned
                  </h2>
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D4527A]/20 to-[#F4A0B0]/10 border border-[#D4527A]/30 rounded-full px-5 py-2 my-3">
                    <Coins size={18} className="text-[#F4A0B0]" />
                    <span className="font-sans text-[26px] font-black text-white">{orderSuccessData.earnedPoints}</span>
                    <span className="font-sans text-[13px] font-bold text-[#F4A0B0]">Royal Points</span>
                  </div>
                  <p className="font-sans text-[13px] text-white/60 leading-relaxed mt-2">
                    Redeem them on your next order for an instant discount!
                  </p>

                  <div className="mt-6 flex flex-col gap-3">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => navigate('/dashboard')}
                      className="w-full h-11 bg-gradient-to-r from-[#D4527A] to-[#B94B68] text-white rounded-full font-bold text-[12px] tracking-[1.2px] uppercase flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(212,82,122,0.4)] hover:shadow-[0_6px_28px_rgba(212,82,122,0.5)] transition-all"
                    >
                      <Star size={14} className="fill-white" /> View in My Profile
                    </motion.button>
                    <button
                      onClick={() => { setShowLoyaltyEarnedDialog(false); navigate('/shop'); }}
                      className="w-full h-11 border border-white/15 rounded-full text-white/60 font-semibold text-[12px] hover:text-white hover:border-white/30 transition-all"
                    >
                      Continue Shopping
                    </button>
                  </div>
                </div>
              </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

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

        <div className="flex flex-col lg:flex-row gap-[20px] lg:gap-[40px] items-start">
          
          {/* Mobile Order Summary Toggle */}
          <div className="w-full block lg:hidden relative z-20">
            <button 
              onClick={() => setIsMobileSummaryOpen(!isMobileSummaryOpen)}
              className="w-full flex items-center justify-between glass-panel bg-white/70 p-[16px] rounded-[16px] border border-white/60 shadow-sm transition-all active:scale-[0.99]"
            >
              <span className="flex items-center gap-2 font-serif text-[16px] text-text-main">
                <ShoppingCart size={16} className="text-[#D4527A]" />
                {isMobileSummaryOpen ? 'Hide' : 'Show'} Order Summary
              </span>
              <div className="flex items-center gap-3">
                <span className="font-sans text-[16px] font-bold text-text-main">{formatPrice(finalTotalAmount)}</span>
                <ChevronDown size={18} className={`text-text-muted transition-transform duration-300 ${isMobileSummaryOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 w-full order-2 lg:order-1">
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
                        <div key={`${item.id}-${item.selectedSize}`} className="flex gap-[16px] items-start py-[12px] border-b border-white last:border-b-0 last:pb-0">
                          <img
                            src={item.images?.[0]}
                            alt={item.name}
                            className="w-[60px] h-[60px] object-cover rounded-[12px] bg-[#F7F5F4] border border-white/50 shadow-sm shrink-0"
                          />
                          <div className="flex-1 min-w-0 pr-4">
                            <p className="font-serif text-[15px] text-text-main line-clamp-1 leading-[1.3]">{item.name}</p>
                            <div className="flex gap-4 mt-[4px]">
                              {item.selectedSize && (
                                <p className="font-sans text-[11px] uppercase tracking-[0.5px] font-medium text-text-muted">Size: {item.selectedSize}</p>
                              )}
                              <p className="font-sans text-[11px] uppercase tracking-[0.5px] font-medium text-text-muted">Qty: {item.quantity}</p>
                            </div>
                            {item.pricingType === 'weight' && (
                              <p className="font-sans text-[11px] text-[#D4527A] mt-1 flex items-center gap-1">
                                <Scale size={10} /> {item.weightGrams}g silver + making charges
                              </p>
                            )}
                            {item.engravingText && (
                              <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#FFF0F5] border border-[#F4A0B0]/30 text-[#D4527A] font-medium text-[10.5px]">
                                <PenTool size={10} /> Engraving: "{item.engravingText}"
                              </div>
                            )}
                          </div>
                          <p className="font-sans text-[16px] font-semibold text-text-main shrink-0">
                            {formatPrice(getItemPrice(item) * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-[12px] sm:gap-[16px]">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="self-start sm:self-auto h-[44px] sm:h-[48px] px-[24px] sm:px-[32px] rounded-full glass bg-white/60 text-text-main border border-white text-[12px] font-bold uppercase tracking-[1px] hover:bg-white transition-all duration-300 flex items-center justify-center gap-[8px] shadow-sm"
                    >
                      <ArrowLeft size={14} strokeWidth={2.5} />
                      Back
                    </button>
                    <button
                      onClick={handleContinueToPayment}
                      className="w-full sm:flex-1 h-[58px] sm:h-[48px] rounded-full bg-[#1A1A1A] text-white text-[15px] sm:text-[12px] font-bold uppercase tracking-[1.5px] hover:bg-[#D4527A] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-[10px] shadow-lg"
                    >
                      Continue to Payment
                      <ChevronRight size={20} strokeWidth={2.5} />
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
                      <div className="grid grid-cols-1 gap-[12px]">
                        {paymentMethods.map((method) => {
                          const Icon = method.icon;
                          return (
                            <label
                              key={method.id}
                              className={`group flex items-center gap-[12px] sm:gap-[16px] p-[12px] sm:p-[16px] rounded-[16px] border-2 cursor-pointer transition-all duration-300 ${
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
                                <p className="font-sans text-[13px] sm:text-[14px] font-semibold text-text-main">{method.name}</p>
                                <p className="font-sans text-[11px] sm:text-[12px] text-[#A8A8A8] mt-[2px] italic line-clamp-1">{method.description}</p>
                              </div>
                              <div className="ml-auto flex items-center gap-[4px] shrink-0">
                                {method.logos?.map((Logo, idx) => (
                                  <div key={idx} className={`shrink-0 scale-[0.7] sm:scale-[0.85] transition-opacity duration-300 ${selectedPayment === method.id ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
                                    <Logo />
                                  </div>
                                ))}
                              </div>
                            </label>
                          );
                        })}
                      </div>
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

                  {/* International Checkout Notice */}
                  <div className="glass-panel bg-[#FFF0F5]/30 border border-[#F4A0B0]/30 rounded-[20px] p-[16px] shadow-sm">
                    <p className="font-sans text-[13px] font-semibold text-text-main flex items-center gap-2 mb-2">
                      <span className="text-[16px]">🌍</span> Secure International Checkout
                    </p>
                    <p className="font-sans text-[11px] text-text-muted leading-relaxed mb-3">
                      Payments processed safely through <span className="font-bold text-text-main">Razorpay</span>. We accept Visa, Mastercard, American Express, and other major international cards.
                    </p>
                    <div className="flex items-center gap-3">
                      <VisaLogo />
                      <MastercardLogo />
                      <AmexLogo />
                      <div className="w-[1px] h-4 bg-[#F0E8EA] mx-1"></div>
                      <RazorpayLogo />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-[12px] sm:gap-[16px]">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="self-start sm:self-auto h-[44px] sm:h-[48px] px-[24px] sm:px-[32px] rounded-full glass bg-white/60 text-text-main border border-white text-[12px] font-bold uppercase tracking-[1px] hover:bg-white transition-all duration-300 flex items-center justify-center gap-[8px] shadow-sm"
                    >
                      <ArrowLeft size={14} strokeWidth={2.5} />
                      Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isPlacingOrder}
                      className="w-full sm:flex-1 h-[58px] sm:h-[48px] rounded-full bg-[#1A1A1A] text-white text-[15px] sm:text-[12px] font-bold uppercase tracking-[1.5px] hover:bg-[#D4527A] transition-all duration-300 flex items-center justify-center gap-[10px] shadow-lg disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-xl hover:-translate-y-0.5"
                    >
                      {isPlacingOrder ? (
                        <>
                          <svg className="animate-spin h-[20px] w-[20px]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          Pay {formatPrice(finalTotalAmount)}
                          <Lock size={16} strokeWidth={2.5} />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className={`w-full lg:w-[320px] shrink-0 order-1 lg:order-2 ${isMobileSummaryOpen ? 'block' : 'hidden lg:block'}`}>
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
                      <span className="text-[#D4527A] font-semibold text-[12px] uppercase tracking-[0.5px]">FREE ✓</span>
                    ) : (
                      <span className="text-text-main font-medium">{formatPrice(shipping)} <span className="text-[11px] text-text-muted">(free above ₹2,499)</span></span>
                    )}
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between items-center text-[#D4527A]">
                      <span>Coupon Discount</span>
                      <span className="font-medium">-{formatPrice(discount)}</span>
                    </div>
                  )}

                  {selectedPayment === 'cod' && (
                    <div className="flex justify-between items-center">
                      <span className="text-text-muted">Handling Fee (COD)</span>
                      <span className="text-text-main font-medium">{formatPrice(codFee)}</span>
                    </div>
                  )}
                  {isGiftWrapped && (
                    <div className="flex justify-between items-center text-[#D4527A]">
                      <span className="flex items-center gap-1.5"><Gift size={12} /> Gift Packing</span>
                      <span className="font-medium">{formatPrice(giftWrapFee)}</span>
                    </div>
                  )}
                  {loyaltyApplied && appliedPoints > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5 text-[#D4527A] font-semibold">
                        <Coins size={12} /> Royal Points
                      </span>
                      <span className="font-bold text-[#D4527A]">−{formatPrice(appliedPoints)}</span>
                    </div>
                  )}
                </div>

                {/* Free Delivery Progress */}
                <div className="mt-[20px] relative z-10">
                  <FreeDeliveryBar subtotal={subtotal} threshold={2499} compact />
                </div>

                {/* ── Royal Points Card ── */}
                {isAuthenticated && (
                  <div className="mt-[20px] relative z-10">
                    <div className="rounded-[16px] overflow-hidden border border-[#F4A0B0]/30 shadow-[0_4px_20px_rgba(212,82,122,0.08)]">
                      {/* Header */}
                      <div className="bg-gradient-to-r from-[#D4527A] to-[#B94B68] px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                            <Coins size={13} className="text-white" />
                          </div>
                          <span className="font-sans text-[11px] font-bold uppercase tracking-[1px] text-white">Royal Points</span>
                        </div>
                        <div className="flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-0.5">
                          <Coins size={10} className="text-white" />
                          <span className="font-sans text-[11px] font-black text-white">{balance} pts</span>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="bg-gradient-to-br from-[#FFF0F5] to-[#FDF5F8] px-4 py-3">
                        {balance === 0 ? (
                          <p className="font-sans text-[12px] text-text-muted text-center py-1">
                            No points yet. You'll earn {willEarnPoints} pts on this order!
                          </p>
                        ) : loyaltyApplied ? (
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-sans text-[12px] font-semibold text-[#D4527A] flex items-center gap-1.5">
                                <Check size={13} strokeWidth={3} /> {appliedPoints} pts applied · saves {formatPrice(appliedPoints)}
                              </p>
                              <p className="font-sans text-[11px] text-text-muted mt-0.5">Remaining: {balance - appliedPoints} pts</p>
                            </div>
                            <button
                              onClick={handleRemoveLoyalty}
                              className="font-sans text-[11px] font-bold text-[#D4527A] hover:text-[#B94B68] underline transition-colors ml-3"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <>
                            <p className="font-sans text-[12px] text-text-muted mb-2">
                              Use up to{' '}
                              <span className="font-bold text-[#D4527A]">{orderMaxRedeemable} pts</span>
                              {' '}= {formatPrice(orderMaxRedeemable)} off
                            </p>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                min={1}
                                max={orderMaxRedeemable}
                                value={loyaltyInput}
                                onChange={(e) => setLoyaltyInput(e.target.value)}
                                placeholder={`Max ${orderMaxRedeemable} pts`}
                                className="flex-1 h-[34px] px-3 text-[12px] font-medium border border-[#F4A0B0]/50 rounded-[10px] bg-white outline-none focus:border-[#D4527A] transition-colors placeholder:text-text-muted/50"
                              />
                              <button
                                onClick={handleApplyLoyalty}
                                disabled={orderMaxRedeemable === 0}
                                className="h-[34px] px-4 bg-[#D4527A] text-white rounded-[10px] font-bold text-[11px] tracking-[0.5px] uppercase hover:bg-[#B94B68] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                              >
                                Apply
                              </button>
                            </div>
                          </>
                        )}

                        {/* Will earn info */}
                        <div className="mt-2.5 pt-2.5 border-t border-[#F4A0B0]/20 flex items-center gap-1.5">
                          <Star size={10} className="text-[#D4527A] fill-[#D4527A]" />
                          <p className="font-sans text-[11px] text-text-muted">
                            You'll earn <span className="font-bold text-[#D4527A]">{willEarnPoints} pts</span> after this order
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Gift Wrapping Option */}
                <div className="mt-[20px] pt-[20px] border-t border-white/40 relative z-10">
                  <div className="flex items-start gap-3">
                    <div className="relative flex items-center justify-center mt-0.5">
                      <input 
                        type="checkbox" 
                        id="giftWrap" 
                        checked={isGiftWrapped} 
                        onChange={(e) => setIsGiftWrapped(e.target.checked)}
                        className="peer appearance-none w-4 h-4 border border-text-muted/50 rounded-sm bg-white/50 checked:bg-[#D4527A] checked:border-[#D4527A] cursor-pointer transition-colors"
                      />
                      <Check size={12} strokeWidth={3} className="absolute text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex-1">
                      <label htmlFor="giftWrap" className="font-semibold text-[13px] text-text-main cursor-pointer flex items-center justify-between">
                        <span className="flex items-center gap-1.5"><Gift size={14} className="text-[#D4527A]" /> Add Gift Packing (₹49)</span>
                        <button onClick={(e) => { e.preventDefault(); setIsGiftDetailsOpen(!isGiftDetailsOpen); }} className="text-[#D4527A] hover:underline flex items-center gap-0.5 text-[11px]">
                          Details <ChevronDown size={14} className={`transition-transform duration-300 ${isGiftDetailsOpen ? 'rotate-180' : ''}`} />
                        </button>
                      </label>
                      
                      <AnimatePresence>
                        {isGiftDetailsOpen && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }} 
                            animate={{ height: 'auto', opacity: 1 }} 
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <p className="text-[11px] text-text-muted mt-2 bg-white/40 p-2.5 rounded-xl border border-white/50 leading-relaxed shadow-sm">
                              Make it special! Includes a premium wrapped box, a personalized handwritten note, and a Sterling Kart gift bag.
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <AnimatePresence>
                        {isGiftWrapped && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }} 
                            animate={{ height: 'auto', opacity: 1 }} 
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mt-3"
                          >
                            <textarea 
                              placeholder="Write your gift message (optional)..." 
                              value={giftNote}
                              onChange={(e) => setGiftNote(e.target.value)}
                              className="w-full text-[12px] p-3 rounded-xl border border-white/60 bg-white/50 outline-none focus:border-[#D4527A] focus:bg-white resize-none shadow-sm transition-colors"
                              rows={2}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white mt-[20px] pt-[20px] relative z-10">
                  <div className="flex justify-between items-end">
                    <span className="font-serif text-[18px] text-text-main">Total</span>
                    <span className="font-sans text-[22px] font-bold text-text-main">{formatPrice(finalTotalAmount)}</span>
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

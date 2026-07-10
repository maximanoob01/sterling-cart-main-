import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, CreditCard, Smartphone, Building2, Wallet, Banknote, Shield, Lock, ChevronRight, Home, ArrowLeft, Scale, ShoppingCart, ChevronDown, Sparkles, ArrowRight, Gift, Coins, Star, X, PenTool, MapPin, Copy, Package, Truck, ShieldCheck, ShoppingBag, Tag, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { useLoyalty } from '../context/LoyaltyContext';
import { useProducts } from '../context/ProductContext';
import { getItemPrice } from '../context/CartContext';
import { generateOrderId } from '../utils/formatPrice';
import api from '../services/api';
import toast from 'react-hot-toast';
import FreeDeliveryBar from '../components/cart/FreeDeliveryBar';
import { VisaLogo, MastercardLogo, AmexLogo, RazorpayLogo, ShiprocketLogo, GPayLogo, PhonePeLogo, PaytmLogo, RupayLogo, AmazonPayLogo, MobikwikLogo, BankLogo, CashLogo } from '../components/ui/PaymentLogos';
import royalPointsCoinImg from '../assets/images/royal_points_coin.webp';

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
  { id: 'online', name: 'Pay Online', description: 'UPI, Cards, NetBanking, Wallets via Razorpay', icon: Shield, logos: [RazorpayLogo, VisaLogo, MastercardLogo, GPayLogo] },
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
  const { products } = useProducts();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState('online');
  const [errors, setErrors] = useState({});
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(true);
  const [orderSuccessData, setOrderSuccessData] = useState(null);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [successCountdown, setSuccessCountdown] = useState(4);
  const [isGiftWrapped, setIsGiftWrapped] = useState(false);
  const [giftNote, setGiftNote] = useState('');
  const [isGiftDetailsOpen, setIsGiftDetailsOpen] = useState(false);
  const [loyaltyApplied, setLoyaltyApplied] = useState(false);
  const [loyaltyInput, setLoyaltyInput] = useState('');
  const [appliedPoints, setAppliedPoints] = useState(0);
  const [showLoyaltyEarnedDialog, setShowLoyaltyEarnedDialog] = useState(false);
  const [savedAddress, setSavedAddress] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sk_saved_address')) || null; }
    catch { return null; }
  });
  const [savedAddressDismissed, setSavedAddressDismissed] = useState(false);

  // Gift Card State
  const [giftCardCode, setGiftCardCode] = useState('');
  const [appliedGiftCard, setAppliedGiftCard] = useState(null);
  const [isApplyingGC, setIsApplyingGC] = useState(false);

  const codFee = selectedPayment === 'cod' ? 9 : 0;
  const giftWrapFee = isGiftWrapped ? 49 : 0;
  const loyaltyDiscount = appliedPoints; // 1 pt = ₹1

  const subtotalBeforeGC = Math.max(0, totalAmount + codFee + giftWrapFee - loyaltyDiscount);
  const gcDiscount = appliedGiftCard ? Math.min(appliedGiftCard.remainingBalance, subtotalBeforeGC) : 0;
  const finalTotalAmount = Math.max(0, subtotalBeforeGC - gcDiscount);

  // How many points this order will earn (10% of final)
  const willEarnPoints = pointsEarned(finalTotalAmount);
  // Max redeemable for this order
  const orderMaxRedeemable = maxRedeemable(totalAmount + codFee + giftWrapFee, balance);

  const handleApplyLoyalty = () => {
    if (orderMaxRedeemable <= 0) { toast.error('No points available to redeem'); return; }
    setAppliedPoints(orderMaxRedeemable);
    setLoyaltyApplied(true);
    toast.success(`✨ ${orderMaxRedeemable} Royal Points applied!`, {
      style: { background: '#FFF0F5', color: '#2D2D2D', border: '1px solid #F4A0B0' },
      iconTheme: { primary: '#D4527A', secondary: '#FFF' },
    });
  };

  const handleRemoveLoyalty = () => {
    setAppliedPoints(0);
    setLoyaltyApplied(false);
    setLoyaltyInput('');
  };

  const handleApplyGiftCard = async () => {
    if (!giftCardCode.trim()) return;
    setIsApplyingGC(true);
    try {
      const res = await api.post('/gift-cards/apply', { code: giftCardCode });
      if (res.success) {
        setAppliedGiftCard({
          ...res.giftCard,
          code: giftCardCode
        });
        toast.success('Gift card applied!', {
          style: { background: '#FFF0F5', color: '#2D2D2D', border: '1px solid #F4A0B0' },
          iconTheme: { primary: '#D4527A', secondary: '#FFF' },
        });
      }
    } catch (err) {
      toast.error(err.message || 'Invalid gift card code');
      setGiftCardCode('');
    } finally {
      setIsApplyingGC(false);
    }
  };

  const handleRemoveGiftCard = () => {
    setAppliedGiftCard(null);
    setGiftCardCode('');
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

  const getItemImage = (item) => {
    if (item.images && item.images.length > 0) return item.images[0];
    const fullProduct = products.find(p => String(p.id) === String(item.id));
    if (fullProduct && fullProduct.images && fullProduct.images.length > 0) return fullProduct.images[0];
    return 'https://via.placeholder.com/150?text=No+Image';
  };

  const applyUseSavedAddress = () => {
    if (savedAddress) {
      setForm(savedAddress);
      setSavedAddressDismissed(true);
      toast.success('Saved address applied!', {
        style: { background: '#FFF0F5', color: '#2D2D2D', border: '1px solid #F4A0B0' },
        iconTheme: { primary: '#D4527A', secondary: '#FFF' },
      });
    }
  };

  useEffect(() => {
    if (items.length === 0 && !isPlacingOrder && !orderSuccessData) {
      navigate('/cart');
    }
  }, [items, navigate, isPlacingOrder, orderSuccessData]);

  // Sequence: success screen (4 s) → exit animation (0.8 s) → loyalty dialog → redirect
  useEffect(() => {
    if (orderSuccessData) {
      setShowSuccessScreen(true);
      setSuccessCountdown(4);

      // Timer countdown
      const countdownInterval = setInterval(() => {
        setSuccessCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Hide success card after 4 s (exit animation takes ~0.8 s)
      const hideSuccessTimer = setTimeout(() => setShowSuccessScreen(false), 4000);
      
      // Show loyalty dialog after success card is fully gone
      const dialogTimer = setTimeout(() => setShowLoyaltyEarnedDialog(true), 4900);
      
      // Auto-redirect if user doesn't interact with dialog
      const redirectTimer = setTimeout(() => {
        navigate('/shop', { state: { showTrackOrderPointer: true } });
      }, 15000);

      return () => {
        clearInterval(countdownInterval);
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
    if (!form.fullName?.trim()) newErrors.fullName = 'Full name is required';
    if (!form.email?.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email address';
    if (!form.phone?.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, ''))) newErrors.phone = 'Invalid phone number';
    if (!form.addressLine1?.trim()) newErrors.addressLine1 = 'Address is required';
    if (!form.city?.trim()) newErrors.city = 'City is required';
    if (!form.state) newErrors.state = 'State is required';
    if (!form.pincode?.trim()) newErrors.pincode = 'Pincode is required';
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
    const sanitizedForm = {
      ...form,
      phone: form.phone ? form.phone.replace(/\s/g, '') : '',
    };
    const orderPayload = {
      form: sanitizedForm,
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
      giftCardCode: appliedGiftCard?.code || null,
      giftCardDiscount: gcDiscount,
    };

    try {
      const res = await api.post('/orders', orderPayload);
      if (res.success) {
        // Save address for next time
        localStorage.setItem('sk_saved_address', JSON.stringify(form));
        setSavedAddress(form);
        return res;
      }
      throw new Error('Order creation failed');
    } catch (err) {
      console.error('Order API error:', err);
      throw err;
    }
  };

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);

    try {
      // COD — skip Razorpay, create order directly
      if (selectedPayment === 'cod') {
        const res = await createOrderOnBackend(null, null);
        const earned = res.earnedPoints || 0;

        if (isAuthenticated) await refreshLoyalty();

        toast.success('Order placed successfully! 🎉');
        clearCart();
        setIsPlacingOrder(false);
        setOrderSuccessData({ orderId: res.order?.orderId || generateOrderId(), earnedPoints: earned });
        return;
      }

      // Online payment — create Razorpay order
      let rzpOrder;
      try {
        rzpOrder = await api.post('/transaction/create-order', {
          amount: finalTotalAmount,
          currency: currency === 'USD' ? 'USD' : 'INR',
          receipt: `rcpt_${Date.now()}`,
        });
      } catch (err) {
        if (finalTotalAmount === 0) {
          // Razorpay unavailable for 0 amount — fallback to direct order
          console.warn('Razorpay unavailable (0 amount), creating order directly:', err.message);
          const res = await createOrderOnBackend(null, null);
          clearCart();
          setIsPlacingOrder(false);
          setOrderSuccessData({ orderId: res.order?.orderId || generateOrderId(), earnedPoints: res.earnedPoints || 0 });
          return;
        } else {
          throw new Error(err.message || 'Could not initiate payment. Please try again.');
        }
      }

      if (!window.Razorpay) {
        // Try to load dynamically if it failed initially
        const scriptLoaded = await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
        
        if (!scriptLoaded || !window.Razorpay) {
          // If in a testing/dev environment (or using secret testmode flag) and Razorpay is blocked, do a mock payment
          if (import.meta.env.DEV || window.location.hostname.includes('railway.app') || window.location.hostname === 'localhost' || window.location.search.includes('testmode=true')) {
            console.warn('Razorpay blocked by adblocker. Proceeding with Mock Payment for testing.');
            toast.success('Mock Payment Success (Testing Mode)');
            const res = await createOrderOnBackend('pay_mock_' + Date.now(), rzpOrder.order.id);
            const earned = res.earnedPoints || 0;
            if (isAuthenticated) await refreshLoyalty();
            clearCart();
            setIsPlacingOrder(false);
            setOrderSuccessData({ orderId: res.order?.orderId || generateOrderId(), earnedPoints: earned });
            return;
          }
          throw new Error('Razorpay SDK failed to load. Please disable your adblocker (or Brave Shields) and check your connection.');
        }
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
            await api.post('/transaction/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
          } catch (err) {
            console.error('Payment verification failed:', err);
          }

          try {
            // Create order with payment details
            const res = await createOrderOnBackend(response.razorpay_payment_id, response.razorpay_order_id);
            const earned = res.earnedPoints || 0;

            if (isAuthenticated) await refreshLoyalty();

            toast.success('Order placed successfully! 🎉');
            clearCart();
            setIsPlacingOrder(false);
            setOrderSuccessData({ orderId: res.order?.orderId || generateOrderId(), earnedPoints: earned });
          } catch (err) {
            console.error('Order placement failed after payment:', err);
            const errorMsg = err.response?.data?.details?.join(', ') || err.response?.data?.error || err.message || 'Failed to place order';
            toast.error(`Order failed: ${errorMsg}`);
            setIsPlacingOrder(false);
          }
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
      toast.error(error.message || 'Something went wrong. Please try again.');
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

        {/* ── Success Card (exits after 3 s) ── */}
        <AnimatePresence mode="wait">
          {showSuccessScreen && (
            <motion.div
              key="success-card"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: -30 }}
              transition={{ type: 'spring', duration: 0.7, bounce: 0.4 }}
              className="relative z-10 bg-white p-5 md:p-6 rounded-[24px] text-center max-w-[400px] w-full shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              {/* Confetti Background */}
              <div className="absolute top-8 left-12 w-2 h-2 bg-[#F4A0B0] rotate-45 transform rounded-sm opacity-80" />
              <div className="absolute top-16 left-8 w-1.5 h-1.5 bg-[#9B6BFA] rounded-sm opacity-80" />
              <div className="absolute top-10 right-16 w-1.5 h-2.5 bg-[#50D293] rotate-12 opacity-80" />
              <div className="absolute top-6 right-24 w-2 h-2 bg-[#F4A0B0] rounded-full opacity-80" />
              <div className="absolute top-16 right-10 w-2 h-2 bg-[#FFB057] rotate-45 opacity-80" />
              <div className="absolute top-20 left-16 w-1.5 h-1.5 bg-[#F4A0B0] rounded-full opacity-60" />
              <div className="absolute top-6 right-32 w-1.5 h-1.5 bg-[#9B6BFA] rotate-12 opacity-80" />

              {/* Checkmark Circle */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2, duration: 0.6 }}
                className="w-[64px] h-[64px] mx-auto mb-4 rounded-full bg-[#50D293] flex items-center justify-center ring-[4px] ring-[#E6F8F0] shadow-sm relative z-10"
              >
                <Check size={32} strokeWidth={4} className="text-white" />
              </motion.div>

              {/* Title and Subtitle */}
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                <h1 className="font-serif text-[22px] md:text-[24px] text-gray-900 mb-1 font-medium flex items-center justify-center gap-2">
                  Order Placed Successfully! 🎉
                </h1>
                <div className="font-sans text-[12px] text-gray-500 mb-4 space-y-1">
                  <p>Thank you for shopping with us.</p>
                  <p>We've received your order and are preparing it.</p>
                  <p>You'll receive a tracking update soon! 💗</p>
                </div>
              </motion.div>

              {/* Order Number Box */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-[#FFF4F6] rounded-[16px] py-3 px-4 mb-4 flex flex-col items-center justify-center relative"
              >
                <p className="font-sans text-[10px] font-bold uppercase tracking-[2px] text-[#D4527A] mb-1">
                  Order Number
                </p>
                <div className="flex items-center gap-3">
                  <span className="font-sans text-[16px] font-bold tracking-[1px] text-gray-900">
                    {orderSuccessData.orderId}
                  </span>
                  <button onClick={() => { navigator.clipboard.writeText(orderSuccessData.orderId); toast.success('Order ID copied'); }} className="w-7 h-7 rounded-full bg-[#FADDE5] text-[#D4527A] flex items-center justify-center hover:bg-[#F4A0B0] hover:text-white transition-colors">
                    <Copy size={12} strokeWidth={2.5} />
                  </button>
                </div>
              </motion.div>

              {/* Timeline Box */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-[#FAFAFA] border border-[#F0F0F0] rounded-[16px] py-4 px-2 mb-4 relative"
              >
                <div className="flex items-start justify-between relative z-10">
                  {/* Line Background */}
                  <div className="absolute top-[16px] left-[12%] right-[12%] h-[1px] bg-transparent border-t-[1.5px] border-dashed border-gray-300 -z-10" />
                  <div className="absolute top-[16px] left-[12%] w-[20%] h-[2px] bg-[#F4A0B0] -z-10" />
                  
                  {/* Step 1 */}
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-8 h-8 rounded-full bg-[#F4A0B0] flex items-center justify-center mb-1.5 shadow-sm ring-4 ring-white">
                      <ShoppingCart size={14} className="text-white" />
                    </div>
                    <p className="text-[8px] font-bold text-[#D4527A] uppercase tracking-[0.5px]">Order Placed</p>
                    <p className="text-[8.5px] text-gray-500 mt-0.5 font-medium">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    <p className="text-[8.5px] text-gray-500 font-medium">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  
                  {/* Step 2 */}
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-8 h-8 rounded-full bg-[#F5F5F5] border-[1.5px] border-[#E8E8E8] flex items-center justify-center mb-1.5 ring-4 ring-[#FAFAFA]">
                      <Package size={14} strokeWidth={1.5} className="text-gray-400" />
                    </div>
                    <p className="text-[8px] font-bold text-gray-500 uppercase tracking-[0.5px]">Packing</p>
                    <p className="text-[8.5px] text-gray-400 mt-0.5 font-medium">In Progress</p>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-8 h-8 rounded-full bg-[#F5F5F5] border-[1.5px] border-[#E8E8E8] flex items-center justify-center mb-1.5 ring-4 ring-[#FAFAFA]">
                      <Truck size={14} strokeWidth={1.5} className="text-gray-400" />
                    </div>
                    <p className="text-[8px] font-bold text-gray-500 uppercase tracking-[0.5px]">Shipped</p>
                    <p className="text-[8.5px] text-gray-400 mt-0.5 font-medium">Upcoming</p>
                  </div>

                  {/* Step 4 */}
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-8 h-8 rounded-full bg-[#F5F5F5] border-[1.5px] border-[#E8E8E8] flex items-center justify-center mb-1.5 ring-4 ring-[#FAFAFA]">
                      <Home size={14} strokeWidth={1.5} className="text-gray-400" />
                    </div>
                    <p className="text-[8px] font-bold text-gray-500 uppercase tracking-[0.5px]">Delivered</p>
                    <p className="text-[8.5px] text-gray-400 mt-0.5 font-medium">Upcoming</p>
                  </div>
                </div>
              </motion.div>

              {/* Trust Badge */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="bg-[#F0F9F4] rounded-[12px] py-2.5 px-3 mb-4 flex items-center justify-center gap-2"
              >
                <div className="w-4 h-4 rounded-full border-[1.5px] border-[#50D293] flex items-center justify-center opacity-80">
                   <ShieldCheck size={10} strokeWidth={2.5} className="text-[#50D293]" />
                </div>
                <p className="text-[11px] text-gray-700 font-medium">Your order is safe with us. We'll notify you at every step.</p>
              </motion.div>

              {/* Countdown Timer Button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="w-full h-[46px] bg-[#F4A0B0]/10 text-[#D4527A] border border-[#D4527A]/20 rounded-full font-bold text-[12px] tracking-[1px] uppercase flex items-center justify-center gap-2"
              >
                <span>Loading Royal Points in</span>
                <span className="w-4 tabular-nums text-center">{successCountdown}s</span>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}>
                  <Star size={14} className="text-[#D4527A]" />
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Loyalty Points Earned Dialog ── */}
        <AnimatePresence>
          {showLoyaltyEarnedDialog && isAuthenticated && (
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
    `w-full h-[40px] px-[16px] border border-white/60 rounded-[12px] font-sans text-[13px] bg-white/50 text-text-main outline-none transition-all duration-300 placeholder:text-text-muted/60 focus:bg-white focus:border-[#D4527A] focus:shadow-[0_2px_10px_rgba(212,82,122,0.1)] ${errors[field] ? 'border-[#D4527A] bg-red-50/50' : ''
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
                  className={`w-[40px] h-[40px] rounded-full flex items-center justify-center font-sans text-[13px] font-bold transition-all duration-500 shadow-sm ${currentStep > step.number
                      ? 'bg-[#1A1A1A] text-white border-none'
                      : currentStep === step.number
                        ? 'bg-[#D4527A] text-white shadow-[0_4px_16px_rgba(212,82,122,0.3)] ring-4 ring-[#D4527A]/20 border-none scale-105'
                        : 'glass bg-white/60 border border-white text-text-muted'
                    }`}
                >
                  {currentStep > step.number ? <Check size={16} strokeWidth={3} /> : step.number}
                </div>
                <span
                  className={`font-sans text-[10px] uppercase tracking-[1px] font-bold mt-[10px] transition-colors ${currentStep >= step.number ? 'text-text-main' : 'text-[#A8A8A8]'
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

                  {/* Saved Address Suggestion */}
                  {savedAddress && !savedAddressDismissed && (
                    <AnimatePresence>
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="relative z-10 mb-[20px] rounded-[16px] border border-[#D4527A]/25 bg-gradient-to-r from-[#FFF0F5]/80 to-white/60 p-4 flex items-center gap-3 shadow-sm"
                      >
                        <div className="w-9 h-9 rounded-full bg-[#D4527A]/10 flex items-center justify-center shrink-0">
                          <MapPin size={16} className="text-[#D4527A]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-[11px] font-bold uppercase tracking-[1px] text-[#D4527A] mb-0.5">Saved Address</p>
                          <p className="font-sans text-[13px] font-semibold text-text-main truncate">{savedAddress.fullName}</p>
                          <p className="font-sans text-[12px] text-text-muted truncate">{savedAddress.addressLine1}, {savedAddress.city} – {savedAddress.pincode}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={applyUseSavedAddress}
                            className="h-[34px] px-4 bg-[#D4527A] text-white rounded-full font-bold text-[11px] tracking-[0.5px] uppercase hover:bg-[#B94B68] transition-colors shadow-sm"
                          >
                            Use this
                          </button>
                          <button
                            onClick={() => setSavedAddressDismissed(true)}
                            className="w-7 h-7 rounded-full bg-white/80 border border-white flex items-center justify-center text-text-muted hover:text-text-main transition-colors"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  )}

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
                            src={getItemImage(item)}
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
                              className={`group flex items-center gap-[12px] sm:gap-[16px] p-[12px] sm:p-[16px] rounded-[16px] border-2 cursor-pointer transition-all duration-300 ${selectedPayment === method.id
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
                                className={`w-[20px] h-[20px] rounded-full border-[2px] flex items-center justify-center shrink-0 transition-colors ${selectedPayment === method.id ? 'border-[#1A1A1A]' : 'border-[#C0C0C0] bg-white/50'
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
                              <div className={`w-[40px] h-[40px] rounded-[12px] flex items-center justify-center shrink-0 transition-colors ${selectedPayment === method.id ? 'bg-[#1A1A1A] text-white shadow-md' : 'bg-white border border-white shadow-sm text-text-muted'
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
                      Payments are securely processed via <span className="font-bold text-text-main">Razorpay</span> (accepting Visa, Mastercard, Amex). Your order is swiftly and safely delivered via <span className="font-bold text-text-main">Shiprocket</span>.
                    </p>
                    <div className="flex items-center gap-3">
                      <VisaLogo />
                      <MastercardLogo />
                      <AmexLogo />
                      <div className="w-[1px] h-4 bg-[#F0E8EA] mx-1"></div>
                      <RazorpayLogo />
                      <ShiprocketLogo />
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
          {/* Order Summary Sidebar */}
          <div className={`w-full lg:w-[440px] shrink-0 order-1 lg:order-2 ${isMobileSummaryOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="lg:sticky lg:top-[100px] flex flex-col gap-[16px]">
              <div className="bg-white rounded-[24px] p-[20px] shadow-sm border border-[#F0E8EA]">
                {/* Header */}
                <div className="flex items-center justify-between pb-[16px] border-b border-[#F0E8EA]">
                  <div className="flex items-center gap-[12px]">
                    <div className="w-[40px] h-[40px] rounded-[12px] bg-[#FFF0F5] flex items-center justify-center text-[#D4527A]">
                      <ShoppingBag size={20} strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="font-serif text-[20px] text-text-main font-semibold leading-tight">Order Summary</h3>
                      <p className="font-sans text-[12px] text-[#8C8C8C] mt-[2px]">{totalItems} Item{totalItems > 1 ? 's' : ''} in your bag</p>
                    </div>
                  </div>
                  <button onClick={() => navigate('/cart')} className="flex items-center gap-[6px] text-[#D4527A] font-medium text-[12px] hover:text-[#B94B68] transition-colors">
                    <PenTool size={12} /> Edit Cart
                  </button>
                </div>

                {/* Item List */}
                <div className="py-[16px] border-b border-[#F0E8EA] flex flex-col gap-[16px]">
                  {items.map((item, i) => (
                    <div key={`${item.id}-${i}`} className="flex items-start gap-[16px]">
                      <div className="w-[64px] h-[64px] rounded-[12px] bg-[#FAFAFA] border border-[#F0E8EA] overflow-hidden shrink-0">
                        <img src={getItemImage(item)} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 pt-[2px]">
                        <div className="flex justify-between items-start gap-[12px]">
                          <h4 className="font-sans text-[14px] font-medium text-text-main leading-[1.3] line-clamp-1">{item.name}</h4>
                          <span className="font-sans text-[15px] font-bold text-text-main shrink-0">{formatPrice(getItemPrice(item) * item.quantity)}</span>
                        </div>
                        <p className="font-sans text-[12px] text-[#8C8C8C] mt-[4px]">
                          925 Sterling Silver {item.selectedSize ? ` • Size: ${item.selectedSize}` : ''}
                        </p>
                        <p className="font-sans text-[12px] text-[#8C8C8C] mt-[2px]">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cost Breakdown */}
                <div className="py-[16px] flex flex-col gap-[12px] font-sans text-[13px] border-b border-[#F0E8EA]">
                  <div className="flex justify-between items-center">
                    <span className="text-text-main">Subtotal ({totalItems} item{totalItems > 1 ? 's' : ''})</span>
                    <span className="text-text-main font-bold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-main flex items-center gap-[8px]">
                      Shipping <Truck size={14} className="text-[#D4527A]" /> <span className="text-[#D4527A] text-[11px] font-medium">Free above ₹2,499</span>
                    </span>
                    <span className="text-text-main font-bold">{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                  </div>
                  
                  {(discount > 0 || (loyaltyApplied && appliedPoints > 0) || (appliedGiftCard && gcDiscount > 0)) && (
                    <div className="flex justify-between items-center text-[#D4527A] font-medium mt-[4px]">
                      <span className="flex items-center gap-[6px]">Total Savings <Tag size={14} /></span>
                      <span className="font-bold">-{formatPrice(discount + (loyaltyApplied ? appliedPoints : 0) + (appliedGiftCard ? gcDiscount : 0))}</span>
                    </div>
                  )}
                  {selectedPayment === 'cod' && (
                    <div className="flex justify-between items-center text-text-main mt-[4px]">
                      <span>Handling Fee (COD)</span>
                      <span className="font-bold">{formatPrice(codFee)}</span>
                    </div>
                  )}
                  {isGiftWrapped && (
                    <div className="flex justify-between items-center text-text-main mt-[4px]">
                      <span>Gift Packing</span>
                      <span className="font-bold">{formatPrice(giftWrapFee)}</span>
                    </div>
                  )}
                </div>

                {/* Free Delivery Bar */}
                <div className="py-[16px]">
                  <FreeDeliveryBar subtotal={subtotal} threshold={2499} />
                </div>

                {/* Royal Points Card */}
                {isAuthenticated && (
                  <div className="mb-[16px] rounded-[16px] overflow-hidden shadow-sm border border-[#4A2B4D]/20">
                    <div className="bg-[#3D2240] p-[20px] relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#412544] via-[#2F1931] to-[#3D2240]" />
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-[20px]">
                          <div className="flex items-center gap-[12px]">
                            <div className="w-[48px] h-[48px] rounded-full bg-[#E5B869]/20 flex items-center justify-center border border-[#E5B869]/30">
                              <img src={royalPointsCoinImg} alt="Coin" className="w-[36px] h-[36px] drop-shadow-md" />
                            </div>
                            <div>
                              <p className="font-sans text-[9px] font-bold uppercase tracking-[2px] text-[#F4A0B0] mb-0.5">Sterling Kart</p>
                              <p className="font-serif text-[20px] text-white leading-tight">Royal Points</p>
                              <p className="font-sans text-[11px] text-[#A38BA6] mt-0.5">Your balance</p>
                            </div>
                          </div>
                          <div className="border border-white/10 rounded-full px-[16px] py-[6px] bg-white/5">
                            <span className="font-sans text-[20px] font-bold text-[#E5B869]">{balance}</span>
                            <span className="font-sans text-[11px] text-[#E5B869]/70 uppercase ml-1 font-medium">pts</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-[8px]">
                          <div className="flex-1 min-w-0">
                            <p className="font-sans text-[11px] text-[#A38BA6] mb-0.5">Redeem up to</p>
                            <p className="font-sans text-[13px] sm:text-[14px] text-white font-bold truncate">{orderMaxRedeemable} pts <span className="font-normal text-[#A38BA6]">= {formatPrice(orderMaxRedeemable)} off</span></p>
                          </div>
                          {loyaltyApplied ? (
                            <button onClick={handleRemoveLoyalty} className="bg-white/10 text-white border border-white/20 px-[16px] sm:px-[20px] py-[8px] sm:py-[10px] rounded-full font-sans text-[11px] sm:text-[12px] font-bold transition-colors hover:bg-white/20 shrink-0">
                              Remove
                            </button>
                          ) : (
                            <button onClick={handleApplyLoyalty} disabled={orderMaxRedeemable === 0} className="bg-[#D4527A] text-white px-[12px] sm:px-[20px] py-[8px] sm:py-[10px] rounded-full font-sans text-[11px] sm:text-[12px] font-bold flex items-center gap-[4px] sm:gap-[6px] shadow-sm disabled:opacity-50 transition-colors hover:bg-[#B94B68] shrink-0">
                              <Sparkles size={14} className="fill-white shrink-0" /> Apply
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#2F1931] px-[20px] py-[12px] flex items-center gap-[8px] border-t border-white/5">
                      <Star size={14} className="text-[#D4527A] fill-[#D4527A]" />
                      <p className="font-sans text-[12px] text-[#A38BA6]">You'll earn <span className="font-bold text-[#D4527A]">{willEarnPoints} pts</span> after this order</p>
                    </div>
                  </div>
                )}

                {/* Gift Packing & Coupon */}
                <div className="mb-[16px] rounded-[16px] border border-[#F0E8EA] bg-white overflow-hidden shadow-sm">
                  {/* Gift Packing */}
                  <div className="p-[16px] border-b border-[#F0E8EA]">
                    <div className="flex items-start gap-[12px]">
                      <div className="relative flex items-center justify-center mt-[2px]">
                        <input
                          type="checkbox"
                          checked={isGiftWrapped}
                          onChange={(e) => setIsGiftWrapped(e.target.checked)}
                          className="peer appearance-none w-[18px] h-[18px] border-[1.5px] border-[#D9C5C9] rounded-[4px] bg-white checked:bg-[#D4527A] checked:border-[#D4527A] cursor-pointer transition-colors"
                        />
                        <Check size={12} strokeWidth={3} className="absolute text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-[10px]">
                            <Gift size={20} className="text-[#D4527A]" />
                            <div>
                              <p className="font-sans text-[14px] font-medium text-text-main">Add Gift Packing</p>
                              <p className="font-sans text-[12px] text-[#8C8C8C]">₹49</p>
                            </div>
                          </div>
                          <button onClick={() => setIsGiftDetailsOpen(!isGiftDetailsOpen)} className="text-[#D4527A] font-medium text-[12px] flex items-center gap-[4px] hover:underline">
                            Details <ChevronDown size={14} className={`transition-transform duration-300 ${isGiftDetailsOpen ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                        <AnimatePresence>
                          {isGiftDetailsOpen && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                              <p className="text-[12px] text-[#8C8C8C] mt-[12px] leading-relaxed">
                                Make it special! Includes a premium wrapped box, a personalized handwritten note, and a Sterling Kart gift bag.
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <AnimatePresence>
                          {isGiftWrapped && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-[12px]">
                              <textarea placeholder="Write your gift message (optional)..." value={giftNote} onChange={(e) => setGiftNote(e.target.value)} className="w-full text-[12px] p-3 rounded-[12px] border border-[#F0E8EA] bg-[#FAFAFA] outline-none focus:border-[#D4527A] resize-none transition-colors" rows={2} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                  
                  {/* Coupon / Gift Card */}
                  <div className="p-[16px]">
                    {appliedGiftCard ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-[12px]">
                          <div className="w-[32px] h-[32px] rounded-full bg-[#D4527A]/10 flex items-center justify-center">
                            <Check size={16} strokeWidth={3} className="text-[#D4527A]" />
                          </div>
                          <div>
                            <p className="font-sans text-[13px] font-bold text-text-main">Gift Card Applied</p>
                            <p className="font-sans text-[11px] text-[#8C8C8C]">Saving {formatPrice(gcDiscount)}</p>
                          </div>
                        </div>
                        <button onClick={handleRemoveGiftCard} className="font-sans text-[12px] font-medium text-[#D4527A] hover:underline">Remove</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-[8px] sm:gap-[12px]">
                        <Tag size={20} className="text-[#D4527A] shrink-0" />
                        <input
                          type="text"
                          value={giftCardCode}
                          onChange={(e) => setGiftCardCode(e.target.value.toUpperCase())}
                          placeholder="Gift Card / Coupon Code"
                          className="flex-1 min-w-0 bg-transparent font-sans text-[13px] sm:text-[14px] text-text-main outline-none placeholder:text-[#A8A8A8]"
                        />
                        <button
                          onClick={handleApplyGiftCard}
                          disabled={isApplyingGC || !giftCardCode.trim()}
                          className="px-[16px] sm:px-[24px] py-[8px] rounded-[8px] border border-[#D4527A] text-[#D4527A] font-sans text-[12px] font-bold transition-colors hover:bg-[#FFF0F5] disabled:opacity-50 disabled:hover:bg-transparent shrink-0"
                        >
                          {isApplyingGC ? '...' : 'Apply'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Total Footer */}
                <div className="bg-[#FAFAFA] rounded-[16px] p-[20px] flex items-center justify-between border border-[#F0E8EA]">
                  <div>
                    <h3 className="font-serif text-[22px] text-text-main font-semibold">Total</h3>
                    <p className="font-sans text-[11px] font-medium text-[#15803D] flex items-center gap-[4px] mt-[4px]">
                      <ShieldCheck size={14} /> Secure Checkout
                    </p>
                    <p className="font-sans text-[11px] text-[#8C8C8C] mt-[2px]">Inclusive of all taxes</p>
                  </div>
                  <div className="text-right">
                    <span className="font-sans text-[28px] font-bold text-text-main">{formatPrice(finalTotalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="bg-[#FAFAFA] rounded-[16px] p-[16px] border border-[#F0E8EA]">
                <div className="grid grid-cols-4 gap-[8px]">
                  <div className="flex flex-col items-center text-center gap-[8px]">
                    <div className="w-[32px] h-[32px] rounded-full bg-[#FFF0F5] text-[#D4527A] flex items-center justify-center shrink-0 border border-[#F4A0B0]/30">
                      <Shield size={14} />
                    </div>
                    <div>
                      <p className="font-sans text-[9px] font-bold text-text-main leading-tight">100% Secure</p>
                      <p className="font-sans text-[8px] text-[#8C8C8C] mt-[2px]">Payments</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center text-center gap-[8px]">
                    <div className="w-[32px] h-[32px] rounded-full bg-[#FFF0F5] text-[#D4527A] flex items-center justify-center shrink-0 border border-[#F4A0B0]/30">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    </div>
                    <div>
                      <p className="font-sans text-[9px] font-bold text-text-main leading-tight">15 Days</p>
                      <p className="font-sans text-[8px] text-[#8C8C8C] mt-[2px]">Exchange</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center text-center gap-[8px]">
                    <div className="w-[32px] h-[32px] rounded-full bg-[#FFF0F5] text-[#D4527A] flex items-center justify-center shrink-0 border border-[#F4A0B0]/30">
                      <Sparkles size={14} />
                    </div>
                    <div>
                      <p className="font-sans text-[9px] font-bold text-text-main leading-tight">925 Sterling Silver</p>
                      <p className="font-sans text-[8px] text-[#8C8C8C] mt-[2px]">Hallmarked</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center text-center gap-[8px]">
                    <div className="w-[32px] h-[32px] rounded-full bg-[#FFF0F5] text-[#D4527A] flex items-center justify-center shrink-0 border border-[#F4A0B0]/30">
                      <Heart size={14} />
                    </div>
                    <div>
                      <p className="font-sans text-[9px] font-bold text-text-main leading-tight">Loved by</p>
                      <p className="font-sans text-[8px] text-[#8C8C8C] mt-[2px]">50,000+ Customers</p>
                    </div>
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

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star, Gift, Sparkles, ChevronRight, ArrowRight, Search as SearchIcon, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { categories, stoneTypes, occasions, styles } from '../data/products';
import { useProducts } from '../context/ProductContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/formatPrice';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Copy, X, Share2, Calendar, Lock, ShieldCheck, Award, ShoppingBag, Headphones, MessageCircle } from 'lucide-react';
import { shareGiftCardToWhatsApp } from '../utils/shareUtils';

import giftingHero from '../assets/images/gifting_hero.webp';
import forHerImg from '../assets/images/gifting_for_her.webp';
import forHimImg from '../assets/images/gifting_for_him.webp';
import forSisterImg from '../assets/images/gifting_for_sister.webp';
import forMotherImg from '../assets/images/gifting_for_mother.webp';
import forFriendsImg from '../assets/images/gifting_for_friends.webp';
import birthdayImg from '../assets/images/gifting_birthday.webp';
import valentineImg from '../assets/images/gifting_valentine.webp';
import diwaliImg from '../assets/images/gifting_diwali.webp';
import anniversaryImg from '../assets/images/gifting_anniversary.webp';
import weddingImg from '../assets/images/gifting_wedding.webp';
import luxuryBg from '../assets/luxury_rose_gold_bg.webp';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// ── Mini Product Card ─────────────────────────────────────────────────────────
function ProductCard({ product }) {
  const { addItem } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();
  const wished = isWishlisted(product.id);
  const discount = product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  return (
    <motion.div
      variants={fadeUp}
      className="group relative bg-bg-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-product transition-all duration-300"
    >
      {product.badge && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-gradient-to-r from-[#D4527A] to-[#B94B68] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.8px] text-white">
          ✨ {product.badge}
        </span>
      )}
      <button
        onClick={() => toggleItem(product)}
        className={`absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition-colors ${wished ? 'text-[#D4527A]' : 'text-text-muted hover:text-[#D4527A]'}`}
        aria-label="Toggle wishlist"
      >
        <Heart size={15} fill={wished ? 'currentColor' : 'none'} />
      </button>

      <Link to={`/product/${product.slug || product.id}`}>
        <div className="aspect-[4/5] overflow-hidden bg-bg-alt">
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </Link>

      <div className="p-4 bg-gradient-to-b from-[#FFF0F5]/50 to-white">
        <Link to={`/product/${product.slug || product.id}`}>
          <p className="text-[12px] sm:text-[13px] font-medium text-text-main line-clamp-2 leading-[1.4] mb-2">{product.name}</p>
        </Link>
        <div className="flex items-center gap-1 mb-2">
          {[1,2,3,4,5].map(s => (
            <Star key={s} size={10} fill={s <= Math.round(product.rating) ? '#D4527A' : 'none'} stroke={s <= Math.round(product.rating) ? '#D4527A' : '#D0D0D0'} />
          ))}
          <span className="text-[10px] text-text-muted ml-1">({product.reviewCount})</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="font-semibold text-[14px] text-text-main">{formatPrice(product.price)}</span>
            {product.mrp > product.price && (
              <span className="ml-1.5 text-[11px] text-text-muted line-through">{formatPrice(product.mrp)}</span>
            )}
          </div>
        </div>
        <button
          onClick={() => addItem(product)}
          className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-full border border-[#D4527A] text-[#D4527A] py-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-[1px] transition-all hover:bg-[#D4527A] hover:text-white"
        >
          <ShoppingCart size={12} /> Add to Cart
        </button>
      </div>
    </motion.div>
  );
}

// ── Recipient Section ─────────────────────────────────────────────────────────
function RecipientSection({ id, title, subtitle, image, accentColor, textColor, shopLink, picks }) {
  return (
    <section id={id} className="py-12 sm:py-16 px-4 sm:px-8 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8"
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[2px] mb-1 text-[#D4527A]">
              Curated Selection
            </p>
            <h2 className="font-serif text-[28px] sm:text-[36px] text-text-main">{title}</h2>
            <p className="text-[13px] text-text-muted mt-1">{subtitle}</p>
          </div>
          <Link
            to={shopLink}
            className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.8px] shrink-0 text-[#D4527A] hover:text-[#B94B68] transition-colors"
          >
            View All <ArrowRight size={14} />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
          {/* Image card */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            className="relative rounded-3xl overflow-hidden min-h-[260px] sm:min-h-[320px] lg:min-h-[400px] group block"
          >
            <img src={image} alt={title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5">
              <p className="font-serif text-white text-[24px] sm:text-[28px] leading-tight mb-3">{title}</p>
              <Link
                to={shopLink}
                className="inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-[11px] font-bold uppercase tracking-[1px] bg-white/20 backdrop-blur-md text-white border border-white/40 hover:bg-white hover:text-charcoal transition-colors"
              >
                Shop Now <ChevronRight size={13} />
              </Link>
            </div>
          </motion.div>

          {/* Products grid */}
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4"
            initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
          >
            {picks.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function GiftingPage() {
  const navigate = useNavigate();
  const { products } = useProducts();
  const { isAuthenticated, user } = useAuth();
  const [giftCardAmount, setGiftCardAmount] = useState(5000);
  const [activeTab, setActiveTab] = useState('Most Gifted');
  
  // Gift Card Purchase State
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [generatedGiftCard, setGeneratedGiftCard] = useState(null);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  
  // Gift Finder State
  const [finderPrice, setFinderPrice] = useState('');
  const [finderCategory, setFinderCategory] = useState('');
  const [finderStyle, setFinderStyle] = useState('');

  // pick products by category / style for each recipient
  const herPicks    = products.filter(p => ['necklaces','earrings','pendants'].includes(p.category)).slice(0, 6);
  const himPicks    = products.filter(p => ['bracelets','chains','rings'].includes(p.category)).slice(0, 6);
  const sisterPicks = products.filter(p => ['earrings','anklets','nose-pins'].includes(p.category)).slice(0, 6);
  const motherPicks = products.filter(p => ['bangles','sets','necklaces'].includes(p.category)).slice(0, 6);
  const friendPicks = products.filter(p => p.badge === 'Bestseller').slice(0, 6);

  // Timeless Favourites Tab Picks
  const tabPicks = {
    'Most Gifted': products.filter(p => p.category === 'necklaces' || p.category === 'rings').slice(0, 4),
    'Best Seller': products.filter(p => p.badge === 'Bestseller').slice(0, 4),
    'New Arrivals': products.filter(p => p.badge === 'New' || p.isNew).slice(0, 4)
  };

  const giftAmounts = [1000, 2000, 3000, 5000, 7000, 10000, 15000, 20000, 25000, 30000];

  const handleGiftFinder = () => {
    const params = new URLSearchParams();
    if (finderCategory) params.set('category', finderCategory);
    if (finderStyle) params.set('style', finderStyle);
    if (finderPrice) {
      if (finderPrice === 'under-2k') params.set('maxPrice', '2000');
      if (finderPrice === '2k-5k') { params.set('minPrice', '2000'); params.set('maxPrice', '5000'); }
      if (finderPrice === 'above-5k') params.set('minPrice', '5000');
    }
    params.set('occasion', 'gifting');
    navigate(`/shop?${params.toString()}`);
  };

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to purchase a gift card');
      navigate('/login?redirect=/gifting');
      return;
    }
    if (!giftCardAmount || giftCardAmount <= 0) return;

    setIsPurchasing(true);
    try {
      // 1. Create Razorpay order
      const orderData = await api.post('/transaction/create-order', {
        amount: Math.round(giftCardAmount * 100), // paise: ₹500 → 50000
        receipt: `gc_${Date.now()}`
      });

      if (!orderData.success) throw new Error('Failed to create order');

      // 2. Open Razorpay Checkout
      const options = {
        key: orderData.key,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'Sterling Kart',
        description: `Gift Card worth ₹${giftCardAmount}`,
        order_id: orderData.order.id,
        prefill: {
          name: user?.firstName || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        theme: { color: '#D4527A' },
        handler: async (response) => {
          try {
            const loadingToast = toast.loading('Verifying payment and generating card...');
            // 3. Verify payment and generate code
            const verifyData = await api.post('/gift-cards/verify-purchase', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: giftCardAmount
            });

            toast.dismiss(loadingToast);
            if (verifyData.success) {
              toast.success('Gift card purchased successfully!');
              setGeneratedGiftCard(verifyData.giftCard);
              
              // Add to local mock orders for admin panel visibility
              try {
                const savedOrders = JSON.parse(localStorage.getItem('sterling_orders') || '[]');
                const newOrder = {
                  id: `SC-GC-${Date.now().toString().slice(-6)}`,
                  customerId: user?.id || 999,
                  customerName: user?.name || user?.firstName || 'Guest',
                  customerEmail: user?.email || '',
                  customerPhone: user?.phone || '',
                  date: new Date().toISOString().split('T')[0],
                  items: [
                    { 
                      productId: 'GC-001', 
                      name: 'Digital Gift Card', 
                      size: null, 
                      qty: 1, 
                      price: giftCardAmount, 
                      image: 'https://images.unsplash.com/photo-1622180203374-9524a54b734d?auto=format&fit=crop&q=80&w=200' 
                    }
                  ],
                  subtotal: giftCardAmount,
                  shipping: 0,
                  discount: 0,
                  gst: 0,
                  total: giftCardAmount,
                  couponCode: null,
                  paymentMethod: 'Online Payment',
                  status: 'Delivered', // digital delivery is instant
                  shippingAddress: null,
                  timeline: [
                    { status: 'Order Placed', date: new Date().toISOString() },
                    { status: 'Delivered', date: new Date().toISOString() }
                  ]
                };
                // Prepend the new order so it shows at the top
                localStorage.setItem('sterling_orders', JSON.stringify([newOrder, ...savedOrders]));
              } catch (e) {
                console.error('Failed to sync gift card to mock orders', e);
              }
            } else {
              toast.error(verifyData.error || 'Verification failed');
            }
          } catch (error) {
            toast.dismiss();
            toast.error(error.message || 'Verification failed');
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        toast.error('Payment failed: ' + response.error.description);
      });
      rzp.open();
    } catch (error) {
      toast.error(error.message || 'Could not initiate purchase');
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="bg-[#FFF0F5] min-h-screen pb-20 sm:pb-0">

      {/* ── HERO & OCCASION MOMENTS GRID (Matching Reference Image 1) ─────────── */}
      <section className="pt-10 pb-16 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-white to-[#FFF0F5]">
        <div className="max-w-7xl mx-auto text-center mb-10">
          <h1 className="font-serif text-[#7A263A] text-[32px] sm:text-[44px] lg:text-[48px] leading-tight mb-2">
            For the moments you cherish <Sparkles className="inline-block text-[#D4527A] ml-2" size={24} />
          </h1>
          <p className="text-[#8B5A65] text-[15px] sm:text-[16px]">
            Gifts that fit every occasion perfectly
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Main Large Image (Anniversary) */}
          <Link to="/shop?occasion=gifting" className="group relative rounded-2xl overflow-hidden aspect-square md:aspect-auto">
            <img src={anniversaryImg} alt="Anniversary Gifts" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#B94B68]/90 via-[#D4527A]/20 to-transparent opacity-90" />
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-[#D4527A] to-transparent">
              <span className="font-bold text-white text-[15px] sm:text-[18px]">Anniversary Gifts</span>
            </div>
          </Link>

          {/* Right Side 3-Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Top Wide (Birthday) */}
            <Link to="/shop?occasion=gifting" className="group relative rounded-2xl overflow-hidden sm:col-span-2 aspect-[2/1] sm:aspect-auto sm:h-[220px]">
              <img src={birthdayImg} alt="Birthday Gifts" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#B94B68]/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#D4527A]/90 backdrop-blur-sm">
                <span className="font-bold text-white text-[14px]">Birthday Gifts</span>
              </div>
            </Link>

            {/* Bottom Left (Wedding) */}
            <Link to="/shop?occasion=wedding" className="group relative rounded-2xl overflow-hidden aspect-square">
              <img src={weddingImg} alt="Wedding Gifts" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#B94B68]/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#D4527A]/90 backdrop-blur-sm">
                <span className="font-bold text-white text-[14px]">Wedding Gifts</span>
              </div>
            </Link>

            {/* Bottom Right (Valentine) */}
            <Link to="/shop?occasion=gifting" className="group relative rounded-2xl overflow-hidden aspect-square">
              <img src={valentineImg} alt="Valentine's Day Gifts" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#B94B68]/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#D4527A]/90 backdrop-blur-sm">
                <span className="font-bold text-white text-[14px]">Valentine's Day Gifts</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── CATEGORY BAR ──────────────────────────────────────────────────────── */}
      <div className="bg-[#B94B68] text-white">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto hide-scrollbar">
          <div className="flex items-center gap-6 py-4 min-w-max">
            {categories.map(cat => (
              <Link key={cat.id} to={`/shop?category=${cat.id}`} className="text-[13px] font-medium hover:text-[#FFD0E0] transition-colors whitespace-nowrap">
                {cat.name}
              </Link>
            ))}
            <Link to="/gifting" className="text-[13px] font-bold text-[#FFD0E0] whitespace-nowrap">Gifting</Link>
            <Link to="/shop" className="text-[13px] font-medium hover:text-[#FFD0E0] whitespace-nowrap">More Jewellery</Link>
          </div>
        </div>
      </div>

      {/* ── GIFTING MADE EASY (Gift Finder matching Reference 3) ──────────────── */}
      <section className="relative py-14 sm:py-20 px-4 sm:px-8 lg:px-16 overflow-hidden">
        {/* Diamond pattern background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#E26A89] to-[#B94B68]" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#FFF 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <h2 className="font-serif text-white text-[32px] sm:text-[40px] leading-tight mb-2">
            Gifting made easy <Sparkles className="inline-block text-white ml-1" size={20} />
          </h2>
          <p className="text-white/90 text-[14px] sm:text-[15px] mb-10">
            Our quick guide will help you find gifts they'll love
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="text-left">
              <label className="block text-white/90 font-bold text-[13px] mb-2">Price</label>
              <div className="relative">
                <select 
                  value={finderPrice} 
                  onChange={(e) => setFinderPrice(e.target.value)}
                  className="w-full appearance-none bg-white/20 border border-white/40 text-white rounded-full px-5 py-3.5 text-[14px] outline-none backdrop-blur-sm cursor-pointer"
                >
                  <option value="" className="text-charcoal">All Price</option>
                  <option value="under-2k" className="text-charcoal">Under ₹2,000</option>
                  <option value="2k-5k" className="text-charcoal">₹2,000 - ₹5,000</option>
                  <option value="above-5k" className="text-charcoal">Above ₹5,000</option>
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-white pointer-events-none" size={18} />
              </div>
            </div>

            <div className="text-left">
              <label className="block text-white/90 font-bold text-[13px] mb-2">Product Category</label>
              <div className="relative">
                <select 
                  value={finderCategory} 
                  onChange={(e) => setFinderCategory(e.target.value)}
                  className="w-full appearance-none bg-white/20 border border-white/40 text-white rounded-full px-5 py-3.5 text-[14px] outline-none backdrop-blur-sm cursor-pointer"
                >
                  <option value="" className="text-charcoal">All Product Category</option>
                  {categories.map(c => <option key={c.id} value={c.id} className="text-charcoal">{c.name}</option>)}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-white pointer-events-none" size={18} />
              </div>
            </div>

            <div className="text-left">
              <label className="block text-white/90 font-bold text-[13px] mb-2">Style</label>
              <div className="relative">
                <select 
                  value={finderStyle} 
                  onChange={(e) => setFinderStyle(e.target.value)}
                  className="w-full appearance-none bg-white/20 border border-white/40 text-white rounded-full px-5 py-3.5 text-[14px] outline-none backdrop-blur-sm cursor-pointer"
                >
                  <option value="" className="text-charcoal">All Styles</option>
                  {styles.map(s => <option key={s.id} value={s.id} className="text-charcoal">{s.name}</option>)}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-white pointer-events-none" size={18} />
              </div>
            </div>
          </div>

          <button 
            onClick={handleGiftFinder}
            className="inline-flex items-center gap-2 bg-white text-[#B94B68] px-8 py-3.5 rounded-full font-bold text-[14px] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <SearchIcon size={18} /> Find the perfect gift
          </button>
        </div>
      </section>

      {/* ── TIMELESS FAVOURITES (Tabs matching Reference 3) ────────────────────── */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 lg:px-16 bg-[#FFFAF9]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-serif text-[#7A263A] text-[32px] sm:text-[38px] leading-tight mb-2">
              Timeless favourites <Sparkles className="inline-block text-[#D4527A] ml-1" size={20} />
            </h2>
            <p className="text-[#8B5A65] text-[14px]">
              Tried, trusted, and always loved
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-10">
            <div className="bg-[#FFF0F5] p-1.5 rounded-full inline-flex w-full max-w-3xl">
              {['Most Gifted', 'Best Seller', 'New Arrivals'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 px-4 rounded-full text-[13px] font-semibold transition-all duration-300 ${
                    activeTab === tab 
                      ? 'bg-gradient-to-r from-[#D4527A] to-[#B94B68] text-white shadow-md' 
                      : 'text-[#B94B68] hover:bg-[#FFE4EE]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid based on Active Tab */}
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {tabPicks[activeTab].map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── GIFT CARDS (Matching Reference Image 2) ────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 lg:px-16 bg-gradient-to-b from-[#FFFFAF9] to-[#FFF0F5]">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-[32px] overflow-hidden flex flex-col lg:flex-row bg-gradient-to-br from-[#E87CA5] to-[#B94B68] shadow-2xl relative">
            
            {/* Left Graphics Area */}
            <div className="p-8 sm:p-14 lg:w-1/2 flex flex-col items-center justify-center text-center relative overflow-hidden">
              {/* Decorative Ribbons (Simulated with curved shapes) */}
              <div className="absolute top-1/4 -left-10 w-32 h-10 border-t-[8px] border-l-[8px] border-[#FFE4A0] rounded-tl-full rounded-tr-full opacity-60 rotate-45 blur-[1px]" />
              <div className="absolute bottom-1/4 -right-10 w-32 h-10 border-b-[8px] border-r-[8px] border-[#FFE4A0] rounded-bl-full rounded-br-full opacity-60 -rotate-45 blur-[1px]" />
              <Sparkles size={24} className="absolute top-10 right-10 text-white/80" />
              <Sparkles size={24} className="absolute bottom-10 left-10 text-white/80" />

              <h2 className="font-serif text-white text-[32px] sm:text-[42px] leading-tight mb-2 relative z-10">
                Gift Cards
              </h2>
              <p className="text-white/90 text-[14px] sm:text-[15px] mb-10 relative z-10">
                When you're unsure, give them the gift of choice
              </p>

              {/* Physical Card Mockup */}
              <div className="relative w-full max-w-[380px] rounded-2xl overflow-hidden aspect-[1.58/1] shadow-2xl transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                <img src={weddingImg} alt="Card Background" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#D4527A]/90 to-[#B94B68]/95 mix-blend-multiply" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                   <div className="w-16 h-[2px] bg-white/40 mb-3" />
                   <p className="font-logo text-white text-[24px] tracking-widest drop-shadow-md">STERLING KART</p>
                   <p className="text-white text-[12px] uppercase tracking-[4px] mt-2 border-t border-white/20 pt-2 font-serif italic">Joy of Gifting Festival</p>
                </div>
              </div>
            </div>

            {/* Right Form Area */}
            <div className="bg-white m-4 sm:m-8 lg:m-4 lg:ml-0 rounded-[24px] p-6 sm:p-10 lg:w-1/2 flex flex-col relative">
               <div className="absolute -top-4 right-6 bg-[#FFD0E0] p-3 rounded-b-xl shadow-sm">
                 <Gift size={24} className="text-[#B94B68]" />
               </div>

               <p className="text-[16px] font-medium text-text-main mb-6">Select Amount</p>
               
               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
                 {giftAmounts.map(amt => (
                   <button
                     key={amt}
                     onClick={() => setGiftCardAmount(amt)}
                     className={`relative rounded-full py-3 text-[13px] font-medium border transition-all ${
                       giftCardAmount === amt
                         ? 'bg-[#FFF0F5] text-[#D4527A] border-[#D4527A] shadow-sm'
                         : 'bg-white text-text-muted border-border-main hover:border-[#D4527A] hover:text-[#D4527A]'
                     }`}
                   >
                     {amt === 5000 && (
                       <span className="absolute -top-2.5 right-0 bg-[#B94B68] text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm">Popular</span>
                     )}
                     ₹{amt}
                   </button>
                 ))}
               </div>

               <button
                 onClick={handlePurchase}
                 disabled={isPurchasing}
                 className="w-full rounded-full border-2 border-[#D4527A] text-[#D4527A] py-3.5 font-bold text-[14px] hover:bg-[#D4527A] hover:text-white transition-colors flex items-center justify-center gap-2 mt-auto disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {isPurchasing ? 'Processing...' : 'Purchase Gift Card'}
               </button>
               
               <button
                 onClick={() => setIsHowItWorksOpen(true)}
                 className="mt-4 text-[12px] font-semibold text-[#8B5A65] underline hover:text-[#D4527A] transition-colors text-center w-full"
               >
                 How does it work? & FAQs
               </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── SUCCESS MODAL (PRO MAX UI) ────────────────────────────────────────── */}
      {generatedGiftCard && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full max-w-[440px] max-h-[90vh] overflow-y-auto bg-[#FCFAF6] rounded-[24px] shadow-2xl relative flex flex-col scrollbar-hide"
          >
            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
              <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-[#E8D4BB]/30 to-transparent"></div>
            </div>
            
            <div className="relative z-10 p-5 sm:p-6 flex flex-col items-center w-full">
              
              <button
                onClick={() => setGeneratedGiftCard(null)}
                className="absolute top-3 right-3 p-1.5 text-[#5A1F2E] hover:bg-[#5A1F2E]/10 rounded-full transition-all"
              >
                <X size={20} />
              </button>
              
              <motion.div 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-2 text-[#5A1F2E]"
              >
                {/* A stylized gift box icon */}
                <div className="w-12 h-12 bg-gradient-to-br from-[#7A263A] to-[#5A1F2E] rounded-xl flex items-center justify-center shadow-lg relative">
                  <div className="absolute top-0 w-full h-1/2 border-b-2 border-[#C6A87C]/50"></div>
                  <div className="absolute left-1/2 h-full w-2 border-l-2 border-[#C6A87C]/50 -translate-x-1/2"></div>
                  <Gift size={24} className="text-[#C6A87C] z-10" strokeWidth={1.5} />
                </div>
              </motion.div>
              
              <h3 className="font-serif text-[26px] text-[#5A1F2E] mb-0 flex items-center justify-center gap-2">
                <span className="text-[#C6A87C] text-lg">✦</span> Congratulations! <span className="text-[#C6A87C] text-lg">✦</span>
              </h3>
              
              <p className="text-[#333] text-[13px] mb-4 text-center leading-snug">
                You've earned a <strong className="font-bold text-[#5A1F2E]">Sterling Kart Gift Card</strong><br />
                Treat yourself to something special.
              </p>

              {/* Card Container */}
              <div className="w-full bg-gradient-to-b from-[#6A2535] to-[#4A1723] rounded-[20px] border-2 border-[#C6A87C] p-4 mb-4 shadow-xl relative text-center">
                <p className="text-[#C6A87C] text-[10px] font-bold tracking-[0.2em] uppercase mb-1">Gift Card Value</p>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-[#C6A87C] text-lg">✧</span>
                  <span className="font-serif text-[38px] text-[#C6A87C] leading-none">₹{generatedGiftCard.originalValue.toLocaleString()}</span>
                  <span className="text-[#C6A87C] text-lg">✧</span>
                </div>

                {/* Ticket cutout area */}
                <div className="bg-[#FAF7F2] rounded-xl py-3 px-3 relative w-full border border-[#E8D4BB] shadow-inner flex flex-col items-center">
                  <p className="text-[#5A1F2E] text-[10px] font-bold tracking-[0.15em] uppercase mb-1">Your Private Code</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-mono text-[15px] sm:text-[16px] font-bold text-[#333] tracking-[0.08em]">
                      {generatedGiftCard.plainCode}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedGiftCard.plainCode);
                        toast.success('Code copied to clipboard!', { icon: '✨' });
                      }}
                      className="text-[#5A1F2E] flex items-center gap-1 text-[12px] font-bold hover:opacity-70 transition-opacity bg-[#5A1F2E]/5 px-2 py-1 rounded-md"
                    >
                      <Copy size={12} /> Copy
                    </button>
                  </div>
                </div>

                <p className="text-[#E8D4BB] text-[12px] mt-4 flex items-center justify-center gap-1.5">
                  <Calendar size={13} />
                  Valid until {new Date(generatedGiftCard.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>

              {/* Notification Pill */}
              <div className="bg-[#F3EBE1] rounded-xl py-2 px-4 flex items-center justify-center gap-3 mb-4 w-11/12">
                <div className="w-7 h-7 rounded-full bg-[#E5D5C5] flex items-center justify-center text-[#5A1F2E] shrink-0">
                  <Lock size={13} />
                </div>
                <p className="text-[#5A1F2E] text-[12px] text-left leading-snug">
                  We've also sent this code to your<br/>
                  <strong className="font-extrabold">email & WhatsApp.</strong>
                </p>
              </div>

              {/* WhatsApp Share Button */}
              <button
                onClick={() => shareGiftCardToWhatsApp(generatedGiftCard.originalValue, generatedGiftCard.plainCode, new Date(generatedGiftCard.expiresAt).toLocaleDateString())}
                className="w-11/12 bg-gradient-to-b from-[#5A1F2E] to-[#40121F] rounded-xl py-3 flex items-center justify-center gap-3 text-white font-bold text-[13px] tracking-widest shadow-[0_4px_15px_rgba(90,31,46,0.3)] hover:shadow-[0_6px_20px_rgba(90,31,46,0.4)] transition-all border border-[#C6A87C]/30 mb-5 hover:-translate-y-0.5"
              >
                <div className="bg-[#25D366] text-white p-1 rounded-full flex items-center justify-center">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                  </svg>
                </div>
                SHARE VIA WHATSAPP
              </button>

              {/* Features Row */}
              <div className="w-full grid grid-cols-4 gap-1 border-t border-[#E8D4BB] pt-4 mb-0">
                <div className="flex flex-col items-center justify-start text-center">
                  <ShieldCheck size={18} className="text-[#C6A87C] mb-1.5" strokeWidth={1.5} />
                  <p className="text-[8px] font-bold text-[#5A1F2E] leading-tight tracking-wide">100% SECURE<br/>& VERIFIED</p>
                </div>
                <div className="flex flex-col items-center justify-start text-center border-l border-[#E8D4BB]">
                  <Award size={18} className="text-[#C6A87C] mb-1.5" strokeWidth={1.5} />
                  <p className="text-[8px] font-bold text-[#5A1F2E] leading-tight tracking-wide">PREMIUM<br/>EXPERIENCE</p>
                </div>
                <div className="flex flex-col items-center justify-start text-center border-l border-[#E8D4BB]">
                  <ShoppingBag size={18} className="text-[#C6A87C] mb-1.5" strokeWidth={1.5} />
                  <p className="text-[8px] font-bold text-[#5A1F2E] leading-tight tracking-wide">EXCLUSIVE<br/>COLLECTIONS</p>
                </div>
                <div className="flex flex-col items-center justify-start text-center border-l border-[#E8D4BB]">
                  <Headphones size={18} className="text-[#C6A87C] mb-1.5" strokeWidth={1.5} />
                  <p className="text-[8px] font-bold text-[#5A1F2E] leading-tight tracking-wide">DEDICATED<br/>SUPPORT</p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-center gap-2 mt-4 opacity-90">
                <div className="w-8 h-8 rounded-full border border-[#5A1F2E] flex items-center justify-center text-[#5A1F2E] font-serif font-bold text-xs">SK</div>
                <div className="text-left">
                  <p className="text-[#5A1F2E] font-serif text-[13px] leading-none mb-1">STERLING KART</p>
                  <p className="text-[#8B5A65] text-[9px] leading-none">www.sterlingkart.in</p>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}

      {/* ── HOW IT WORKS & FAQ MODAL ────────────────────────────────────────── */}
      {isHowItWorksOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onMouseDown={() => setIsHowItWorksOpen(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full max-w-[500px] max-h-[90vh] overflow-y-auto bg-white rounded-[24px] shadow-2xl relative flex flex-col scrollbar-hide"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#F0E8EA] bg-[#FAF8F7] px-6 py-5 shrink-0 rounded-t-[24px]">
              <h3 className="font-serif text-[22px] text-text-main flex items-center gap-2">
                <Gift size={20} className="text-[#D4527A]" /> Gift Card Guide
              </h3>
              <button
                onClick={() => setIsHowItWorksOpen(false)}
                className="p-1.5 text-text-muted hover:bg-black/5 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 md:p-8">
              <h4 className="text-[14px] font-bold text-text-main mb-4 uppercase tracking-[1px]">How it works</h4>
              <div className="space-y-4 mb-8">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#FFF0F5] text-[#D4527A] font-bold flex items-center justify-center shrink-0">1</div>
                  <div>
                    <p className="font-bold text-[13px] text-text-main">Choose an Amount</p>
                    <p className="text-[12px] text-text-muted mt-1">Select the value you want to gift. They can spend it on anything they love.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#FFF0F5] text-[#D4527A] font-bold flex items-center justify-center shrink-0">2</div>
                  <div>
                    <p className="font-bold text-[13px] text-text-main">Get Your Secure Code</p>
                    <p className="text-[12px] text-text-muted mt-1">After payment, you will instantly receive a unique 16-character code.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#FFF0F5] text-[#D4527A] font-bold flex items-center justify-center shrink-0">3</div>
                  <div>
                    <p className="font-bold text-[13px] text-text-main">Share & Redeem</p>
                    <p className="text-[12px] text-text-muted mt-1">Share the code with your loved one via WhatsApp. They can apply it at checkout!</p>
                  </div>
                </div>
              </div>

              <h4 className="text-[14px] font-bold text-text-main mb-4 uppercase tracking-[1px] pt-6 border-t border-[#F0E8EA]">Frequently Asked Questions</h4>
              <div className="space-y-5">
                <div>
                  <p className="font-bold text-[13px] text-text-main flex gap-2"><Sparkles size={14} className="text-[#D4527A] mt-0.5" /> Does the Gift Card expire?</p>
                  <p className="text-[12px] text-text-muted mt-1">Yes, Sterling Kart gift cards are valid for exactly 1 year from the date of purchase.</p>
                </div>
                <div>
                  <p className="font-bold text-[13px] text-text-main flex gap-2"><Sparkles size={14} className="text-[#D4527A] mt-0.5" /> Can it be used multiple times?</p>
                  <p className="text-[12px] text-text-muted mt-1">Yes! If the order total is less than the gift card value, the remaining balance stays on the card for future purchases.</p>
                </div>
                <div>
                  <p className="font-bold text-[13px] text-text-main flex gap-2"><Sparkles size={14} className="text-[#D4527A] mt-0.5" /> Can I use multiple cards on one order?</p>
                  <p className="text-[12px] text-text-muted mt-1">Currently, only one gift card can be applied per checkout.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── RECIPIENT SECTIONS (For Her, Him, etc.) ───────────────────────────── */}
      <div className="pt-8 pb-16 text-center px-4">
         <h2 className="font-serif text-[#7A263A] text-[28px] sm:text-[36px] mb-2">Thoughtfully curated for everyone <Sparkles className="inline-block text-[#D4527A] ml-1" size={20} /></h2>
         <p className="text-[#8B5A65] text-[14px]">Browse our hand-picked collections by recipient</p>
      </div>

      <RecipientSection
        id="for-her"
        title="For Her"
        subtitle="Delicate necklaces, earrings & pendants she'll treasure forever"
        image={forHerImg}
        shopLink="/shop?category=necklaces"
        picks={herPicks}
      />
      
      <div className="bg-bg-alt">
        <RecipientSection
          id="for-him"
          title="For Him"
          subtitle="Masculine chains, bracelets & rings crafted in premium silver"
          image={forHimImg}
          shopLink="/shop?category=bracelets"
          picks={himPicks}
        />
      </div>

      <RecipientSection
        id="for-sister"
        title="For Sister"
        subtitle="Playful anklets, earrings & nose pins she'll absolutely love"
        image={forSisterImg}
        shopLink="/shop?category=earrings"
        picks={sisterPicks}
      />

      <div className="bg-bg-alt">
        <RecipientSection
          id="for-mother"
          title="For Mother"
          subtitle="Timeless bangles, traditional sets & elegant necklaces for her grace"
          image={forMotherImg}
          shopLink="/shop?category=bangles"
          picks={motherPicks}
        />
      </div>

    </div>
  );
}

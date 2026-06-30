import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star, Gift, Sparkles, ChevronRight, ArrowRight, Search as SearchIcon, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { products, categories, stoneTypes, occasions, styles } from '../data/products';
import { formatPrice } from '../utils/formatPrice';

import giftingHero from '../assets/images/gifting_hero.png';
import forHerImg from '../assets/images/gifting_for_her.png';
import forHimImg from '../assets/images/gifting_for_him.png';
import forSisterImg from '../assets/images/gifting_for_sister.png';
import forMotherImg from '../assets/images/gifting_for_mother.png';
import forFriendsImg from '../assets/images/gifting_for_friends.png';
import birthdayImg from '../assets/images/gifting_birthday.png';
import valentineImg from '../assets/images/gifting_valentine.png';
import diwaliImg from '../assets/images/gifting_diwali.png';
import anniversaryImg from '../assets/images/gifting_anniversary.png';
import weddingImg from '../assets/images/gifting_wedding.png';

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
  const [giftCardAmount, setGiftCardAmount] = useState(5000);
  const [activeTab, setActiveTab] = useState('Most Gifted');
  
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

  const giftAmounts = [1000, 2000, 3000, 5000, 7000, 10000, 15000, 20000, 25000, 30000, 50000, 100000];

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

               <button className="w-full rounded-full border-2 border-[#D4527A] text-[#D4527A] py-3.5 font-bold text-[14px] hover:bg-[#D4527A] hover:text-white transition-colors flex items-center justify-center gap-2 mt-auto">
                 Purchase Gift Card
               </button>
            </div>
          </div>
        </div>
      </section>

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

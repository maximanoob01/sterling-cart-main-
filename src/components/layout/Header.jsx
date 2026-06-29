import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingCart, Heart, Search, User, Menu, X, ChevronDown, IndianRupee, Sun, Moon, PackageSearch, Gift, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';
import { products } from '../../data/products';
import { formatPrice } from '../../utils/formatPrice';

const announcements = [
  "Free shipping above Rs. 1,999 | Exchange within 15 days",
  "Use code SILVER10 for 10% off your first order!",
  "New arrivals are here ✨ Shop the latest 925 silver trends",
  "Hallmarked authenticity with every piece you buy"
];

const categoryLinks = [
  ['Rings', 'rings'],
  ['Earrings', 'earrings'],
  ['Necklaces', 'necklaces'],
  ['Bracelets', 'bracelets'],
  ['Pendants', 'pendants'],
  ['Silver Coins', 'coins'],
  ['Anklets', 'anklets'],
  ['Bangles', 'bangles'],
  ['Chains', 'chains'],
  ['Nose Pins', 'nose-pins'],
  ['Sets', 'sets'],
];

const navLinks = [
  { name: 'All Jewellery', path: '/shop', megaMenu: true },
  { name: 'Rings', path: '/shop?category=rings', megaMenu: true },
  { name: 'Earrings', path: '/shop?category=earrings', megaMenu: true },
  { name: 'Necklaces', path: '/shop?category=necklaces', megaMenu: true },
  { name: 'Bracelets', path: '/shop?category=bracelets', megaMenu: true },
  { name: 'Pendants', path: '/shop?category=pendants', megaMenu: true },
  { name: 'Silver Coins', path: '/shop?category=coins', megaMenu: true },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [isHeroPage, setIsHeroPage] = useState(false);

  useEffect(() => {
    if (!showAnnouncement) return;
    const interval = setInterval(() => {
      setAnnouncementIndex((prev) => (prev + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [showAnnouncement]);
  const [isSilverPriceOpen, setIsSilverPriceOpen] = useState(false);
  const [isCartAnimating, setIsCartAnimating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showTrackPointer, setShowTrackPointer] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const previousTotalItems = useRef(totalItems);

  const [profileTextIndex, setProfileTextIndex] = useState(0);
  const profileTexts = useMemo(() => ["Profile", "Login", "Sign Up"], []);

  useEffect(() => {
    if (isAuthenticated) return;
    const interval = setInterval(() => {
      setProfileTextIndex((prev) => (prev + 1) % profileTexts.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isAuthenticated, profileTexts]);

  useEffect(() => {
    setIsHeroPage(location.pathname === '/');
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (location.state?.showTrackOrderPointer) {
      setShowTrackPointer(true);
      // Clean up state so it doesn't reappear on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state?.showTrackOrderPointer, navigate, location.pathname]);

  useEffect(() => {
    if (showTrackPointer) {
      const timer = setTimeout(() => setShowTrackPointer(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showTrackPointer]);

  useEffect(() => {
    if (!isSilverPriceOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsSilverPriceOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = '';
    };
  }, [isSilverPriceOpen]);

  useEffect(() => {
    if (totalItems > previousTotalItems.current) {
      setIsCartAnimating(true);
      const timer = setTimeout(() => setIsCartAnimating(false), 1100);
      previousTotalItems.current = totalItems;
      return () => clearTimeout(timer);
    }
    previousTotalItems.current = totalItems;
    return undefined;
  }, [totalItems]);

  if (location.pathname.startsWith('/admin')) return null;

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 1, 0.5, 1] } },
  };

  const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07, delayChildren: 0.3 } },
  };

  const itemFade = {
    hidden: { opacity: 0, y: -8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <>
      <AnimatePresence>
        {showAnnouncement && (
          <motion.div
            initial={{ height: 36, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`relative flex h-9 items-center overflow-hidden text-white z-[60] ${
              isHeroPage && !isScrolled
                ? 'bg-black/30 backdrop-blur-md'
                : 'bg-[#121212]'
            }`}
            style={isHeroPage ? { position: 'fixed', top: 0, left: 0, right: 0 } : {}}
          >
            {/* Subtle shimmer overlay on announcement */}
            {isHeroPage && !isScrolled && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
            )}
            <p className="w-full px-10 text-center text-[11px] tracking-[0.4px] sm:text-[12px]">
              <AnimatePresence mode="wait">
                <motion.span
                  key={announcementIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="inline-block"
                >
                  {announcements[announcementIndex]}
                </motion.span>
              </AnimatePresence>
            </p>
            <button
              onClick={() => setShowAnnouncement(false)}
              className="absolute right-4 text-white/60 transition-colors hover:text-white"
              aria-label="Close announcement"
            >
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.header
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className={`z-50 w-full transition-all duration-700 ease-out ${
          isHeroPage
            ? `fixed top-0 left-0 right-0 ${
                isScrolled
                  ? 'bg-[#1E0912]/92 backdrop-blur-2xl shadow-[0_4px_40px_rgba(212,82,122,0.22)] border-b border-[#D4527A]/25'
                  : 'bg-transparent'
              }`
            : 'sticky top-0 bg-[#1E0912]/96 backdrop-blur-2xl shadow-[0_4px_40px_rgba(212,82,122,0.18)] border-b border-[#D4527A]/20'
        }`}
        style={isHeroPage && showAnnouncement ? { top: '36px' } : {}}
      >
        {/* Luxury gradient shimmer line at bottom of header — only on hero, unscrolled */}
        {isHeroPage && !isScrolled && (
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        )}

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mx-auto flex min-h-[74px] max-w-[1420px] items-center justify-between gap-5 px-4 md:px-8"
        >
          <motion.button variants={itemFade} onClick={() => setIsMobileMenuOpen(true)} className="p-2 lg:hidden rounded-lg transition-all text-white hover:bg-white/10" aria-label="Open menu">
            <Menu size={23} />
          </motion.button>

          <motion.div variants={itemFade}>
            <Link to="/" className="shrink-0 transition-colors text-white" aria-label="Sterling Kart home">
              <LogoMark heroMode={true} />
            </Link>
          </motion.div>

          <motion.div variants={itemFade} className="hidden w-full max-w-[600px] lg:block">
            <ProductSearch
              query={searchQuery}
              setQuery={setSearchQuery}
              navigate={navigate}
              onClose={() => setIsSearchOpen(false)}
              heroMode={true}
            />
          </motion.div>

          <motion.div variants={staggerContainer} className="flex items-center gap-1 sm:gap-2">
            <motion.span variants={itemFade} className="lg:hidden">
              <HeaderIcon onClick={() => setIsSearchOpen(!isSearchOpen)} label="Search" heroMode={true}>
                <Search size={18} />
              </HeaderIcon>
            </motion.span>

            <motion.button variants={itemFade} type="button" onClick={() => setIsSilverPriceOpen(true)} className="lg:hidden" aria-label="Silver Price Today">
              <HeaderIcon label="Silver Price Today" heroMode={true}>
                <IndianRupee size={18} />
              </HeaderIcon>
            </motion.button>



            <motion.button
              variants={itemFade}
              type="button"
              onClick={() => setIsSilverPriceOpen(true)}
              className="hidden h-[42px] items-center gap-2.5 overflow-hidden rounded-full border border-white/25 bg-white/10 px-3 xl:px-4 shadow-[0_4px_20px_rgba(212,82,122,0.18)] backdrop-blur-md transition-all duration-300 lg:flex hover:bg-white/20 hover:border-white/40 hover:shadow-[0_6px_28px_rgba(212,82,122,0.3)]"
              aria-label="View today's silver price"
            >
              {/* Animated shimmer */}
              <motion.span
                animate={{ x: ['-200%', '300%'] }}
                transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut', repeatDelay: 2 }}
                className="absolute inset-0 z-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none"
              />
              <span className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#D4527A] text-white shadow-[0_2px_8px_rgba(212,82,122,0.55)]">
                <IndianRupee size={14} strokeWidth={2.5} />
              </span>
              <span className="relative z-10 hidden flex-col items-start xl:flex">
                <span className="text-[10px] font-black uppercase tracking-[1.2px] text-white leading-none">Silver Price</span>
                <span className="text-[9px] font-semibold tracking-[0.5px] text-white/55 leading-none mt-0.5">Today</span>
              </span>
              <span className="relative z-10 flex xl:hidden text-[11px] font-bold uppercase tracking-[1px] text-white drop-shadow-sm">Silver</span>
            </motion.button>
            <motion.div variants={itemFade} className="hidden lg:block relative">
              <Link to="/track-order">
                <HeaderIcon label="Track order" text="Track order" attention={showTrackPointer} heroMode={true}><PackageSearch size={19} /></HeaderIcon>
              </Link>
              <AnimatePresence>
                {showTrackPointer && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className="absolute top-[120%] right-0 w-[220px] bg-[#D4527A] text-white p-3 rounded-xl shadow-[0_10px_40px_rgba(212,82,122,0.4)] z-[100] pointer-events-none"
                  >
                    <div className="absolute -top-2 right-4 w-4 h-4 bg-[#D4527A] rotate-45 rounded-sm"></div>
                    <p className="font-sans text-[12px] font-bold text-center leading-relaxed">
                      You can track your order status here!
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {isAuthenticated ? (
              <motion.div variants={itemFade} className="hidden sm:block">
                <Link to="/dashboard?tab=wishlist">
                  <HeaderIcon label="Wishlist" text="Wishlist" count={wishlistItems.length} heroMode={true}><Heart size={18} /></HeaderIcon>
                </Link>
              </motion.div>
            ) : (
              <motion.button variants={itemFade} type="button" onClick={useAuth().openAuthModal} className="hidden sm:block">
                <HeaderIcon label="Wishlist" text="Wishlist" count={wishlistItems.length} heroMode={true}><Heart size={18} /></HeaderIcon>
              </motion.button>
            )}

            <motion.div variants={itemFade} className="hidden sm:block">
              <Link to="/cart">
                <HeaderIcon label="Cart" text="Cart" count={totalItems} attention={isCartAnimating} heroMode={true}><ShoppingCart size={18} /></HeaderIcon>
              </Link>
            </motion.div>

            {isAuthenticated ? (
              <motion.div variants={itemFade} className="hidden sm:block">
                <Link to={isAdmin ? '/admin' : '/dashboard'}>
                  <HeaderIcon label="Profile" text="Profile" heroMode={true}>
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#D4527A] font-serif text-[11px] font-bold text-white shadow-sm ring-1 ring-white/20">
                      {user?.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                  </HeaderIcon>
                </Link>
              </motion.div>
            ) : (
              <motion.button variants={itemFade} type="button" onClick={useAuth().openAuthModal} className="hidden sm:block">
                <HeaderIcon 
                  label="Profile" 
                  text={
                    <div className="relative flex h-[13px] w-[46px] items-center justify-center overflow-hidden">
                      <AnimatePresence mode="popLayout">
                        <motion.span
                          key={profileTextIndex}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="absolute block whitespace-nowrap text-center"
                        >
                          {profileTexts[profileTextIndex]}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  } 
                  heroMode={true}
                >
                  <User size={18} />
                </HeaderIcon>
              </motion.button>
            )}
          </motion.div>
        </motion.div>

        {/* Bottom Nav Bar */}
        <nav
        className={`hidden border-t lg:block transition-colors duration-700 ${
            isHeroPage && !isScrolled
              ? 'border-white/10 bg-transparent'
              : 'border-[#D4527A]/20 bg-[#1E0912]/92 backdrop-blur-xl'
          }`}
          onMouseLeave={() => setActiveDropdown(null)}
        >
          <div className="mx-auto flex min-h-[48px] max-w-[1420px] items-center justify-between gap-5 px-8">
            <div className="flex items-center gap-1 xl:gap-3">
              {navLinks.map((link) => (
                <div key={link.name} onMouseEnter={() => setActiveDropdown(link.name)}>
                  <Link
                    to={link.path}
                    className={`flex items-center gap-1 px-3 py-4 text-[12px] font-semibold tracking-[0.5px] transition-all duration-200 xl:text-[13px] ${
                      isHeroPage && !isScrolled
                        ? `text-white/70 hover:text-white ${activeDropdown === link.name ? 'text-white' : ''}`
                        : `text-white/80 hover:text-white ${activeDropdown === link.name ? 'text-white' : ''}`
                    }`}
                  >
                    {link.name}
                    <ChevronDown size={13} className="opacity-60" />
                  </Link>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <div onMouseEnter={() => setActiveDropdown('Gifts')}>
                <Link
                  to="/shop?occasion=gifting"
                  className={`flex items-center gap-1.5 px-3 py-4 text-[12px] font-semibold tracking-[0.5px] transition-all duration-200 xl:text-[13px] ${
                    isHeroPage && !isScrolled
                      ? `text-white/70 hover:text-white ${activeDropdown === 'Gifts' ? 'text-white' : ''}`
                      : `text-white/80 hover:text-white ${activeDropdown === 'Gifts' ? 'text-white' : ''}`
                  }`}
                >
                  <Gift size={15} /> Gifts <ChevronDown size={13} className="opacity-60" />
                </Link>
              </div>
              <div onMouseEnter={() => setActiveDropdown('Offers')}>
                <Link
                  to="/shop?badge=Bestseller"
                  className={`flex items-center gap-1 px-3 py-4 text-[12px] font-semibold tracking-[0.5px] transition-all duration-200 xl:text-[13px] ${
                    isHeroPage && !isScrolled
                      ? `text-white/70 hover:text-white ${activeDropdown === 'Offers' ? 'text-white' : ''}`
                      : `text-white/80 hover:text-white ${activeDropdown === 'Offers' ? 'text-white' : ''}`
                  }`}
                >
                  Offers <ChevronDown size={13} className="opacity-60" />
                </Link>
              </div>
              <Link
                to="/about"
                className={`px-3 py-4 text-[12px] font-semibold tracking-[0.5px] transition-all duration-200 xl:text-[13px] ${
                  isHeroPage && !isScrolled ? 'text-white/70 hover:text-white' : 'text-white/80 hover:text-white'
                }`}
              >Our Story</Link>
            </div>
          </div>
          <AnimatePresence>
            {activeDropdown && (
              <MegaMenu activeDropdown={activeDropdown} onClose={() => setActiveDropdown(null)} />
            )}
          </AnimatePresence>
        </nav>

      </motion.header>

      {/* Mobile Search Overlay — fixed so it overlays hero/page content */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] bg-black/40 lg:hidden"
              onClick={() => setIsSearchOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="fixed left-0 right-0 top-0 z-[100] bg-bg-surface shadow-modal px-4 pt-4 pb-5 lg:hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] font-semibold text-text-main tracking-wide">Search</span>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-silver-100 text-text-muted"
                  aria-label="Close search"
                >
                  <X size={16} />
                </button>
              </div>
              <ProductSearch
                query={searchQuery}
                setQuery={setSearchQuery}
                navigate={navigate}
                onClose={() => setIsSearchOpen(false)}
                autoFocus
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSilverPriceOpen && <SilverPriceModal onClose={() => setIsSilverPriceOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/35 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', duration: 0.25 }} className="fixed inset-y-0 left-0 z-[70] w-[290px] overflow-y-auto bg-bg-surface p-6 shadow-modal lg:hidden">
              <div className="mb-8 flex items-center justify-between">
                <LogoMark compact />
                <button onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu"><X size={22} /></button>
              </div>
              <nav className="flex flex-col gap-5">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-[15px] font-medium">Home</Link>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsSilverPriceOpen(true);
                  }}
                  className="flex items-center justify-between rounded-xl border border-[#F1D8DE] bg-[#FFF6E3] px-3 py-3 text-left"
                >
                  <span>
                    <span className="block text-[13px] font-semibold text-[#55483F]">Silver Price Today</span>
                    <span className="mt-0.5 block text-[11px] text-[#9B806B]">View today's silver snapshot</span>
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D4527A] text-white"><IndianRupee size={16} /></span>
                </button>
                {navLinks.map((link) => (
                  <div key={link.name}>
                    <Link to={link.path} onClick={() => setIsMobileMenuOpen(false)} className="text-[15px] font-medium">{link.name}</Link>
                    {link.name === 'All Jewellery' && (
                      <div className="mt-3 grid grid-cols-2 gap-2 border-l border-[#FFF0F5] pl-3">
                        {categoryLinks.map(([name, id]) => <Link key={id} to={`/shop?category=${id}`} onClick={() => setIsMobileMenuOpen(false)} className="text-[13px] text-text-muted">{name}</Link>)}
                      </div>
                    )}
                  </div>
                ))}
                <Link to="/track-order" onClick={() => setIsMobileMenuOpen(false)} className="text-[15px] font-medium">Track Order</Link>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Floating Bottom Nav for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border-main bg-bg-surface/95 px-2 py-2 pb-[calc(env(safe-area-inset-bottom)+8px)] shadow-[0_-4px_24px_rgba(0,0,0,0.06)] backdrop-blur-xl sm:hidden">
        <Link to="/track-order" className="flex flex-col items-center gap-1 p-2 text-text-muted transition-colors hover:text-[#D4527A]">
          <PackageSearch size={20} />
          <span className="text-[9px] font-semibold uppercase tracking-[0.5px]">Track</span>
        </Link>
        <Link to="/dashboard?tab=wishlist" className="flex flex-col items-center gap-1 p-2 text-text-muted transition-colors hover:text-[#D4527A]">
          <span className="relative">
            <Heart size={20} />
            {wishlistItems.length > 0 && <span className="absolute -right-2 -top-2 flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-[#D4527A] px-1 text-[8px] font-bold text-white">{wishlistItems.length}</span>}
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-[0.5px]">Wishlist</span>
        </Link>
        <Link to="/cart" className={`flex flex-col items-center gap-1 p-2 text-text-muted transition-colors hover:text-[#D4527A] ${isCartAnimating ? 'cart-attention' : ''}`}>
          <span className="relative">
            <ShoppingCart size={20} />
            {totalItems > 0 && <span className="absolute -right-2 -top-2 flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-[#D4527A] px-1 text-[8px] font-bold text-white">{totalItems}</span>}
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-[0.5px]">Cart</span>
        </Link>
        {isAuthenticated ? (
          <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex flex-col items-center gap-1 p-2 text-text-muted transition-colors hover:text-[#D4527A]">
            <User size={20} />
            <span className="relative mt-0.5 flex h-[11px] w-[48px] items-center justify-center overflow-hidden text-[9px] font-semibold uppercase tracking-[0.5px]">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={`mobile-auth-${profileTextIndex}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="absolute whitespace-nowrap"
                >
                  {profileTexts[profileTextIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
          </Link>
        ) : (
          <button type="button" onClick={useAuth().openAuthModal} className="flex flex-col items-center gap-1 p-2 text-text-muted transition-colors hover:text-[#D4527A]">
            <User size={20} />
            <span className="relative mt-0.5 flex h-[11px] w-[48px] items-center justify-center overflow-hidden text-[9px] font-semibold uppercase tracking-[0.5px]">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={`mobile-guest-${profileTextIndex}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="absolute whitespace-nowrap"
                >
                  {profileTexts[profileTextIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
          </button>
        )}
      </nav>
    </>
  );
}

const silverSnapshot = {
  today: 102.4,
  previous: 101.1,
  low: 98.6,
  high: 104.8,
  allTimeLow: 34.7,
};

function SilverPriceModal({ onClose }) {
  const trendingProducts = [...products]
    .sort((a, b) => (b.reviewCount + b.rating * 20) - (a.reviewCount + a.rating * 20))
    .slice(0, 4);
  const dailyChange = silverSnapshot.today - silverSnapshot.previous;
  const dailyChangePercent = (dailyChange / silverSnapshot.previous) * 100;
  const dateLabel = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1A1A1A]/45 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <motion.section
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="silver-price-title"
        onMouseDown={(event) => event.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-[980px] flex-col overflow-hidden rounded-2xl bg-bg-surface shadow-modal"
      >
        <div className="flex items-start justify-between border-b border-[#EEEAE8] px-5 py-5 sm:px-7">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[1.6px] text-[#B94B68]">Sterling Kart silver tracker</p>
            <h2 id="silver-price-title" className="mt-1 font-serif text-[28px] text-text-main sm:text-[32px]">Silver price today</h2>
            <p className="mt-1 text-[12px] text-[#888]">{dateLabel} · Indicative retail reference</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F8F5F4] text-text-muted transition-colors hover:bg-pink-50 hover:text-[#B94B68]" aria-label="Close silver price tracker">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5 sm:px-7">
          <div className="rounded-2xl bg-[#1C1C2E] p-6 sm:p-8 text-white sm:flex sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[1.3px] text-[#E7BCC5]">925 silver · per gram</p>
              <p className="mt-3 font-serif text-[48px] sm:text-[64px] leading-none text-[#F4A0B0]">Rs. {silverSnapshot.today.toFixed(2)}</p>
            </div>
            <p className="mt-3 flex items-center gap-1 text-[12px] font-semibold text-[#98D9B0] sm:mt-0">
              <TrendingUp size={15} /> +Rs. {dailyChange.toFixed(2)} ({dailyChangePercent.toFixed(2)}%) vs previous close
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SilverStat label="Previous close" value={`Rs. ${silverSnapshot.previous.toFixed(2)}`} />
            <SilverStat label="Today's low" value={`Rs. ${silverSnapshot.low.toFixed(2)}`} />
            <SilverStat label="Today's high" value={`Rs. ${silverSnapshot.high.toFixed(2)}`} />
            <SilverStat label="All-time low" value={`Rs. ${silverSnapshot.allTimeLow.toFixed(2)}`} icon={<TrendingDown size={14} />} />
          </div>

          <p className="mt-3 text-[11px] leading-5 text-text-muted">
            Indicative store reference only. Jewellery prices also depend on design, craftsmanship, stones, and applicable taxes.
          </p>

          <div className="mt-6 flex items-end justify-between border-t border-[#EEEAE8] pt-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[1.4px] text-[#B94B68]">Popular today</p>
              <h3 className="mt-1 font-serif text-[22px] text-text-main">Trending silver picks</h3>
            </div>
            <Link to="/shop" onClick={onClose} className="hidden items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.7px] text-[#B94B68] sm:flex">
              View all <ArrowRight size={13} />
            </Link>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2">
            {trendingProducts.map((product) => (
              <Link key={product.id} to={`/product/${product.slug}`} onClick={onClose} className="group min-w-0">
                <div className="aspect-square overflow-hidden rounded-xl bg-bg-alt">
                  <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </div>
                <p className="mt-2 line-clamp-2 text-[10px] font-medium leading-3 text-[#444] group-hover:text-[#B94B68] sm:text-[11px]">{product.name}</p>
                <p className="mt-0.5 text-[10px] font-semibold text-text-muted">{formatPrice(product.price)}</p>
              </Link>
            ))}
          </div>

        </div>
        <div className="sticky bottom-0 border-t border-[#EEEAE8] bg-bg-surface/95 px-5 py-4 backdrop-blur-sm sm:px-7">
          <Link to="/shop" onClick={onClose} className="btn-primary w-full">
            Continue shopping
          </Link>
        </div>
      </motion.section>
    </motion.div>
  );
}

function SilverStat({ label, value, icon }) {
  return (
    <div className="rounded-xl border border-[#EEEAE8] bg-bg-primary p-3">
      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.7px] text-text-muted">{icon}{label}</p>
      <p className="mt-2 text-[15px] font-semibold text-text-main">{value}</p>
    </div>
  );
}

function LogoMark({ compact = false, heroMode = false }) {
  return (
    <span className="flex flex-col items-center leading-none">
      <span
        className={`${
          compact ? 'text-[19px]' : 'text-[21px] xl:text-[24px]'
        } brand-wordmark whitespace-nowrap transition-colors duration-500 ${
          heroMode ? 'text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]' : ''
        }`}
      >
        STERLING KART
      </span>
      <span className={`${
        compact ? 'mt-1 text-[7px]' : 'mt-1.5 text-[7px] xl:text-[8px]'
      } brand-submark whitespace-nowrap transition-colors duration-500 ${
        heroMode ? 'text-white/60' : ''
      }`}>
        925 SILVER JEWELS
      </span>
    </span>
  );
}

function ProductSearch({ query, setQuery, navigate, onClose, autoFocus = false, heroMode = false }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef(null);
  const normalizedQuery = query.trim().toLowerCase();

  const trendingProducts = useMemo(
    () => [...products].sort((a, b) => (b.reviewCount + b.rating * 20) - (a.reviewCount + a.rating * 20)).slice(0, 5),
    []
  );

  const suggestions = useMemo(() => {
    if (!normalizedQuery) return trendingProducts;
    return products
      .filter((product) => [
        product.name,
        product.category,
        product.stoneType,
        product.style,
        product.shortDescription,
      ].some((value) => value?.toLowerCase().includes(normalizedQuery)))
      .slice(0, 6);
  }, [normalizedQuery, trendingProducts]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const submitSearch = (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
    setShowSuggestions(false);
    onClose();
  };

  const openProduct = (slug) => {
    navigate(`/product/${slug}`);
    setQuery('');
    setShowSuggestions(false);
    onClose();
  };

  return (
    <div ref={containerRef} className="relative">
      <form
        onSubmit={submitSearch}
        className={`flex h-[42px] items-center gap-2 rounded-full px-4 transition-all duration-300 ${
          heroMode
            ? 'border border-white/25 bg-white/10 backdrop-blur-md focus-within:border-white/50 focus-within:bg-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.15)]'
            : 'border border-[#E5DFDC] bg-[#FAF8F7] focus-within:border-[#D9909F] focus-within:bg-bg-surface focus-within:shadow-[0_0_0_3px_rgba(217,144,159,0.12)]'
        }`}
      >
        <Search size={16} className={`shrink-0 ${heroMode ? 'text-white/60' : 'text-[#A8A8A8]'}`} />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search rings, earrings, necklaces..."
          className={`min-w-0 flex-1 border-none bg-transparent text-[13px] outline-none ${
            heroMode ? 'text-white placeholder:text-white/40' : 'text-text-main placeholder:text-text-muted'
          }`}
          autoFocus={autoFocus}
          aria-label="Search products"
        />
        {query && <button type="button" onClick={() => setQuery('')} className={heroMode ? 'text-white/50 hover:text-white' : 'text-text-muted hover:text-text-main'} aria-label="Clear search"><X size={15} /></button>}
      </form>

      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute left-0 right-0 top-[calc(100%+10px)] z-[80] overflow-hidden rounded-2xl border border-border-main bg-bg-surface shadow-modal"
          >
            <div className="flex items-center justify-between border-b border-[#F0ECEA] px-4 py-3">
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[1px] text-[#B94B68]">
                {!normalizedQuery && <TrendingUp size={14} />}
                {normalizedQuery ? 'Suggestions' : 'Trending products'}
              </p>
              {normalizedQuery && <span className="text-[11px] text-text-muted">{suggestions.length} found</span>}
            </div>
            {suggestions.length > 0 ? (
              <div className="max-h-[370px] overflow-y-auto p-2">
                {suggestions.map((product) => (
                  <button key={product.id} type="button" onClick={() => openProduct(product.slug)} className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-pink-50">
                    <img src={product.images[0]} alt="" className="h-12 w-12 shrink-0 rounded-lg bg-bg-alt object-cover" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-text-main">{product.name}</span>
                      <span className="mt-0.5 block text-[11px] capitalize text-text-muted">{product.category}</span>
                    </span>
                    <span className="text-[12px] font-semibold text-text-main">{formatPrice(product.price)}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-6 text-center">
                <p className="text-[13px] text-[#666]">No matching jewellery found.</p>
                <button type="button" onClick={submitSearch} className="mt-2 text-[12px] font-semibold text-[#B94B68]">Search all products</button>
              </div>
            )}
            {normalizedQuery && suggestions.length > 0 && (
              <button type="button" onClick={submitSearch} className="flex w-full items-center justify-center gap-2 border-t border-[#F0ECEA] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.8px] text-[#B94B68] hover:bg-pink-50">
                View all results for "{query.trim()}"
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MegaMenu({ activeDropdown, onClose }) {
  if (activeDropdown === 'Gifts') return <GiftMegaMenu onClose={onClose} />;
  if (activeDropdown === 'Offers') return <OffersMegaMenu onClose={onClose} />;

  const activeCategory = activeDropdown === 'All Jewellery' || activeDropdown === 'Gifting'
    ? null
    : (activeDropdown === 'Silver Coins' ? 'coins' : activeDropdown.toLowerCase());
  const featuredProducts = products
    .filter((product) => !activeCategory || product.category === activeCategory)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="absolute left-0 right-0 top-full border-b border-[#D4527A]/20 shadow-[0_16px_48px_rgba(212,82,122,0.18)]"
      style={{ background: 'linear-gradient(135deg, #1E0912 0%, #2A0D1A 50%, #1A0810 100%)' }}
    >
      {/* Top shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4527A]/40 to-transparent" />

      <div className="mx-auto grid max-w-[1420px] grid-cols-[1.15fr_0.9fr_0.9fr_1.45fr]">
        <MegaColumn title="Shop by category" className="border-r border-[#D4527A]/15">
          <div className="grid grid-cols-2 gap-x-6 gap-y-0.5">
            {categoryLinks.map(([name, id]) => (
              <Link key={id} to={`/shop?category=${id}`} onClick={onClose}
                className="rounded-lg px-2.5 py-2 text-[13px] text-white/60 transition-all hover:bg-[#D4527A]/15 hover:text-white">
                {name}
              </Link>
            ))}
          </div>
          <Link to="/shop" onClick={onClose}
            className="mt-4 block rounded-full border border-[#D4527A]/40 bg-[#D4527A]/10 px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-[1px] text-[#F4A0B0] hover:bg-[#D4527A]/25 hover:text-white transition-all">
            View all jewellery →
          </Link>
        </MegaColumn>

        <MegaColumn title="Shop by occasion" className="border-r border-[#D4527A]/15">
          {[
            ['Everyday wear', 'everyday'],
            ['Wedding specials', 'wedding'],
            ['Festive sparkle', 'festivals'],
            ['Gifts for loved ones', 'gifting'],
            ['Office elegance', 'office'],
          ].map(([name, id]) => <MegaLink key={id} to={`/shop?occasion=${id}`} onClick={onClose}>{name}</MegaLink>)}
        </MegaColumn>

        <MegaColumn title="Discover your style" className="border-r border-[#D4527A]/15">
          {[
            ['Minimalist', 'minimalist'],
            ['Boho', 'boho'],
            ['Traditional', 'traditional'],
            ['Statement', 'statement'],
          ].map(([name, id]) => <MegaLink key={id} to={`/shop?style=${id}`} onClick={onClose}>{name}</MegaLink>)}
          <div className="mt-5 border-t border-[#D4527A]/20 pt-4">
            <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#F4A0B0]">925 sterling silver</p>
            <p className="mt-1.5 text-[12px] leading-5 text-white/40">Hallmarked pieces made for everyday wear.</p>
          </div>
        </MegaColumn>

        <MegaColumn title={activeCategory ? `Popular ${activeDropdown}` : 'Trending now'}>
          <div className="grid grid-cols-3 gap-3">
            {featuredProducts.map((product) => (
              <Link key={product.id} to={`/product/${product.slug}`} onClick={onClose} className="group">
                <div className="aspect-square overflow-hidden rounded-xl bg-white/5 border border-white/8">
                  <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover opacity-90 transition-all duration-400 group-hover:scale-105 group-hover:opacity-100" />
                </div>
                <p className="mt-2 line-clamp-2 text-[12px] font-medium leading-[1.4] text-white/70 group-hover:text-[#F4A0B0] transition-colors">{product.name}</p>
                <p className="mt-1 text-[11px] font-semibold text-[#D4527A]">{formatPrice(product.price)}</p>
              </Link>
            ))}
          </div>
        </MegaColumn>
      </div>
    </motion.div>
  );
}

function GiftMegaMenu({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="absolute left-0 right-0 top-full border-b border-[#D4527A]/20 shadow-[0_16px_48px_rgba(212,82,122,0.18)]"
      style={{ background: 'linear-gradient(135deg, #1E0912 0%, #2A0D1A 50%, #1A0810 100%)' }}
    >
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4527A]/40 to-transparent" />
      <div className="mx-auto grid max-w-[1420px] grid-cols-[0.9fr_0.85fr_1fr_1.35fr]">
        <MegaColumn title="Gifts by occasion" className="border-r border-[#D4527A]/15">
          {[
            ['Birthday gifts', '#festivals'],
            ['Anniversary gifts', ''],
            ['Wedding gifts', ''],
            ['Festive gifting', '#festivals'],
            ['Just because', ''],
          ].map(([name, hash]) => <MegaLink key={name} to={`/gifting${hash}`} onClick={onClose}>{name}</MegaLink>)}
          <Link to="/gifting" onClick={onClose}
            className="mt-4 block rounded-full border border-[#D4527A]/40 bg-[#D4527A]/10 px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-[1px] text-[#F4A0B0] hover:bg-[#D4527A]/25 hover:text-white transition-all">
            View all gifts →
          </Link>
        </MegaColumn>

        <MegaColumn title="Shop by budget" className="border-r border-[#D4527A]/15">
          {[
            ['Under Rs. 1,000', ''],
            ['Under Rs. 2,000', ''],
            ['Under Rs. 3,000', ''],
            ['Under Rs. 5,000', ''],
            ['Premium picks', ''],
          ].map(([name, hash]) => <MegaLink key={name} to={`/gifting${hash}`} onClick={onClose}>{name}</MegaLink>)}
        </MegaColumn>

        <MegaColumn title="Gifts for someone special" className="border-r border-[#D4527A]/15">
          {[
            ['For her', '#for-her'],
            ['For him', '#for-him'],
            ['For sister', '#for-sister'],
            ['For mother', '#for-mother'],
            ['For friends', '#for-friends'],
          ].map(([name, hash]) => <MegaLink key={name} to={`/gifting${hash}`} onClick={onClose}>{name}</MegaLink>)}
          <div className="mt-5 border-t border-[#D4527A]/20 pt-4">
            <p className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#F4A0B0]">Gift-ready packaging</p>
            <p className="mt-1.5 text-[12px] leading-5 text-white/40">Beautifully packed and ready to make their day.</p>
          </div>
        </MegaColumn>

        <div className="min-h-[300px] p-6">
          <h3 className="mb-4 border-b border-[#D4527A]/20 pb-3 font-serif text-[17px] font-semibold text-white/90">Trending gift offers</h3>
          <div className="grid grid-cols-2 gap-3">
            <GiftOfferCard eyebrow="First order" title="10% off" text="A little welcome gift for your first Sterling Kart order." to="/gifting" tone="pink" onClose={onClose} />
            <GiftOfferCard eyebrow="Most loved" title="Gift picks" text="Discover bestselling pieces chosen for special moments." to="/gifting" tone="dark" onClose={onClose} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function OffersMegaMenu({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="absolute left-0 right-0 top-full border-b border-[#D4527A]/20 shadow-[0_16px_48px_rgba(212,82,122,0.18)]"
      style={{ background: 'linear-gradient(135deg, #1E0912 0%, #2A0D1A 50%, #1A0810 100%)' }}
    >
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#D4527A]/40 to-transparent" />
      <div className="mx-auto grid max-w-[1420px] grid-cols-[0.8fr_1.6fr]">
        <MegaColumn title="Explore offers" className="border-r border-[#D4527A]/15">
          <MegaLink to="/shop?badge=Bestseller" onClick={onClose}>Bestselling deals</MegaLink>
          <MegaLink to="/shop?badge=New" onClick={onClose}>New arrival offers</MegaLink>
          <MegaLink to="/shop?occasion=gifting" onClick={onClose}>Gifting specials</MegaLink>
          <MegaLink to="/shop?maxPrice=1500" onClick={onClose}>Under Rs. 1,500</MegaLink>
        </MegaColumn>
        <div className="p-6">
          <h3 className="mb-4 border-b border-[#D4527A]/20 pb-3 font-serif text-[17px] font-semibold text-white/90">Trending offers</h3>
          <div className="grid grid-cols-3 gap-3">
            <GiftOfferCard eyebrow="Welcome offer" title="10% off" text="Save on your first order." to="/shop" tone="pink" onClose={onClose} />
            <GiftOfferCard eyebrow="Free delivery" title="Ship free" text="On orders above Rs. 1,999." to="/shop" tone="dark" onClose={onClose} />
            <GiftOfferCard eyebrow="Policy" title="No Returns" text="Exchange within 15 days of delivery." to="/return-exchange" tone="pink" onClose={onClose} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function GiftOfferCard({ eyebrow, title, text, to, tone, onClose }) {
  const dark = tone === 'dark';
  return (
    <Link to={to} onClick={onClose} className={`group relative min-h-[156px] overflow-hidden rounded-xl border p-4 transition-transform hover:-translate-y-0.5 ${dark ? 'border-[#2D2D44] bg-[#1C1C2E] text-white' : 'border-[#F1D8DE] bg-[#FFF4F6] text-text-main'}`}>
      <div className={`absolute -bottom-8 -right-7 h-24 w-24 rounded-full ${dark ? 'bg-bg-surface/5' : 'bg-[#F4A0B0]/20'}`} />
      <p className={`text-[10px] font-semibold uppercase tracking-[1.2px] ${dark ? 'text-[#E7BCC5]' : 'text-[#B94B68]'}`}>{eyebrow}</p>
      <h4 className="mt-2 font-serif text-[25px] leading-tight">{title}</h4>
      <p className={`mt-2 text-[11px] leading-5 ${dark ? 'text-white/60' : 'text-text-muted'}`}>{text}</p>
      <span className={`mt-3 block text-[10px] font-semibold uppercase tracking-[0.8px] ${dark ? 'text-[#E7BCC5]' : 'text-[#B94B68]'}`}>Shop now</span>
    </Link>
  );
}

function MegaColumn({ title, children, className = '' }) {
  return (
    <div className={`min-h-[280px] p-6 ${className}`}>
      <h3 className="mb-4 border-b border-[#D4527A]/20 pb-3 font-serif text-[17px] font-semibold text-white/85">{title}</h3>
      {children}
    </div>
  );
}

function MegaLink({ children, to, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block rounded-lg px-2.5 py-2 text-[13px] text-white/55 transition-all hover:bg-[#D4527A]/15 hover:text-white hover:pl-4"
    >
      {children}
    </Link>
  );
}

function HeaderIcon({ children, count, label, onClick, text, attention = false, heroMode = false }) {
  const baseClass = `relative flex h-10 min-w-10 flex-col items-center justify-center gap-[3px] rounded-lg px-2 transition-all duration-200 xl:h-11 ${
    heroMode
      ? 'text-white/80 hover:text-white hover:bg-white/12'
      : 'text-text-main hover:bg-pink-50 hover:text-[#D4527A]'
  }`;

  const content = (
    <>
      <span className={`relative ${attention ? 'cart-attention' : ''}`}>
        {children}
        {count > 0 && (
          <span className="absolute -right-2 -top-2 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-[#D4527A] px-1 text-[8px] font-bold text-white shadow-[0_1px_4px_rgba(212,82,122,0.6)]">
            {count}
          </span>
        )}
      </span>
      {text && (
        <span className={`hidden text-[9px] font-semibold uppercase tracking-[0.5px] xl:block ${
          heroMode ? 'text-white/50' : 'text-text-muted'
        }`}>{text}</span>
      )}
    </>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className={baseClass} aria-label={label}>
        {content}
      </button>
    );
  }

  return (
    <span className={baseClass} aria-label={label}>
      {content}
    </span>
  );
}

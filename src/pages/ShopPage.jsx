import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Star, SlidersHorizontal, X, ChevronRight, Home, ShoppingBag, SlidersHorizontal as FilterIcon, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { categories, stoneTypes, occasions, styles, colors, designs, collections } from '../data/products';
import { useProducts } from '../context/ProductContext';
import { calculateDiscount } from '../utils/formatPrice';
import { useCurrency } from '../context/CurrencyContext';

/* ─────────────────────────  STAR RATING  ─────────────────────────────── */
const StarRating = ({ rating, size = 12 }) => (
  <div className="flex items-center gap-[2px]">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={size}
        className={i <= Math.round(rating) ? 'fill-[#F4A0B0] text-[#F4A0B0]' : 'fill-[#E8E8E8] text-[#E8E8E8]'}
      />
    ))}
  </div>
);

/* ─────────────────────────  FILTER SECTION  ─────────────────────────── */
function FilterSection({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-[#F0E8EA] pb-5 mb-5 last:border-none last:mb-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between mb-4 group"
      >
        <span className="text-[11px] font-bold uppercase tracking-[1.5px] text-text-main">{title}</span>
        <span className={`text-[#D4527A] transition-transform duration-300 ${open ? 'rotate-90' : ''}`}>
          <ChevronRight size={14} />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────  LUXURY CHECKBOX  ─────────────────────────────── */
function LuxuryCheckbox({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group py-1">
      <span className={`relative flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200 ${
        checked
          ? 'border-[#D4527A] bg-gradient-to-br from-[#D4527A] to-[#B94B68] shadow-[0_2px_8px_rgba(212,82,122,0.35)]'
          : 'border-[#D9C5C9] bg-white group-hover:border-[#F4A0B0]'
      }`}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        {checked && <Check size={11} className="text-white" strokeWidth={3} />}
      </span>
      <span className={`text-[13px] transition-colors capitalize ${
        checked ? 'text-text-main font-medium' : 'text-text-muted group-hover:text-text-main'
      }`}>{label}</span>
    </label>
  );
}

/* ─────────────────────────  PRODUCT CARD  ────────────────────────────── */
const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();
  const { formatPrice } = useCurrency();
  const discount = calculateDiscount(product.price, product.mrp);
  const wishlisted = isWishlisted(product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="group relative flex flex-col w-full rounded-2xl overflow-hidden bg-bg-surface border border-[#F0E8EA] transition-all duration-500 hover:shadow-[0_12px_40px_rgba(212,82,122,0.12)] hover:-translate-y-1"
    >
      {/* Badges container */}
      <div className="absolute top-3 left-3 right-12 z-10 flex flex-wrap gap-1.5 pointer-events-none">
        {product.badge && (
          <span className="rounded-full bg-[#1C1C2E]/90 backdrop-blur-sm px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.8px] text-white pointer-events-auto">
            {product.badge}
          </span>
        )}
        {discount > 0 && (
          <span className="rounded-full bg-[#FFF0F5] border border-[#F4A0B0]/40 px-2 py-1 text-[9px] font-bold text-[#D4527A] pointer-events-auto">
            −{discount}%
          </span>
        )}
      </div>

      {/* Wishlist */}
      <button
        onClick={() => toggleItem(product)}
        className={`absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300 ${
          wishlisted
            ? 'border-[#F4A0B0] bg-[#FFF0F5] text-[#D4527A]'
            : 'border-white/60 bg-white/70 text-[#C0C0C0] backdrop-blur-sm hover:border-[#F4A0B0] hover:bg-[#FFF0F5] hover:text-[#D4527A]'
        }`}
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart size={14} className={wishlisted ? 'fill-[#D4527A]' : ''} />
      </button>

      {/* Image */}
      <Link to={`/product/${product.slug || product.id}`} className="block overflow-hidden aspect-[4/5] bg-[#FAF8F7]">
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
          loading="lazy"
        />
        {/* Hover overlay with quick-add */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out z-10 px-3 pb-3">
          <button
            onClick={(e) => { e.preventDefault(); addItem(product); }}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1C1C2E] py-2.5 text-[11px] font-bold uppercase tracking-[1.5px] text-white shadow-lg hover:bg-[#D4527A] transition-colors duration-300"
          >
            <ShoppingBag size={13} /> Quick Add
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/product/${product.slug || product.id}`}>
          <h3 className="font-sans text-[13px] font-medium text-text-main line-clamp-2 leading-[1.45] tracking-[0.1px] hover:text-[#D4527A] transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-1.5 mt-2">
          <StarRating rating={product.rating} size={11} />
          <span className="text-[11px] text-[#B0B0B0]">({product.reviewCount})</span>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-serif font-medium text-text-main text-[15px]">{formatPrice(product.price)}</span>
          {product.mrp > product.price && (
            <span className="text-[12px] text-[#B0B0B0] line-through">{formatPrice(product.mrp)}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/* ─────────────────────────  SKELETON CARD  ───────────────────────────── */
function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border border-[#F0E8EA] bg-bg-surface flex flex-col">
      <div className="aspect-[4/5] skeleton-bg" />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-3.5 w-4/5 rounded-full skeleton-bg" />
        <div className="h-3 w-1/2 rounded-full skeleton-bg" />
        <div className="h-4 w-1/3 rounded-full skeleton-bg mt-1" />
      </div>
    </div>
  );
}

/* ─────────────────────────  MAIN PAGE  ────────────────────────────────── */
export default function ShopPage() {
  const { products } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const observer = useRef();
  const lastProductElementRef = useCallback(node => {
    if (isLoading || isLoadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setIsLoadingMore(true);
        setTimeout(() => { setVisibleCount(prev => prev + 12); setIsLoadingMore(false); }, 500);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, isLoadingMore]);

  const [selectedAvailabilities, setSelectedAvailabilities] = useState([]);
  const [priceRange, setPriceRange] = useState([0, Number(searchParams.get('maxPrice')) || 350000]);
  const [selectedDesigns, setSelectedDesigns] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(
    searchParams.get('category') ? [searchParams.get('category')] : []
  );
  const [selectedStyles, setSelectedStyles] = useState(
    searchParams.get('style') ? [searchParams.get('style')] : []
  );
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [selectedOccasions, setSelectedOccasions] = useState(
    searchParams.get('occasion') ? [searchParams.get('occasion')] : []
  );
  const [selectedColors, setSelectedColors] = useState([]);

  const [sortBy, setSortBy] = useState('popularity');
  const searchQuery = searchParams.get('search')?.trim() || '';
  const badgeFilter = searchParams.get('badge')?.trim() || '';

  useEffect(() => {
    const cp = searchParams.get('category');
    if (cp && !selectedCategories.includes(cp)) setSelectedCategories([cp]);
    const op = searchParams.get('occasion');
    if (op && !selectedOccasions.includes(op)) setSelectedOccasions([op]);
    const sp = searchParams.get('style');
    if (sp && !selectedStyles.includes(sp)) setSelectedStyles([sp]);
    const mp = Number(searchParams.get('maxPrice'));
    if (mp && priceRange[1] !== mp) setPriceRange([0, mp]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    let f = [...products];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      f = f.filter(p => [p.name, p.category, p.stoneType, p.style, p.shortDescription].some(v => v?.toLowerCase().includes(q)));
    }
    if (badgeFilter) f = f.filter(p => p.badge?.toLowerCase() === badgeFilter.toLowerCase());
    
    if (selectedAvailabilities.length > 0) {
      f = f.filter(p => {
        if (selectedAvailabilities.includes('in-stock') && p.inStock) return true;
        if (selectedAvailabilities.includes('out-of-stock') && !p.inStock) return true;
        return false;
      });
    }
    
    f = f.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    
    if (selectedDesigns.length > 0) f = f.filter(p => selectedDesigns.includes(p.design));
    if (selectedCategories.length > 0) f = f.filter(p => selectedCategories.includes(p.category));
    if (selectedStyles.length > 0) f = f.filter(p => selectedStyles.includes(p.style));
    if (selectedCollections.length > 0) f = f.filter(p => selectedCollections.includes(p.collection));
    if (selectedOccasions.length > 0) f = f.filter(p => selectedOccasions.includes(p.occasion));
    if (selectedColors.length > 0) f = f.filter(p => selectedColors.includes(p.color));

    switch (sortBy) {
      case 'price-low': f.sort((a, b) => a.price - b.price); break;
      case 'price-high': f.sort((a, b) => b.price - a.price); break;
      case 'new': f.sort((a, b) => (b.isNew === a.isNew ? 0 : b.isNew ? 1 : -1)); break;
      default: f.sort((a, b) => b.rating - a.rating); break;
    }
    return f;
  }, [searchQuery, badgeFilter, selectedCategories, priceRange, selectedAvailabilities, selectedDesigns, selectedCollections, selectedColors, selectedOccasions, selectedStyles, sortBy]);

  const displayedProducts = filteredProducts.slice(0, visibleCount);

  const totalActive = selectedAvailabilities.length + selectedCategories.length + selectedDesigns.length + selectedOccasions.length + selectedStyles.length + selectedCollections.length + selectedColors.length + (priceRange[1] < 350000 ? 1 : 0);

  const handleCheckbox = (setState, state, value) => {
    setState(state.includes(value) ? state.filter(i => i !== value) : [...state, value]);
    setVisibleCount(12);
  };

  const clearFilters = () => {
    setSelectedAvailabilities([]); setPriceRange([0, 350000]); setSelectedDesigns([]);
    setSelectedCategories([]); setSelectedStyles([]); setSelectedCollections([]);
    setSelectedOccasions([]); setSelectedColors([]); setSortBy('popularity');
    setSearchParams({}); setVisibleCount(12);
  };

  /* Sidebar inner */
  const SidebarContent = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <span className="font-serif text-[22px] text-text-main">Refine</span>
        {totalActive > 0 && (
          <button onClick={clearFilters} className="text-[11px] font-semibold uppercase tracking-[1px] text-[#D4527A] hover:text-[#B94B68] transition-colors">
            Clear all ({totalActive})
          </button>
        )}
      </div>

      <FilterSection title="Availability">
        <div className="flex flex-col gap-1">
          <LuxuryCheckbox
            checked={selectedAvailabilities.includes('in-stock')}
            onChange={() => handleCheckbox(setSelectedAvailabilities, selectedAvailabilities, 'in-stock')}
            label="In Stock"
          />
          <LuxuryCheckbox
            checked={selectedAvailabilities.includes('out-of-stock')}
            onChange={() => handleCheckbox(setSelectedAvailabilities, selectedAvailabilities, 'out-of-stock')}
            label="Out of Stock"
          />
        </div>
      </FilterSection>

      <FilterSection title="Price">
        <div className="px-1">
          <input
            type="range" min="0" max="350000"
            value={priceRange[1]}
            onChange={e => { setPriceRange([0, parseInt(e.target.value)]); setVisibleCount(12); }}
            className="w-full accent-[#D4527A]"
          />
          <div className="flex justify-between mt-3">
            <span className="text-[12px] font-medium text-[#D4527A] bg-[#FFF0F5] border border-[#F4A0B0]/30 px-2.5 py-1 rounded-full">₹0</span>
            <span className="text-[12px] font-medium text-[#D4527A] bg-[#FFF0F5] border border-[#F4A0B0]/30 px-2.5 py-1 rounded-full">₹{priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Design">
        <div className="flex flex-col gap-1">
          {designs && designs.map(d => (
            <LuxuryCheckbox
              key={d.id} checked={selectedDesigns.includes(d.id)}
              onChange={() => handleCheckbox(setSelectedDesigns, selectedDesigns, d.id)}
              label={d.name}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Jewel Type">
        <div className="flex flex-col gap-1">
          {categories.map(c => (
            <LuxuryCheckbox
              key={c.id} checked={selectedCategories.includes(c.id)}
              onChange={() => handleCheckbox(setSelectedCategories, selectedCategories, c.id)}
              label={c.name}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Style">
        <div className="flex flex-col gap-1">
          {styles.map(s => (
            <LuxuryCheckbox
              key={s.id} checked={selectedStyles.includes(s.id)}
              onChange={() => handleCheckbox(setSelectedStyles, selectedStyles, s.id)}
              label={s.name}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Shop By Collections">
        <div className="flex flex-col gap-1">
          {collections && collections.map(c => (
            <LuxuryCheckbox
              key={c.id} checked={selectedCollections.includes(c.id)}
              onChange={() => handleCheckbox(setSelectedCollections, selectedCollections, c.id)}
              label={c.name}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Occasions">
        <div className="flex flex-col gap-1">
          {occasions.map(o => (
            <LuxuryCheckbox
              key={o.id} checked={selectedOccasions.includes(o.id)}
              onChange={() => handleCheckbox(setSelectedOccasions, selectedOccasions, o.id)}
              label={o.name}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Color">
        <div className="flex flex-col gap-2 mt-1">
          {colors && colors.map(c => {
            const isSelected = selectedColors.includes(c.id);
            return (
              <label key={c.id} className="flex items-center gap-3 cursor-pointer group">
                <div 
                  className={`w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${isSelected ? 'border-[#D4527A] scale-110' : 'border-transparent shadow-sm group-hover:border-[#D9C5C9]'}`}
                  style={{ backgroundColor: c.hex }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleCheckbox(setSelectedColors, selectedColors, c.id)}
                    className="hidden"
                  />
                  {isSelected && <Check size={12} className="text-white drop-shadow-md" strokeWidth={3} />}
                </div>
                <span className={`text-[13px] uppercase tracking-[0.5px] ${isSelected ? 'font-medium text-text-main' : 'text-text-muted group-hover:text-text-main'}`}>
                  {c.name}
                </span>
              </label>
            )
          })}
        </div>
      </FilterSection>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-primary">

      {/* ── Luxury Page Header ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#FFF0F5] via-[#FDF5F8] to-[#FAF8F7] border-b border-[#F0E8EA]">
        {/* Decorative radial glow */}
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(212,82,122,0.07)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(244,160,176,0.08)_0%,transparent_70%)] pointer-events-none" />

        <div className="relative max-w-[1320px] mx-auto px-5 md:px-8 pt-6 pb-8 md:pt-8 md:pb-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[12px] text-text-muted mb-6">
            <Link to="/" className="flex items-center gap-1 hover:text-[#D4527A] transition-colors">
              <Home size={13} /> Home
            </Link>
            <ChevronRight size={11} className="text-[#D9C5C9]" />
            <span className="text-[#D4527A] font-medium">
              {searchQuery ? `Search: "${searchQuery}"` : badgeFilter || 'All Jewellery'}
            </span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[2px] text-[#D4527A] mb-2">Sterling Kart Collection</p>
              <h1 className="font-serif text-[32px] md:text-[44px] text-text-main leading-[1.1] tracking-[-0.5px]">
                {searchQuery ? `"${searchQuery}"` : badgeFilter ? `${badgeFilter} Picks` : 'All Jewellery'}
              </h1>
              <p className="mt-2 text-[14px] text-text-muted">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'piece' : 'pieces'} crafted in 925 sterling silver
              </p>
            </div>

            {/* Active filter pills */}
            {totalActive > 0 && (
              <div className="flex flex-wrap gap-2">
                {[
                  ...selectedAvailabilities.map(x => ({ val: x, set: setSelectedAvailabilities, state: selectedAvailabilities })),
                  ...selectedCategories.map(x => ({ val: x, set: setSelectedCategories, state: selectedCategories })),
                  ...selectedDesigns.map(x => ({ val: x, set: setSelectedDesigns, state: selectedDesigns })),
                  ...selectedStyles.map(x => ({ val: x, set: setSelectedStyles, state: selectedStyles })),
                  ...selectedCollections.map(x => ({ val: x, set: setSelectedCollections, state: selectedCollections })),
                  ...selectedOccasions.map(x => ({ val: x, set: setSelectedOccasions, state: selectedOccasions })),
                  ...selectedColors.map(x => ({ val: x, set: setSelectedColors, state: selectedColors })),
                ].map((item, idx) => (
                  <span key={idx} className="flex items-center gap-1.5 rounded-full bg-[#FFF0F5] border border-[#F4A0B0]/40 px-3 py-1.5 text-[11px] font-medium text-[#D4527A] capitalize">
                    {item.val.replace(/-/g, ' ')}
                    <button onClick={() => handleCheckbox(item.set, item.state, item.val)}><X size={10} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="max-w-[1320px] mx-auto px-5 md:px-8 py-6 md:py-8 flex gap-7 items-start">

        {/* ── Desktop Sidebar ── */}
        <aside className="hidden md:block w-[240px] lg:w-[260px] shrink-0 sticky top-[130px] self-start rounded-2xl border border-[#F0E8EA] bg-bg-surface p-6 shadow-[0_4px_24px_rgba(212,82,122,0.06)]">
          <SidebarContent />
        </aside>

        {/* ── Mobile Sidebar Overlay ── */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm md:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.28 }}
                className="fixed inset-y-0 left-0 z-[70] w-[300px] overflow-y-auto bg-bg-surface p-6 shadow-[4px_0_32px_rgba(0,0,0,0.12)] md:hidden"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="font-serif text-[22px] text-text-main">Refine</span>
                  <button onClick={() => setIsSidebarOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-50 text-text-muted hover:text-[#D4527A]">
                    <X size={16} />
                  </button>
                </div>
                <SidebarContent />
                <div className="mt-6">
                  <button onClick={() => setIsSidebarOpen(false)} className="btn-primary w-full">
                    View {filteredProducts.length} results
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ── Product Area ── */}
        <div className="flex-1 min-w-0">

          {/* Toolbar */}
          <div className="flex items-center justify-between mb-5 gap-3">
            {/* Mobile filter trigger */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden flex items-center gap-2 rounded-full border border-[#F0E8EA] bg-bg-surface px-4 py-2 text-[12px] font-semibold text-text-main shadow-sm hover:border-[#F4A0B0] transition-colors"
            >
              <FilterIcon size={14} /> Filters {totalActive > 0 && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#D4527A] text-[9px] font-bold text-white">{totalActive}</span>}
            </button>

            <span className="hidden md:block text-[13px] text-text-muted">
              Showing <strong className="text-text-main">{displayedProducts.length}</strong> of <strong className="text-text-main">{filteredProducts.length}</strong>
            </span>

            {/* Sort */}
            <div className="ml-auto flex items-center gap-2 shrink-0">
              <span className="hidden md:block text-[12px] font-semibold uppercase tracking-[0.5px] text-text-muted">Sort</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="rounded-full border border-[#F0E8EA] bg-bg-surface px-2.5 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-[12px] font-medium text-text-main outline-none focus:border-[#F4A0B0] cursor-pointer shadow-sm transition-all hover:border-[#F4A0B0] max-w-[135px] sm:max-w-none truncate"
              >
                <option value="popularity">Most Popular</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
                <option value="new">New Arrivals</option>
              </select>
            </div>
          </div>

          {/* Grid or Empty */}
          {filteredProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF0F5] text-[#F4A0B0]">
                <ShoppingBag size={32} strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-[26px] text-text-main mb-2">No pieces found</h3>
              <p className="text-[14px] text-text-muted mb-8 max-w-[300px]">Try adjusting your filters or search terms to discover more jewellery.</p>
              <button onClick={clearFilters} className="btn-primary">Clear all filters</button>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                  : displayedProducts.map((product, index) => {
                      const isLast = displayedProducts.length === index + 1 && visibleCount < filteredProducts.length;
                      return (
                        <div ref={isLast ? lastProductElementRef : undefined} key={product.id}>
                          <ProductCard product={product} />
                        </div>
                      );
                    })
                }
              </div>

              {/* Loading more */}
              <AnimatePresence>
                {isLoadingMore && visibleCount < filteredProducts.length && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-12 gap-4"
                  >
                    <div className="relative h-10 w-10">
                      <div className="absolute inset-0 rounded-full border-2 border-[#FFF0F5]" />
                      <div className="absolute inset-0 rounded-full border-2 border-t-[#D4527A] animate-spin" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[2px] text-[#D4527A]">Loading more</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* End of results */}
              {!isLoadingMore && visibleCount >= filteredProducts.length && filteredProducts.length > 12 && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="mt-10 flex flex-col items-center gap-3"
                >
                  <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-[#F4A0B0] to-transparent" />
                  <p className="text-[11px] font-medium uppercase tracking-[2px] text-text-muted">All {filteredProducts.length} pieces shown</p>
                  <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-[#F4A0B0] to-transparent" />
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

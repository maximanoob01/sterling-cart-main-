import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Star, SlidersHorizontal, X, ChevronRight, Home } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { products, categories, stoneTypes, occasions, styles } from '../data/products';
import { formatPrice, calculateDiscount } from '../utils/formatPrice';

/* ─────────────────────────  STAR RATING HELPER  ───────────────────────── */
const StarRating = ({ rating, size = 16 }) => (
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

/* ─────────────────────────  PRODUCT CARD (INLINE)  ───────────────────── */
const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();
  const discount = calculateDiscount(product.price, product.mrp);
  const wishlisted = isWishlisted(product.id);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="group bg-bg-surface rounded-xl overflow-hidden relative flex flex-col w-full border border-border-main transition-shadow hover:shadow-product">
      {/* Badge */}
      {product.badge && (
        <span className="absolute top-[12px] left-[12px] z-10 bg-[#1C1C2E] text-white text-[11px] font-sans font-medium uppercase tracking-[0.5px] px-[10px] py-[4px] rounded-full">
          {product.badge}
        </span>
      )}

      {/* Wishlist heart */}
      <button
        onClick={() => toggleItem(product)}
        className="absolute top-[12px] right-[12px] z-10 w-[34px] h-[34px] rounded-full bg-bg-surface/90 shadow-sm flex items-center justify-center transition-colors duration-300 hover:text-[#D4527A]"
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart
          size={18}
          className={wishlisted ? 'fill-[#F4A0B0] text-[#F4A0B0]' : 'text-[#C0C0C0] group-hover:text-[#F4A0B0]'}
        />
      </button>

      {/* Image */}
      <Link to={`/product/${product.slug || product.id}`} className="block overflow-hidden aspect-square bg-[#FAFAFA]">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-400 ease-in-out"
        />
      </Link>

      {/* Info */}
      <div className="p-[14px] sm:p-[16px] flex flex-col flex-1">
        <Link to={`/product/${product.slug || product.id}`}>
          <h3 className="font-sans text-[15px] font-medium text-text-main mb-1 line-clamp-2 leading-[1.4] tracking-[0.1px]">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-[6px] mt-1">
          <StarRating rating={product.rating} size={13} />
          <span className="text-[13px] text-[#A8A8A8] font-sans">({product.reviewCount})</span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-baseline gap-2">
            <span className="font-sans font-semibold text-text-main text-[16px]">{formatPrice(product.price)}</span>
            {product.mrp > product.price && (
              <span className="text-[13px] text-[#A8A8A8] line-through font-sans">{formatPrice(product.mrp)}</span>
            )}
          </div>
          {product.mrp > product.price && (
            <span className="text-[11px] font-medium bg-[#FFF0F5] text-[#D4527A] px-[6px] py-[2px] rounded-[4px] font-sans">
              {discount}% OFF
            </span>
          )}
        </div>

        <button
          onClick={() => addItem(product)}
          className="mt-4 w-full h-[40px] rounded-full border border-[#E7BCC5] text-[#B94B68] text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.5px] transition-colors hover:bg-[#D4527A] hover:text-white hover:border-[#D4527A]"
        >
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
};

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    // Simulate network request
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const observer = useRef();
  const lastProductElementRef = useCallback(node => {
    if (isLoading || isLoadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setIsLoadingMore(true);
        // Simulate a tiny delay for the premium loading animation effect
        setTimeout(() => {
          setVisibleCount(prev => prev + 12);
          setIsLoadingMore(false);
        }, 600);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoading, isLoadingMore]);

  // Filters state
  const [selectedCategories, setSelectedCategories] = useState(
    searchParams.get('category') ? [searchParams.get('category')] : []
  );
  const [priceRange, setPriceRange] = useState([0, Number(searchParams.get('maxPrice')) || 10000]);
  const [selectedStones, setSelectedStones] = useState([]);
  const [selectedOccasions, setSelectedOccasions] = useState(
    searchParams.get('occasion') ? [searchParams.get('occasion')] : []
  );
  const [selectedStyles, setSelectedStyles] = useState(
    searchParams.get('style') ? [searchParams.get('style')] : []
  );
  const [sortBy, setSortBy] = useState('popularity');
  const searchQuery = searchParams.get('search')?.trim() || '';
  const badgeFilter = searchParams.get('badge')?.trim() || '';

  // Sync URL params to state on load
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && !selectedCategories.includes(categoryParam)) {
      setSelectedCategories([categoryParam]);
    }
    const occasionParam = searchParams.get('occasion');
    if (occasionParam && !selectedOccasions.includes(occasionParam)) {
      setSelectedOccasions([occasionParam]);
    }
    const styleParam = searchParams.get('style');
    if (styleParam && !selectedStyles.includes(styleParam)) {
      setSelectedStyles([styleParam]);
    }
    const maxPriceParam = Number(searchParams.get('maxPrice'));
    if (maxPriceParam && priceRange[1] !== maxPriceParam) {
      setPriceRange([0, maxPriceParam]);
    }
  // URL changes are an external navigation input for this filter state.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Apply filters
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (searchQuery) {
      const normalizedSearch = searchQuery.toLowerCase();
      filtered = filtered.filter(p => [
        p.name,
        p.category,
        p.stoneType,
        p.style,
        p.shortDescription,
      ].some(value => value?.toLowerCase().includes(normalizedSearch)));
    }

    if (badgeFilter) {
      filtered = filtered.filter(p => p.badge?.toLowerCase() === badgeFilter.toLowerCase());
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p => selectedCategories.includes(p.category));
    }
    
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    if (selectedStones.length > 0) {
      filtered = filtered.filter(p => selectedStones.includes(p.stoneType));
    }
    if (selectedOccasions.length > 0) {
      filtered = filtered.filter(p => selectedOccasions.includes(p.occasion));
    }
    if (selectedStyles.length > 0) {
      filtered = filtered.filter(p => selectedStyles.includes(p.style));
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'new':
        filtered.sort((a, b) => (b.isNew === a.isNew ? 0 : b.isNew ? 1 : -1));
        break;
      case 'popularity':
      default:
        filtered.sort((a, b) => b.rating - a.rating);
        break;
    }

    return filtered;
  }, [searchQuery, badgeFilter, selectedCategories, priceRange, selectedStones, selectedOccasions, selectedStyles, sortBy]);

  const displayedProducts = filteredProducts.slice(0, visibleCount);

  const handleCheckboxChange = (setState, state, value) => {
    if (state.includes(value)) {
      setState(state.filter(item => item !== value));
    } else {
      setState([...state, value]);
    }
    setVisibleCount(12); // Reset pagination on filter change
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 10000]);
    setSelectedStones([]);
    setSelectedOccasions([]);
    setSelectedStyles([]);
    setSortBy('popularity');
    setSearchParams({});
    setVisibleCount(12);
  };

  return (
    <div className="bg-bg-primary min-h-screen pb-[80px]">
      {/* Breadcrumb */}
      <div className="bg-[#FFF0F5] py-[16px] px-4 md:px-10 lg:px-20 text-[13px] font-sans text-text-main">
        <div className="max-w-[1440px] mx-auto flex items-center gap-[8px]">
          <Link to="/" className="flex items-center gap-1 hover:text-[#F4A0B0] transition-colors">
            <Home size={14} /> Home
          </Link>
          <ChevronRight size={12} className="text-[#A8A8A8]" />
          <span className="text-[#F4A0B0] font-medium">Shop All</span>
        </div>
      </div>

      {/* Page Header */}
      <div className="max-w-[1320px] mx-auto px-4 md:px-8 py-[36px]">
        <h1 className="font-serif text-[40px] text-text-main mb-[8px]">
          {searchQuery ? `Search results for "${searchQuery}"` : 'Shop All'}
        </h1>
        <p className="font-sans text-[15px] text-text-muted">
          {searchQuery ? `${filteredProducts.length} matching products found.` : 'Discover our full collection of premium silver jewellery.'}
        </p>
      </div>

      <div className="max-w-[1320px] mx-auto px-4 md:px-8 flex flex-col md:flex-row gap-[28px]">
        
        {/* Mobile Filter Button */}
        <div className="md:hidden flex justify-between items-center mb-4">
          <button 
            className="btn-secondary py-[10px] px-[20px] flex items-center gap-2"
            onClick={() => setIsSidebarOpen(true)}
          >
            <SlidersHorizontal size={18} /> Filters
          </button>
          <div className="text-[14px] font-sans font-medium text-text-main">
            {filteredProducts.length} Products
          </div>
        </div>

        {/* Sidebar Filters */}
        <div className={`fixed inset-0 z-50 bg-black/50 md:sticky md:top-[90px] md:z-0 md:block md:w-[280px] md:self-start md:bg-transparent lg:top-[138px] shrink-0 transition-opacity ${isSidebarOpen ? 'block' : 'hidden'}`}>
          <div className={`fixed inset-y-0 left-0 w-4/5 max-w-[320px] overflow-y-auto bg-bg-surface p-[24px] shadow-xl transition-transform transform md:static md:max-h-[calc(100vh-106px)] md:w-full md:rounded-[16px] md:bg-bg-surface md:p-[24px] md:shadow-[0_2px_16px_rgba(0,0,0,0.04)] lg:max-h-[calc(100vh-154px)] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
            <div className="flex justify-between items-center mb-[24px] md:hidden">
              <h2 className="font-serif text-[24px] text-text-main">Filters</h2>
              <button onClick={() => setIsSidebarOpen(false)} className="text-text-muted hover:text-text-main"><X size={24} /></button>
            </div>
            
            <div className="hidden md:flex justify-between items-center mb-[24px]">
              <h2 className="font-serif text-[24px] text-text-main">Filters</h2>
              <button onClick={clearFilters} className="text-[13px] font-sans text-[#F4A0B0] hover:text-[#D4527A] transition-colors">Clear All</button>
            </div>

            {/* Categories */}
            <div className="mb-[32px]">
              <h3 className="font-sans text-[13px] font-semibold uppercase tracking-[0.5px] text-text-main mb-[16px]">Category</h3>
              <div className="flex flex-col gap-[12px]">
                {categories.map(c => (
                  <label key={c.id} className="flex items-center gap-[12px] cursor-pointer group">
                    <div className="relative flex items-center justify-center w-[20px] h-[20px]">
                      <input 
                        type="checkbox" 
                        checked={selectedCategories.includes(c.id)}
                        onChange={() => handleCheckboxChange(setSelectedCategories, selectedCategories, c.id)}
                        className="peer appearance-none w-[20px] h-[20px] border-[1.5px] border-[#C0C0C0] rounded-[6px] checked:bg-[#1A1A1A] checked:border-[#1A1A1A] cursor-pointer transition-colors"
                      />
                      <svg className="absolute w-[12px] h-[12px] text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 10" fill="none">
                        <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-[14px] font-sans text-text-muted group-hover:text-text-main transition-colors">{c.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-[32px]">
              <h3 className="font-sans text-[13px] font-semibold uppercase tracking-[0.5px] text-text-main mb-[16px]">Price Range</h3>
              <div>
                 <input 
                    type="range" 
                    min="0" max="10000" 
                    value={priceRange[1]} 
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full accent-[#1A1A1A]"
                 />
                 <div className="flex justify-between text-[13px] font-sans text-text-muted mt-3">
                    <span>₹0</span>
                    <span>₹{priceRange[1]}</span>
                 </div>
              </div>
            </div>

            {/* Stone Type */}
            <div className="mb-[32px]">
              <h3 className="font-sans text-[13px] font-semibold uppercase tracking-[0.5px] text-text-main mb-[16px]">Stone Type</h3>
              <div className="flex flex-col gap-[12px]">
                {stoneTypes.map(s => (
                  <label key={s} className="flex items-center gap-[12px] cursor-pointer group">
                    <div className="relative flex items-center justify-center w-[20px] h-[20px]">
                      <input 
                        type="checkbox" 
                        checked={selectedStones.includes(s)}
                        onChange={() => handleCheckboxChange(setSelectedStones, selectedStones, s)}
                        className="peer appearance-none w-[20px] h-[20px] border-[1.5px] border-[#C0C0C0] rounded-[6px] checked:bg-[#1A1A1A] checked:border-[#1A1A1A] cursor-pointer transition-colors"
                      />
                      <svg className="absolute w-[12px] h-[12px] text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 10" fill="none">
                        <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-[14px] font-sans text-text-muted group-hover:text-text-main transition-colors">{s}</span>
                  </label>
                ))}
              </div>
            </div>

             {/* Occasion */}
             <div className="mb-[32px]">
              <h3 className="font-sans text-[13px] font-semibold uppercase tracking-[0.5px] text-text-main mb-[16px]">Occasion</h3>
              <div className="flex flex-col gap-[12px]">
                {occasions.map(o => (
                  <label key={o.id} className="flex items-center gap-[12px] cursor-pointer group">
                    <div className="relative flex items-center justify-center w-[20px] h-[20px]">
                      <input 
                        type="checkbox" 
                        checked={selectedOccasions.includes(o.id)}
                        onChange={() => handleCheckboxChange(setSelectedOccasions, selectedOccasions, o.id)}
                        className="peer appearance-none w-[20px] h-[20px] border-[1.5px] border-[#C0C0C0] rounded-[6px] checked:bg-[#1A1A1A] checked:border-[#1A1A1A] cursor-pointer transition-colors"
                      />
                      <svg className="absolute w-[12px] h-[12px] text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 10" fill="none">
                        <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-[14px] font-sans text-text-muted group-hover:text-text-main transition-colors">{o.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Style */}
            <div className="mb-[32px]">
              <h3 className="font-sans text-[13px] font-semibold uppercase tracking-[0.5px] text-text-main mb-[16px]">Style</h3>
              <div className="flex flex-col gap-[12px]">
                {styles.map(s => (
                  <label key={s.id} className="flex items-center gap-[12px] cursor-pointer group">
                    <div className="relative flex items-center justify-center w-[20px] h-[20px]">
                      <input 
                        type="checkbox" 
                        checked={selectedStyles.includes(s.id)}
                        onChange={() => handleCheckboxChange(setSelectedStyles, selectedStyles, s.id)}
                        className="peer appearance-none w-[20px] h-[20px] border-[1.5px] border-[#C0C0C0] rounded-[6px] checked:bg-[#1A1A1A] checked:border-[#1A1A1A] cursor-pointer transition-colors"
                      />
                      <svg className="absolute w-[12px] h-[12px] text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 10" fill="none">
                        <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-[14px] font-sans text-text-muted group-hover:text-text-main transition-colors">{s.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="md:hidden mt-8">
               <button onClick={() => setIsSidebarOpen(false)} className="btn-primary w-full h-[48px]">Apply Filters</button>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-[24px] hidden md:flex border-b border-border-main pb-[16px]">
             <div className="text-[14px] font-sans text-text-muted">
               Showing {displayedProducts.length} of {filteredProducts.length} products
             </div>
             <div className="flex items-center gap-2">
                <span className="text-[14px] font-sans text-text-main font-medium">Sort by:</span>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border border-border-main rounded-[8px] px-[12px] py-[8px] text-[14px] font-sans text-text-main outline-none focus:border-[#F4A0B0] cursor-pointer"
                >
                  <option value="popularity">Popularity</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="new">New Arrivals</option>
                </select>
             </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
               <h3 className="font-serif text-[28px] text-text-main mb-2">No products found</h3>
               <p className="font-sans text-text-muted mb-8">Try adjusting your filters or search terms.</p>
               <button onClick={clearFilters} className="btn-secondary">Clear All Filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-bg-surface rounded-[16px] shadow-product overflow-hidden flex flex-col w-full border-none">
                      <div className="w-full aspect-square skeleton-bg"></div>
                      <div className="p-[16px] flex flex-col gap-[8px]">
                        <div className="w-[80%] h-[16px] rounded-[4px] skeleton-bg"></div>
                        <div className="w-[60%] h-[16px] rounded-[4px] skeleton-bg"></div>
                        <div className="w-[40%] h-[16px] rounded-[4px] skeleton-bg mt-[8px]"></div>
                        <div className="w-full h-[40px] rounded-[100px] skeleton-bg mt-[16px]"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  displayedProducts.map((product, index) => {
                    if (displayedProducts.length === index + 1 && visibleCount < filteredProducts.length) {
                      return (
                        <div ref={lastProductElementRef} key={product.id}>
                          <ProductCard product={product} />
                        </div>
                      );
                    } else {
                      return <ProductCard key={product.id} product={product} />;
                    }
                  })
                )}
              </div>

              {isLoadingMore && visibleCount < filteredProducts.length && (
                <div className="flex justify-center items-center py-10 w-full mt-4">
                  <div className="relative flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-2 border-[#FFE4EE] rounded-full border-t-[#D4527A] animate-spin"></div>
                    <span className="text-[9px] font-bold text-[#B94B68] uppercase tracking-[2px] mt-4">Loading more</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

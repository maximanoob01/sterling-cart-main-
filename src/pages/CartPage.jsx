import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, X, Trash2, ShoppingBag, Shield, ChevronRight, Home, Heart, Star, Scale, PenTool } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getItemPrice } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useProducts } from '../context/ProductContext';
import { coupons } from '../data/orders';
import { calculateDiscount } from '../utils/formatPrice';
import { useState } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import FreeDeliveryBar from '../components/cart/FreeDeliveryBar';

const StarRating = ({ rating, size = 13 }) => (
  <div className="flex items-center gap-[2px]">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={size}
        className={i <= Math.round(rating) ? 'fill-[#D4527A] text-[#D4527A]' : 'fill-[#E8DDD5] text-[#E8DDD5]'}
      />
    ))}
  </div>
);

const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();
  const { formatPrice } = useCurrency();
  const discount = calculateDiscount(product.price, product.mrp);
  const wishlisted = isWishlisted(product.id);

  return (
    <div className="group rounded-2xl overflow-hidden bg-white border border-[#EFE8E2] flex flex-col transition-shadow duration-300 hover:shadow-md">
      {product.badge && (
        <span className="absolute mt-3 ml-3 z-10 bg-[#1A1A1A] text-white text-[10px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full">
          {product.badge}
        </span>
      )}

      <button
        onClick={(e) => { e.preventDefault(); toggleItem(product); }}
        className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center border border-[#EFE8E2]"
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart size={16} className={wishlisted ? 'fill-[#D4527A] text-[#D4527A]' : 'text-[#999]'} />
      </button>

      <Link to={`/product/${product.slug || product.id}`} className="block aspect-square bg-[#F7F5F4] overflow-hidden">
        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <Link to={`/product/${product.slug || product.id}`}>
          <h3 className="font-serif text-[15px] font-medium text-text-main mb-1 line-clamp-2 leading-snug group-hover:text-[#D4527A] transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1.5 mt-1">
          <StarRating rating={product.rating} />
          <span className="text-[11px] text-text-muted">({product.reviewCount})</span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-text-main text-[15px]">{formatPrice(product.price)}</span>
            {product.mrp > product.price && (
              <span className="text-[11px] text-[#A8A8A8] line-through">{formatPrice(product.mrp)}</span>
            )}
          </div>
          {product.mrp > product.price && (
            <span className="text-[10px] font-bold bg-[#D4527A]/10 text-[#D4527A] px-2 py-0.5 rounded-full">{discount}% OFF</span>
          )}
        </div>
        <button
          onClick={(e) => { e.preventDefault(); addItem(product); }}
          className="mt-4 w-full h-10 text-[11px] font-bold uppercase tracking-wider rounded-full bg-[#1A1A1A] text-white hover:bg-[#D4527A] transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

/* Collapsible row used for coupon / future gift card / future coins sections */
const SummaryCollapsible = ({ label, isOpen, onToggle, children }) => (
  <div className="border-b border-[#EFE8E2] py-3">
    <button onClick={onToggle} className="w-full flex justify-between items-center text-left">
      <span className="text-[13px] font-medium text-text-main">{label}</span>
      <ChevronRight size={14} className={`text-text-muted transition-transform ${isOpen ? 'rotate-90' : ''}`} />
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="overflow-hidden"
        >
          <div className="pt-3">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default function CartPage() {
  const {
    items, updateQuantity, removeItem, totalItems, subtotal,
    discount, shipping, gst, totalAmount, applyCoupon, removeCoupon, coupon,
  } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();
  const { formatPrice } = useCurrency();
  const { products } = useProducts();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [itemToRemove, setItemToRemove] = useState(null);
  const [couponOpen, setCouponOpen] = useState(false);

  const getItemImage = (item) => {
    if (item.images?.length) return item.images[0];
    const fullProduct = products.find((p) => String(p.id) === String(item.id));
    return fullProduct?.images?.[0] || 'https://via.placeholder.com/150?text=No+Image';
  };

  const handleApplyCoupon = () => {
    setCouponError('');
    const validCoupon = coupons[couponCode.toUpperCase()];
    if (!validCoupon) {
      setCouponError('Invalid coupon code');
      return;
    }
    if (subtotal < validCoupon.minOrder) {
      setCouponError(`Minimum order amount should be ₹${validCoupon.minOrder}`);
      return;
    }
    applyCoupon(validCoupon);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-bg-surface flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-[#EFE8E2] p-12 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-[#FFF4F6] rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={26} className="text-[#D4527A]" strokeWidth={1.5} />
          </div>
          <h2 className="font-serif text-2xl font-semibold text-text-main mb-2">Your cart is empty</h2>
          <p className="text-sm text-text-muted mb-8 leading-relaxed">
            Discover pieces that elevate your everyday presence.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#D4527A] transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const recommendedProducts = products.slice(0, 4);

  return (
    <div className="min-h-screen bg-bg-surface pb-20">

      {/* Breadcrumb */}
      <div className="py-4 px-5 md:px-10 lg:px-20">
        <div className="max-w-[1280px] mx-auto flex items-center gap-2 text-[11px] uppercase tracking-wider text-text-muted font-semibold">
          <Link to="/" className="flex items-center gap-1 hover:text-[#D4527A]">
            <Home size={12} /> Home
          </Link>
          <ChevronRight size={10} className="text-[#C0C0C0]" />
          <span className="text-[#D4527A]">Cart ({totalItems})</span>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-5 md:px-10 lg:px-20">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-serif text-2xl md:text-3xl text-text-main">Shopping Cart</h1>
          <Link to="/shop" className="text-xs font-semibold text-[#D4527A] hover:underline hidden md:block">
            Continue Shopping
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">

          {/* ── Cart Items ── */}
          <div className="lg:w-[62%]">

            <div className="mb-4">
              <FreeDeliveryBar subtotal={subtotal} threshold={2499} compact />
            </div>

            <div className="bg-white rounded-2xl border border-[#EFE8E2] divide-y divide-[#F0EAE4]">
              {items.map((item, index) => (
                <div key={`${item.id}-${item.selectedSize}-${index}`} className="flex gap-4 p-4">
                  <Link to={`/product/${item.id}`} className="w-16 h-16 md:w-20 md:h-20 shrink-0 bg-[#F7F5F4] rounded-xl overflow-hidden border border-[#EFE8E2]">
                    <img src={getItemImage(item)} alt={item.name} className="w-full h-full object-cover" />
                  </Link>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0">
                        <Link to={`/product/${item.id}`} className="font-serif text-sm md:text-[15px] text-text-main hover:text-[#D4527A] leading-snug line-clamp-2 block mb-1">
                          {item.name}
                        </Link>

                        <div className="text-[11px] text-text-muted flex items-center gap-1.5 flex-wrap mb-1">
                          {item.metal && <span>{item.metal}</span>}
                          {item.stoneType && item.stoneType !== 'No Stone' && (
                            <><span className="w-1 h-1 bg-[#D9D0C8] rounded-full" /><span>{item.stoneType}</span></>
                          )}
                          {item.selectedSize && (
                            <><span className="w-1 h-1 bg-[#D9D0C8] rounded-full" /><span>Size: {item.selectedSize}</span></>
                          )}
                        </div>

                        {item.pricingType === 'weight' && (
                          <div className="text-[10px] text-[#A8A8A8] flex items-center gap-1 mb-1.5">
                            <Scale size={10} className="text-[#D4527A]" /> {item.weightGrams}g + making
                          </div>
                        )}

                        {item.engravingText && (
                          <div className="text-[10px] font-medium text-[#D4527A] inline-flex items-center gap-1 mb-1.5 bg-[#FFF4F6] px-2 py-0.5 rounded-md">
                            <PenTool size={10} /> "{item.engravingText}"
                          </div>
                        )}

                        <div className="font-semibold text-text-main text-[13px]">
                          {formatPrice(getItemPrice(item))}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="font-bold text-text-main text-sm md:text-[15px]">
                          {formatPrice(getItemPrice(item) * item.quantity)}
                        </span>
                        <button
                          onClick={() => setItemToRemove(item)}
                          className="w-7 h-7 rounded-full border border-[#EFE8E2] flex items-center justify-center text-[#A8A8A8] hover:text-[#D4527A] hover:border-[#D4527A]/30 transition-colors"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 size={12} strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 inline-flex items-center rounded-full h-8 border border-[#EFE8E2] w-fit">
                      <button onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1, item.engravingText, item.customDesignUrl)} className="w-8 h-full flex items-center justify-center text-text-muted hover:text-text-main">
                        <Minus size={12} />
                      </button>
                      <span className="text-xs font-semibold text-text-main w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1, item.engravingText, item.customDesignUrl)} className="w-8 h-full flex items-center justify-center text-text-muted hover:text-text-main">
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Order Summary ── */}
          <div className="lg:w-[38%]">
            <div className="bg-white rounded-2xl border border-[#EFE8E2] p-6 lg:sticky lg:top-24">
              <h3 className="font-serif text-lg text-text-main mb-4">Order Summary</h3>

              {/* Coupon — collapsible */}
              <SummaryCollapsible label={coupon ? 'Coupon applied' : 'Have a coupon code?'} isOpen={couponOpen} onToggle={() => setCouponOpen(!couponOpen)}>
                {!coupon ? (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter code"
                        className="flex-1 px-4 h-10 rounded-full border border-[#EFE8E2] outline-none focus:border-[#D4527A] text-xs uppercase placeholder:normal-case"
                      />
                      <button onClick={handleApplyCoupon} className="h-10 px-5 rounded-full bg-[#1A1A1A] text-white text-[11px] font-bold uppercase hover:bg-[#D4527A] transition-colors">
                        Apply
                      </button>
                    </div>
                    {couponError && <p className="text-[11px] text-red-500 mt-2">{couponError}</p>}
                  </>
                ) : (
                  <div className="flex justify-between items-center bg-[#FFF4F6] px-4 py-2.5 rounded-xl">
                    <span className="font-serif text-sm text-text-main">{couponCode.toUpperCase()}</span>
                    <button onClick={removeCoupon} className="text-text-muted hover:text-[#D4527A]">
                      <X size={14} />
                    </button>
                  </div>
                )}
              </SummaryCollapsible>

              {/* TODO: Gift card + Sterling Coins collapsibles go here once
                  redeemGiftCard() / redeemCoins() are added to CartContext.
                  Do not merge these into the coupon field above. */}

              {/* Totals */}
              <div className="flex flex-col gap-2.5 py-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Subtotal</span>
                  <span className="font-medium text-text-main">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#D4527A]">
                    <span>Discount</span>
                    <span className="font-medium">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-text-muted">Shipping</span>
                  <span className="font-medium text-text-main">
                    {shipping === 0 ? (
                      <span className="text-[#D4527A] font-semibold text-xs">FREE</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-end py-4 border-t border-[#EFE8E2] mb-5">
                <span className="font-serif text-lg text-text-main">Total</span>
                <span className="text-xl font-semibold text-text-main">{formatPrice(totalAmount)}</span>
              </div>

              <Link
                to="/checkout"
                className="flex items-center justify-center w-full h-12 rounded-full bg-[#D4527A] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#B94B68] transition-colors"
              >
                Proceed to Checkout
              </Link>

              <div className="mt-5 flex flex-col items-center gap-2 text-[11px] text-text-muted">
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-[#D4527A]" /> Secure Encrypted Checkout
                </div>
                <div className="flex gap-1.5">
                  {['UPI', 'VISA', 'COD'].map((m) => (
                    <span key={m} className="px-2.5 py-1 rounded-full bg-[#F7F5F4] text-text-main font-semibold text-[10px]">{m}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended */}
        <div className="mt-14 pt-10 border-t border-[#EFE8E2]">
          <h2 className="font-serif text-xl md:text-2xl text-text-main mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {recommendedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Remove item modal */}
        <AnimatePresence>
          {itemToRemove && (
            <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="bg-white rounded-3xl p-8 max-w-sm w-full text-center relative"
              >
                <button onClick={() => setItemToRemove(null)} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F7F5F4] flex items-center justify-center text-text-muted hover:text-text-main">
                  <X size={16} />
                </button>
                <div className="w-14 h-14 bg-[#FFF4F6] rounded-full flex items-center justify-center mx-auto mb-5">
                  <Heart size={24} className="text-[#D4527A]" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-xl text-text-main mb-2">Move to Wishlist?</h3>
                <p className="text-sm text-text-muted mb-6 leading-relaxed">
                  Save this piece for a future occasion instead of removing it entirely.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      if (!isWishlisted(itemToRemove.id)) toggleItem(itemToRemove);
                      removeItem(itemToRemove.id, itemToRemove.selectedSize, itemToRemove.engravingText, itemToRemove.customDesignUrl);
                      setItemToRemove(null);
                    }}
                    className="w-full h-12 rounded-full bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#D4527A] transition-colors"
                  >
                    Move to Wishlist
                  </button>
                  <button
                    onClick={() => {
                      removeItem(itemToRemove.id, itemToRemove.selectedSize, itemToRemove.engravingText, itemToRemove.customDesignUrl);
                      setItemToRemove(null);
                    }}
                    className="w-full h-12 text-xs font-bold uppercase tracking-wider text-[#A8A8A8] hover:text-text-main transition-colors"
                  >
                    Remove from Cart
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
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

/* ─────────────────────────  STAR RATING HELPER  ───────────────────────── */
const StarRating = ({ rating, size = 14 }) => (
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

/* ─────────────────────────  PRODUCT CARD (INLINE)  ───────────────────── */
const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();
  const { formatPrice } = useCurrency();
  const discount = calculateDiscount(product.price, product.mrp);
  const wishlisted = isWishlisted(product.id);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="group glass-card rounded-[24px] overflow-hidden relative flex flex-col w-full transition-transform duration-500 hover:-translate-y-1">
      {/* Badge */}
      {product.badge && (
        <span className="absolute top-[14px] left-[14px] z-10 glass-dark text-white text-[10px] font-sans font-semibold uppercase tracking-[1px] px-[12px] py-[6px] rounded-full border-none">
          {product.badge}
        </span>
      )}

      {/* Wishlist heart */}
      <button
        onClick={(e) => { e.preventDefault(); toggleItem(product); }}
        className="absolute top-[14px] right-[14px] z-10 w-[40px] h-[40px] rounded-full glass bg-white/60 flex items-center justify-center transition-all duration-300 hover:scale-110 border border-white/40"
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart
          size={18}
          className={wishlisted ? 'fill-[#D4527A] text-[#D4527A]' : 'text-[#888] group-hover:text-[#D4527A]'}
        />
      </button>

      {/* Image */}
      <Link to={`/product/${product.slug || product.id}`} className="block overflow-hidden aspect-square bg-[#F7F5F4]">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700 ease-in-out"
        />
      </Link>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        <Link to={`/product/${product.slug || product.id}`}>
          <h3 className="font-serif text-[17px] font-medium text-text-main mb-1 line-clamp-2 leading-[1.3] tracking-[0.2px] group-hover:text-[#D4527A] transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-[6px] mt-1.5">
          <StarRating rating={product.rating} />
          <span className="text-[12px] text-text-muted font-sans font-medium">({product.reviewCount})</span>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-baseline gap-2.5">
            <span className="font-sans font-semibold text-text-main text-[16px] tracking-wide">{formatPrice(product.price)}</span>
            {product.mrp > product.price && (
              <span className="text-[12px] text-[#A8A8A8] line-through font-sans">{formatPrice(product.mrp)}</span>
            )}
          </div>
          {product.mrp > product.price && (
            <span className="text-[10px] font-bold bg-[#D4527A]/10 text-[#D4527A] px-[8px] py-[3px] rounded-full font-sans uppercase tracking-[0.5px]">
              {discount}% OFF
            </span>
          )}
        </div>

        <button
          onClick={(e) => { e.preventDefault(); addItem(product); }}
          className="mt-5 w-full h-[44px] text-[12px] font-bold uppercase tracking-[1px] rounded-full bg-[#1A1A1A] text-white hover:bg-[#D4527A] opacity-0 translate-y-[10px] group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out"
        >
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
};

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalItems, subtotal, discount, shipping, gst, totalAmount, applyCoupon, removeCoupon, coupon } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();
  const { formatPrice } = useCurrency();
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [itemToRemove, setItemToRemove] = useState(null);
  const { products } = useProducts();

  const handleApplyCoupon = () => {
    setCouponError('');
    const validCoupon = coupons[couponCode.toUpperCase()];
    if (validCoupon) {
      if (subtotal >= validCoupon.minOrder) {
        applyCoupon(validCoupon);
      } else {
        setCouponError(`Minimum order amount should be ₹${validCoupon.minOrder}`);
      }
    } else {
      setCouponError('Invalid coupon code');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[80vh] relative bg-bg-surface flex flex-col items-center justify-center p-6 overflow-hidden">
        {/* Luxury Background Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4527A]/10 rounded-full blur-[120px] pointer-events-none mix-blend-multiply" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="glass-panel p-12 md:p-16 rounded-[32px] border border-white/60 shadow-xl max-w-lg w-full text-center relative z-10"
        >
          <div className="w-[88px] h-[88px] glass rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm border border-white">
            <ShoppingBag size={36} className="text-[#D4527A]" strokeWidth={1.5} />
          </div>
          <h2 className="font-serif text-[36px] font-bold text-text-main mb-3">Your cart is empty</h2>
          <p className="font-sans text-[15px] text-text-muted mb-10 leading-relaxed">
            Discover pieces that elevate your everyday presence. Begin your journey with Sterling Kart.
          </p>
          <Link to="/shop" className="inline-flex items-center justify-center h-[54px] px-[44px] rounded-full bg-[#1A1A1A] text-white text-[12px] font-bold uppercase tracking-[1.5px] hover:bg-[#D4527A] hover:scale-105 transition-all duration-300">
            Continue Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  // Get some random recommended products
  const recommendedProducts = products.slice(0, 4);

  return (
    <div className="relative min-h-screen pb-[100px] bg-bg-surface overflow-hidden">
      {/* Background Liquid Glass Effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4527A]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-[100px] pointer-events-none" />

      {/* Breadcrumb */}
      <div className="relative z-10 py-[20px] px-5 md:px-10 lg:px-20 text-[12px] font-sans text-text-muted mb-[20px] md:mb-[40px]">
        <div className="max-w-[1320px] mx-auto flex items-center gap-[10px] uppercase tracking-[1px] font-semibold">
          <Link to="/" className="flex items-center gap-1.5 hover:text-[#D4527A] transition-colors">
             <Home size={14} /> Home
          </Link>
          <ChevronRight size={12} className="text-[#C0C0C0]" />
          <span className="text-[#D4527A]">Cart ({totalItems} items)</span>
        </div>
      </div>

      <div className="relative z-10 max-w-[1320px] mx-auto px-5 md:px-10 lg:px-20">
        <h1 className="font-serif text-[28px] md:text-[36px] text-text-main mb-[30px] md:mb-[50px]">Shopping Cart</h1>
        
        <div className="flex flex-col lg:flex-row gap-[40px] lg:gap-[60px]">
          {/* Cart Items */}
          <div className="lg:w-[62%]">
            <div className="glass-panel rounded-[32px] p-[20px] md:p-[32px] border border-white/60 shadow-lg">
              {/* Free Delivery Progress Banner */}
              <div className="mb-6">
                <FreeDeliveryBar subtotal={subtotal} threshold={2499} />
              </div>
              {items.map((item, index) => (
                <div key={`${item.id}-${item.selectedSize}-${index}`} className="flex gap-[16px] md:gap-[24px] py-[20px] border-b border-[#E8DDD5]/60 last:border-b-0 last:pb-0 first:pt-0 relative group items-start">
                  <Link to={`/product/${item.id}`} className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] shrink-0 bg-[#F7F5F4] rounded-[16px] overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-white/60">
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </Link>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-4">
                      <div className="pr-2">
                        <Link to={`/product/${item.id}`} className="font-serif text-[15px] md:text-[17px] text-text-main hover:text-[#D4527A] transition-colors leading-[1.3] line-clamp-2 mb-1">
                          {item.name}
                        </Link>
                        
                        <div className="text-[12px] text-text-muted flex items-center gap-2 flex-wrap mb-1.5 font-medium tracking-[0.2px]">
                          {item.metal && <span>{item.metal}</span>}
                          {item.stoneType && item.stoneType !== 'No Stone' && <><span className="w-1 h-1 bg-[#D9D0C8] rounded-full"></span><span>{item.stoneType}</span></>}
                          {item.selectedSize && <><span className="w-1 h-1 bg-[#D9D0C8] rounded-full"></span><span>Size: {item.selectedSize}</span></>}
                        </div>

                        {item.pricingType === 'weight' && (
                          <div className="text-[11px] text-[#A8A8A8] italic flex items-center gap-1 mb-2">
                            <Scale size={10} className="text-[#D4527A]" />
                            {item.weightGrams}g + making
                          </div>
                        )}
                        
                        {item.engravingText && (
                          <div className="text-[11px] font-medium text-[#D4527A] flex items-center gap-1.5 mb-2 bg-[#FFF0F5] inline-flex px-2 py-1 rounded-md border border-[#F4A0B0]/30">
                            <PenTool size={11} /> Engraving: "{item.engravingText}"
                          </div>
                        )}
                        
                        <div className="font-sans font-semibold text-text-main text-[14px] md:text-[15px]">
                          {formatPrice(getItemPrice(item))}
                        </div>
                      </div>
                      
                      {/* Price x Qty = Total and Remove */}
                      <div className="flex flex-col items-end gap-3 shrink-0">
                        <div className="font-sans font-bold text-text-main text-[16px] md:text-[18px]">
                          {formatPrice(getItemPrice(item) * item.quantity)}
                        </div>
                        <button
                          onClick={() => setItemToRemove(item)}
                          className="w-[30px] h-[30px] md:w-[34px] md:h-[34px] rounded-full bg-white/60 border border-white shadow-sm flex items-center justify-center text-[#A8A8A8] hover:text-[#D4527A] hover:bg-white hover:scale-105 transition-all"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <Trash2 size={14} strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Quantity */}
                    <div className="mt-4 inline-flex items-center glass rounded-full h-[36px] overflow-hidden border border-white/60 shadow-sm bg-white/40">
                      <button onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)} className="w-[36px] h-full flex items-center justify-center text-text-muted hover:bg-white hover:text-text-main transition-colors"><Minus size={14} strokeWidth={1.5} /></button>
                      <span className="font-sans text-[13px] font-semibold text-text-main w-[28px] text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)} className="w-[36px] h-full flex items-center justify-center text-text-muted hover:bg-white hover:text-text-main transition-colors"><Plus size={14} strokeWidth={1.5} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* International Payments Banner */}
            <div className="mt-6 glass-panel rounded-[24px] border border-white/60 p-[20px] shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#D4527A]/10 flex items-center justify-center shrink-0 border border-[#D4527A]/20">
                <span className="text-[20px]">🌍</span>
              </div>
              <div>
                <h4 className="font-serif text-[16px] text-text-main font-semibold mb-1">International Payments Accepted</h4>
                <p className="font-sans text-[13px] text-text-muted leading-relaxed">
                  We accept Visa, Mastercard, American Express, and other major international cards. Customers worldwide can securely pay in <span className="font-bold text-[#D4527A]">USD</span>.
                </p>
              </div>
            </div>

          </div>

          {/* Order Summary */}
          <div className="lg:w-[38%]">
            <div className="glass-panel rounded-[32px] p-[32px] md:p-[40px] sticky top-[120px] shadow-xl border border-white/60 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4527A]/10 rounded-full blur-[40px] pointer-events-none" />
              
              <h3 className="font-serif text-[26px] text-text-main mb-[32px] relative z-10">Order Summary</h3>
              
              {/* Coupon Code */}
              <div className="mb-[32px] pb-[32px] border-b border-[#E8DDD5] relative z-10">
                {!coupon ? (
                  <>
                    <div className="flex gap-[10px]">
                      <input 
                        type="text" 
                        value={couponCode} 
                        onChange={(e) => setCouponCode(e.target.value)} 
                        placeholder="Gift card or discount code" 
                        className="flex-1 px-[20px] h-[52px] rounded-full border border-white bg-white/50 outline-none focus:border-[#D4527A] focus:bg-white font-sans text-[13px] uppercase text-text-main transition-all shadow-sm placeholder:normal-case placeholder:text-text-muted/70"
                      />
                      <button onClick={handleApplyCoupon} className="h-[52px] px-[28px] rounded-full bg-[#1A1A1A] text-white hover:bg-[#D4527A] text-[11px] font-bold uppercase tracking-[1px] transition-colors shadow-md">Apply</button>
                    </div>
                    {couponError && <p className="font-sans text-[12px] text-[#D4527A] mt-[10px] ml-4 font-medium">{couponError}</p>}
                  </>
                ) : (
                  <div className="glass bg-white/70 px-[20px] py-[16px] rounded-[20px] flex justify-between items-center border border-white shadow-sm">
                    <div>
                      <p className="font-sans text-[10px] font-bold text-[#D4527A] uppercase tracking-[1.5px]">Coupon Applied</p>
                      <p className="font-serif text-[18px] text-text-main mt-0.5">{couponCode.toUpperCase()}</p>
                    </div>
                    <button onClick={removeCoupon} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-text-muted hover:text-[#D4527A] shadow-sm transition-colors"><X size={16} strokeWidth={2} /></button>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-[18px] mb-[32px] font-sans text-[15px] relative z-10">
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">Subtotal</span>
                  <span className="font-medium text-text-main">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between items-center text-[#D4527A]">
                    <span>Discount</span>
                    <span className="font-medium">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                   <span className="text-text-muted">Shipping</span>
                   <span className="font-medium text-text-main">
                     {shipping === 0
                       ? <span className="text-[#D4527A] font-semibold text-[12px]">FREE ✓</span>
                       : <>{formatPrice(shipping)} <span className="text-[11px] text-text-muted">(free above ₹2,499)</span></>}
                   </span>
                </div>
              </div>
              
              <div className="flex justify-between items-end py-[28px] border-t border-[#E8DDD5] mb-[32px] relative z-10">
                <span className="font-serif text-[22px] text-text-main">Total Payable</span>
                <span className="font-sans text-[28px] font-semibold text-text-main">{formatPrice(totalAmount)}</span>
              </div>
              
              {/* Free Delivery Progress — compact */}
              <div className="mb-[24px] relative z-10">
                <FreeDeliveryBar subtotal={subtotal} threshold={2499} compact />
              </div>

              <Link to="/checkout" className="flex items-center justify-center w-full h-[60px] rounded-full bg-[#D4527A] text-white text-[13px] font-bold uppercase tracking-[1.5px] hover:bg-[#B94B68] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 relative z-10">
                Proceed to Checkout
              </Link>
              
              <div className="mt-[32px] flex flex-col gap-[16px] items-center font-sans text-[12px] text-text-muted relative z-10">
                <div className="flex gap-[10px] items-center font-medium">
                  <Shield size={16} className="text-[#D4527A]" strokeWidth={1.5} /> Secure Encrypted Checkout
                </div>
                <div className="flex gap-[8px] items-center opacity-80">
                  <span className="px-[10px] py-[4px] rounded-full bg-white border border-[#E8DDD5] text-text-main font-semibold tracking-wide text-[10px]">UPI</span>
                  <span className="px-[10px] py-[4px] rounded-full bg-white border border-[#E8DDD5] text-text-main font-semibold tracking-wide text-[10px]">VISA</span>
                  <span className="px-[10px] py-[4px] rounded-full bg-white border border-[#E8DDD5] text-text-main font-semibold tracking-wide text-[10px]">COD</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* You Might Also Like */}
        <div className="mt-[80px] pt-[80px] border-t border-[#E8DDD5] relative z-10">
          <div className="flex flex-col items-center mb-[48px]">
            <span className="text-[10px] font-bold text-[#D4527A] uppercase tracking-[3px] mb-3">Curated Additions</span>
            <h2 className="font-serif text-[32px] md:text-[40px] text-text-main text-center">You Might Also Like</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[20px] md:gap-[32px]">
            {recommendedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Remove Item Modal */}
        <AnimatePresence>
          {itemToRemove && (
            <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="glass-panel rounded-[32px] p-8 sm:p-10 max-w-sm w-full shadow-2xl relative text-center border border-white/60"
              >
                <div className="w-20 h-20 glass bg-white/70 border border-white rounded-full flex items-center justify-center mx-auto mb-6 text-[#D4527A] shadow-sm">
                  <Heart size={36} strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-[28px] text-text-main mb-3">Move to Wishlist?</h3>
                <p className="text-[14px] text-text-muted mb-8 leading-relaxed">
                  Not ready to purchase? Save this piece to your wishlist for a future occasion.
                </p>
                <div className="space-y-4 flex flex-col">
                  <button
                    onClick={() => {
                      if (!isWishlisted(itemToRemove.id)) {
                        toggleItem(itemToRemove);
                      }
                      removeItem(itemToRemove.id, itemToRemove.selectedSize);
                      setItemToRemove(null);
                    }}
                    className="w-full h-[52px] rounded-full bg-[#1A1A1A] text-white text-[12px] font-bold uppercase tracking-[1px] hover:bg-[#D4527A] hover:scale-[1.02] transition-all duration-300 shadow-md"
                  >
                    Move to Wishlist
                  </button>
                  <button
                    onClick={() => {
                      removeItem(itemToRemove.id, itemToRemove.selectedSize);
                      setItemToRemove(null);
                    }}
                    className="w-full h-[52px] font-sans font-bold text-[12px] uppercase tracking-[1px] text-[#A8A8A8] hover:text-text-main transition-colors"
                  >
                    Remove from Cart
                  </button>
                </div>
                <button
                  onClick={() => setItemToRemove(null)}
                  className="absolute top-6 right-6 w-10 h-10 rounded-full glass bg-white/50 flex items-center justify-center text-text-muted hover:text-text-main hover:bg-white transition-all shadow-sm"
                >
                  <X size={20} strokeWidth={1.5} />
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

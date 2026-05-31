import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, X, Trash2, ShoppingBag, Shield, ChevronRight, Home, Heart, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { products } from '../data/products';
import { coupons } from '../data/orders';
import { formatPrice, calculateDiscount } from '../utils/formatPrice';
import { useState } from 'react';

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
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="group bg-bg-surface rounded-[16px] shadow-product overflow-hidden relative flex flex-col w-full border-none">
      {/* Badge */}
      {product.badge && (
        <span className="absolute top-[12px] left-[12px] z-10 bg-[#1C1C2E] text-white text-[11px] font-sans font-medium uppercase tracking-[0.5px] px-[10px] py-[4px] rounded-full">
          {product.badge}
        </span>
      )}

      {/* Wishlist heart */}
      <button
        onClick={(e) => { e.preventDefault(); toggleItem(product); }}
        className="absolute top-[12px] right-[12px] z-10 w-[40px] h-[40px] rounded-full bg-bg-surface shadow-[0_2px_8px_rgba(0,0,0,0.1)] flex items-center justify-center transition-all duration-300 hover:scale-110"
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
      <div className="p-[16px] flex flex-col flex-1">
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
          onClick={(e) => { e.preventDefault(); addItem(product); }}
          className="btn-primary mt-4 w-full h-[40px] text-[13px] opacity-0 translate-y-[8px] group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-250 ease-in-out"
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
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [itemToRemove, setItemToRemove] = useState(null);

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
  };  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#FFFAF9] flex flex-col items-center justify-center p-4">
        <div className="w-[80px] h-[80px] bg-[#FFF0F5] rounded-full flex items-center justify-center mb-[24px]">
          <ShoppingBag size={32} className="text-[#F4A0B0]" />
        </div>
        <h2 className="font-serif text-[32px] font-bold text-text-main mb-[16px]">Your cart is empty</h2>
        <p className="font-sans text-[15px] text-text-muted mb-[32px] text-center">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/shop" className="btn-primary h-[52px] px-[40px] flex items-center justify-center">Continue Shopping</Link>
      </div>
    );
  }

  // Get some random recommended products
  const recommendedProducts = products.slice(0, 4);

  return (
    <div className="bg-[#FFFAF9] min-h-screen pb-[80px]">
      {/* Breadcrumb */}
      <div className="bg-[#FFF0F5] py-[16px] px-4 md:px-10 lg:px-20 text-[13px] font-sans text-text-main mb-[40px]">
        <div className="max-w-[1440px] mx-auto flex items-center gap-[8px]">
          <Link to="/" className="flex items-center gap-1 hover:text-[#F4A0B0] transition-colors">
             <Home size={14} /> Home
          </Link>
          <ChevronRight size={12} className="text-[#A8A8A8]" />
          <span className="text-[#F4A0B0] font-medium">Cart ({totalItems} items)</span>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-10 lg:px-20">
        <h1 className="font-serif text-[40px] font-bold text-text-main mb-[40px]">Shopping Cart</h1>
        
        <div className="flex flex-col lg:flex-row gap-[48px]">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-bg-surface rounded-[16px] p-[24px] border border-border-main shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
              {items.map((item, index) => (
                <div key={`${item.id}-${item.selectedSize}-${index}`} className="flex gap-[24px] py-[24px] border-b border-border-main last:border-b-0 last:pb-0 first:pt-0 relative group">
                  
                  <Link to={`/product/${item.id}`} className="w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] shrink-0 bg-[#FAFAFA] rounded-[12px] overflow-hidden">
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-400" />
                  </Link>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0">
                        <Link to={`/product/${item.id}`} className="font-sans text-[16px] font-medium text-text-main hover:text-[#F4A0B0] transition-colors leading-[1.4] line-clamp-2">{item.name}</Link>
                        <p className="mt-1 line-clamp-2 max-w-[520px] text-[12px] leading-5 text-[#888]">{item.shortDescription}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-text-muted">
                          <span>{item.metal}</span>
                          {item.stoneType && item.stoneType !== 'No Stone' && <span>Stone: {item.stoneType}</span>}
                          {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                        </div>
                        <p className="font-sans text-[13px] text-text-muted mt-[4px]">{formatPrice(item.price)} each</p>
                      </div>
                      <div className="font-sans font-semibold text-text-main text-[18px]">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-[16px]">
                      <div className="flex items-center border border-[#C0C0C0] rounded-full h-[40px] w-[110px] overflow-hidden">
                        <button onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)} className="flex-1 h-full flex items-center justify-center text-text-muted hover:bg-[#F5F5F5] transition-colors"><Minus size={14} /></button>
                        <span className="font-sans text-[14px] font-medium text-text-main w-[24px] text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)} className="flex-1 h-full flex items-center justify-center text-text-muted hover:bg-[#F5F5F5] transition-colors"><Plus size={14} /></button>
                      </div>
                      <button
                        onClick={() => setItemToRemove(item)}
                        className="flex h-[40px] w-[40px] items-center justify-center rounded-full border border-border-main text-text-muted transition-colors hover:border-[#E7BCC5] hover:bg-[#FFF0F5] hover:text-[#D4527A]"
                        aria-label={`Remove ${item.name} from cart`}
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-[#FFF0F5] rounded-[16px] p-[24px] sticky top-[100px] shadow-[0_2px_12px_rgba(0,0,0,0.05)]">
              <h3 className="font-serif text-[24px] font-bold text-text-main mb-[24px]">Order Summary</h3>
              
              {/* Coupon Code */}
              <div className="mb-[24px] pb-[24px] border-b border-[#F4A0B0]/30">
                {!coupon ? (
                  <>
                    <div className="flex gap-[8px]">
                      <input 
                        type="text" 
                        value={couponCode} 
                        onChange={(e) => setCouponCode(e.target.value)} 
                        placeholder="Coupon code" 
                        className="flex-1 px-[16px] h-[48px] rounded-[12px] border border-[#F4A0B0]/50 outline-none focus:border-[#D4527A] font-sans text-[14px] uppercase bg-bg-surface text-text-main"
                      />
                      <button onClick={handleApplyCoupon} className="btn-secondary h-[48px] px-[24px] bg-bg-surface hover:bg-[#1A1A1A] hover:text-white hover:border-[#1A1A1A] text-[13px] font-medium border border-[#F4A0B0]/50 transition-colors">Apply</button>
                    </div>
                    {couponError && <p className="font-sans text-[12px] text-red-500 mt-[8px]">{couponError}</p>}
                  </>
                ) : (
                  <div className="bg-bg-surface/60 px-[16px] py-[12px] rounded-[12px] flex justify-between items-center border border-[#F4A0B0]/50">
                    <div>
                      <p className="font-sans text-[11px] font-bold text-[#D4527A] uppercase tracking-[0.5px]">Coupon Applied</p>
                      <p className="font-sans text-[14px] font-medium text-text-main">{couponCode.toUpperCase()}</p>
                    </div>
                    <button onClick={removeCoupon} className="text-[#A8A8A8] hover:text-text-main transition-colors"><X size={16} /></button>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-[16px] mb-[24px] font-sans text-[14px]">
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
                  <span className="font-medium text-text-main">{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">GST (18%)</span>
                  <span className="font-medium text-text-main">{formatPrice(gst)}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center py-[24px] border-t border-[#F4A0B0]/30 mb-[24px]">
                <span className="font-serif text-[20px] font-bold text-text-main">Grand Total</span>
                <span className="font-sans text-[24px] font-bold text-text-main">{formatPrice(totalAmount)}</span>
              </div>
              
              <Link to="/checkout" className="btn-primary w-full h-[56px] flex items-center justify-center text-[15px] shadow-pink">
                Proceed to Checkout
              </Link>
              
              <div className="mt-[24px] flex flex-col gap-[12px] items-center font-sans text-[12px] text-[#A8A8A8]">
                <div className="flex gap-[8px] items-center text-text-muted font-medium">
                  <Shield size={16} /> Secure Checkout
                </div>
                <div className="flex gap-[8px] items-center">
                  We accept: 
                  <span className="font-bold border border-[#C0C0C0] bg-bg-surface px-[6px] py-[2px] rounded-[4px] text-text-main">UPI</span>
                  <span className="font-bold border border-[#C0C0C0] bg-bg-surface px-[6px] py-[2px] rounded-[4px] text-text-main">VISA</span>
                  <span className="font-bold border border-[#C0C0C0] bg-bg-surface px-[6px] py-[2px] rounded-[4px] text-text-main">COD</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* You Might Also Like */}
        <div className="mt-[80px] pt-[80px] border-t border-border-main">
          <h2 className="font-serif text-[32px] font-bold text-text-main mb-[40px]">You Might Also Like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[24px]">
            {recommendedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Remove Item Modal */}
        <AnimatePresence>
          {itemToRemove && (
            <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-bg-surface rounded-[24px] p-6 sm:p-8 max-w-sm w-full shadow-2xl relative text-center"
              >
                <div className="w-16 h-16 bg-[#FFF0F5] rounded-full flex items-center justify-center mx-auto mb-4 text-[#D4527A]">
                  <Heart size={32} />
                </div>
                <h3 className="font-serif text-[24px] font-bold text-text-main mb-2">Move to Wishlist?</h3>
                <p className="text-[14px] text-text-muted mb-6">
                  Don&apos;t want to buy this right now? Move it to your wishlist so you can easily find it later.
                </p>
                <div className="space-y-3 flex flex-col">
                  <button
                    onClick={() => {
                      if (!isWishlisted(itemToRemove.id)) {
                        toggleItem(itemToRemove);
                      }
                      removeItem(itemToRemove.id, itemToRemove.selectedSize);
                      setItemToRemove(null);
                    }}
                    className="w-full btn-primary h-[48px] font-sans text-[14px] rounded-[12px] flex items-center justify-center"
                  >
                    Move to Wishlist
                  </button>
                  <button
                    onClick={() => {
                      removeItem(itemToRemove.id, itemToRemove.selectedSize);
                      setItemToRemove(null);
                    }}
                    className="w-full h-[48px] font-sans font-semibold text-[14px] text-[#A8A8A8] hover:text-[#D4527A] transition-colors"
                  >
                    Remove from Cart
                  </button>
                </div>
                <button
                  onClick={() => setItemToRemove(null)}
                  className="absolute top-5 right-5 text-[#A8A8A8] hover:text-text-main transition-colors"
                >
                  <X size={20} />
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

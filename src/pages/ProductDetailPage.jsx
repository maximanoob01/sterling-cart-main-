import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Award, Check, ChevronRight, Heart, Home, MapPin, PackageCheck,
  Ruler, Share2, Shield, Globe, Star, X, ZoomIn,
  Sparkles, ShoppingBag, Scale, Wrench, IndianRupee,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';
import { getProductById, getRelatedProducts } from '../data/products';
import { calculateDiscount } from '../utils/formatPrice';
import { SILVER_RATE_PER_GRAM, computeWeightBasedPrice } from '../utils/silverRate';

/* ── data ────────────────────────────────────────────────────────────── */
const loveMetrics = [
  ['Design of product', 93],
  ['Value for money', 91],
  ['Unboxing experience', 95],
  ['Product variety', 94],
];

/* ── helpers ─────────────────────────────────────────────────────────── */
function StarRating({ rating, size = 14 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size}
          className={i <= Math.round(rating) ? 'fill-[#D4527A] text-[#D4527A]' : 'fill-[#E8E8E8] text-[#E8E8E8]'}
        />
      ))}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="mb-2 text-[10px] font-bold uppercase tracking-[2px] text-[#D4527A]">{children}</p>
  );
}

function DetailGroup({ title, items }) {
  return (
    <div>
      <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[1.5px] text-[#D4527A]">{title}</h3>
      <dl className="space-y-2">
        {items.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3 border-b border-[#F3EFED] pb-2">
            <dt className="text-[12px] text-text-muted">{label}</dt>
            <dd className="text-right text-[12px] font-medium capitalize text-text-main">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ── related card ────────────────────────────────────────────────────── */
function RelatedCard({ product }) {
  const { formatPrice } = useCurrency();
  const disc = calculateDiscount(product.price, product.mrp);
  return (
    <Link
      to={`/product/${product.slug}`}
      className="group relative overflow-hidden rounded-2xl border border-[#F0E8EA] bg-bg-surface transition-all duration-400 hover:shadow-[0_10px_32px_rgba(212,82,122,0.13)] hover:-translate-y-1"
    >
      <div className="aspect-[4/5] overflow-hidden bg-[#FAF8F7]">
        <img
          src={product.images[0]} alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.07]"
          loading="lazy"
        />
      </div>
      {disc > 0 && (
        <span className="absolute top-2.5 left-2.5 rounded-full bg-[#FFF0F5] border border-[#F4A0B0]/40 px-2 py-0.5 text-[10px] font-bold text-[#D4527A]">−{disc}%</span>
      )}
      <div className="p-3.5">
        <p className="line-clamp-2 text-[12px] font-medium leading-[1.4] text-text-main group-hover:text-[#D4527A] transition-colors">{product.name}</p>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="font-serif text-[14px] font-medium text-text-main">{formatPrice(product.price)}</span>
          {product.mrp > product.price && (
            <span className="text-[11px] text-[#B0B0B0] line-through">{formatPrice(product.mrp)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ── modals ──────────────────────────────────────────────────────────── */
function ModalShell({ title, onClose, children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <motion.section
        initial={{ y: 40, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 40, scale: 0.97 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onMouseDown={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-3xl bg-bg-surface p-6 shadow-[0_24px_60px_rgba(0,0,0,0.18)] md:p-8"
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <h2 className="font-serif text-[26px] text-text-main">{title}</h2>
          <button onClick={onClose} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F5F0F1] text-text-muted hover:text-text-main" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        {children}
      </motion.section>
    </motion.div>
  );
}

function RingSizeGuide({ onClose }) {
  return (
    <ModalShell title="Find your ring size" onClose={onClose}>
      <p className="text-[13px] leading-6 text-text-muted">Wrap a strip of paper around the base of your finger, mark where it overlaps, then measure the length. Match that circumference to the guide below. Measure at the end of the day for a comfortable fit.</p>
      <div className="mt-5 overflow-x-auto rounded-2xl border border-[#F0E8EA]">
        <table className="w-full text-left text-[12px]">
          <thead className="bg-gradient-to-r from-[#FFF0F5] to-[#FDF5F8]">
            <tr>
              {['Ring size', 'Circumference', 'Diameter'].map(h => (
                <th key={h} className="px-4 py-3 font-bold uppercase tracking-[0.5px] text-[#D4527A] text-[10px]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[[5, 44.2, 14.1], [7, 46.8, 14.9], [9, 49.3, 15.7], [11, 51.9, 16.5], [13, 54.4, 17.3], [15, 57, 18.1]].map(([size, circ, dia]) => (
              <tr key={size} className="border-t border-[#F0E8EA] hover:bg-[#FFFBFC] transition-colors">
                <td className="px-4 py-3 font-semibold text-text-main">{size}</td>
                <td className="px-4 py-3 text-text-muted">{circ} mm</td>
                <td className="px-4 py-3 text-text-muted">{dia} mm</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-[11px] text-text-muted">Between sizes? Choose the larger size for a comfortable fit.</p>
    </ModalShell>
  );
}

function ImageZoom({ image, name, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0f0f0f]/95 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <button className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md" aria-label="Close zoom">
        <X size={18} />
      </button>
      <img src={image} alt={name} className="max-h-full max-w-full object-contain rounded-xl" />
    </motion.div>
  );
}

/* ── main page ───────────────────────────────────────────────────────── */
export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();
  const { formatPrice } = useCurrency();
  const [product] = useState(getProductById(id));
  const relatedProducts = product ? getRelatedProducts(product, 4) : [];

  const [mainImage, setMainImage] = useState(product?.images[0] || '');
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || null);
  const [quantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [deliveryMessage, setDeliveryMessage] = useState('');
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isProductDetailsOpen, setIsProductDetailsOpen] = useState(false);

  if (!product) {
    return (
      <div className="flex min-h-[65vh] flex-col items-center justify-center bg-bg-primary px-4 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF0F5] text-[#D4527A]">
          <ShoppingBag size={28} strokeWidth={1.5} />
        </div>
        <h1 className="font-serif text-[32px] text-text-main">Product not found</h1>
        <p className="mt-3 text-[14px] text-text-muted max-w-[280px]">This piece may have moved or is no longer available.</p>
        <Link to="/shop" className="btn-primary mt-8">Browse jewellery</Link>
      </div>
    );
  }

  const discount = calculateDiscount(product.price, product.mrp);
  const isRing = product.category === 'rings';
  const isWished = isWishlisted(product.id);

  const addToCart = () => addItem(product, selectedSize, quantity);
  const buyNow = () => { addToCart(); navigate('/checkout'); };
  const checkDelivery = () => {
    if (!/^\d{6}$/.test(pincode)) { setDeliveryMessage('Enter a valid 6-digit pincode.'); return; }
    setDeliveryMessage('Delivery available. Expected in 3–5 business days.');
  };
  const shareProduct = async () => {
    const data = { title: product.name, text: product.shortDescription, url: window.location.href };
    if (navigator.share) await navigator.share(data);
    else { await navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-bg-primary pb-24 sm:pb-10">

      {/* ── Breadcrumb ── */}
      <div className="overflow-hidden border-b border-[#F1E7E9] bg-gradient-to-r from-[#FFF0F5] to-[#FDF8FA] px-4 py-3 md:px-8">
        <nav className="mx-auto flex max-w-[1320px] flex-nowrap items-center gap-1.5 overflow-hidden text-[10px] text-text-muted sm:gap-2 sm:text-[11px]">
          <Link to="/" className="flex items-center gap-1 hover:text-[#D4527A] transition-colors"><Home size={12} /> Home</Link>
          <ChevronRight size={10} className="text-[#D9C5C9]" />
          <Link to="/shop" className="hover:text-[#D4527A] transition-colors">Shop</Link>
          <ChevronRight size={10} className="text-[#D9C5C9]" />
          <Link to={`/shop?category=${product.category}`} className="shrink-0 capitalize hover:text-[#D4527A] transition-colors">{product.category}</Link>
          <ChevronRight size={10} className="text-[#D9C5C9]" />
          <span className="min-w-0 truncate font-semibold text-[#D4527A]">{product.name}</span>
        </nav>
      </div>

      <main className="mx-auto w-full max-w-[1320px] overflow-hidden px-4 py-6 md:px-8 md:py-12">

        {/* ── Product Section ── */}
        <section className="grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">

          {/* ── Image Gallery ── */}
          <div className="min-w-0 overflow-hidden flex flex-col-reverse gap-3 md:flex-row md:gap-4">
            {/* Thumbnails */}
            <div className="flex max-w-full gap-2 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:gap-3 md:pb-0 shrink-0">
              {product.images.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  onClick={() => setMainImage(img)}
                  className={`h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 sm:h-16 sm:w-16 md:h-[72px] md:w-[72px] ${
                    mainImage === img
                      ? 'border-[#D4527A] shadow-[0_0_0_3px_rgba(212,82,122,0.15)]'
                      : 'border-transparent hover:border-[#F4A0B0] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} view ${idx + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>

            {/* Main image */}
            <div className="relative flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.button
                  key={mainImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => setIsZoomOpen(true)}
                  className="group relative block w-full overflow-hidden rounded-2xl bg-[#FAF8F7] aspect-[4/5] sm:rounded-3xl"
                  aria-label="Zoom image"
                >
                  <img
                    src={mainImage} alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Zoom icon */}
                  <span className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/80 text-text-muted shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <ZoomIn size={16} />
                  </span>
                  {/* Badges */}
                  {product.badge && (
                    <span className="absolute top-4 left-4 rounded-full bg-[#1C1C2E]/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-[0.8px] text-white">
                      {product.badge}
                    </span>
                  )}
                </motion.button>
              </AnimatePresence>
            </div>
          </div>

          {/* ── Product Info ── */}
          <div className="min-w-0 flex flex-col gap-0">

            {/* Header row */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="min-w-0">
                {product.badge && (
                  <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#FFF0F5] border border-[#F4A0B0]/40 px-3 py-1">
                    <Sparkles size={10} className="text-[#D4527A]" />
                    <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-[#D4527A]">{product.badge}</span>
                  </div>
                )}
                <h1 className="break-words font-serif text-[23px] leading-[1.18] md:text-[32px] lg:text-[38px] text-text-main">{product.name}</h1>
                <p className="mt-1.5 text-[11px] text-text-muted tracking-[0.3px]">Design code: <span className="font-medium">{product.sku}</span></p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => toggleItem(product)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-[11px] font-semibold shadow-sm transition-all ${
                    isWished
                      ? 'border-[#D4527A] bg-[#FFF0F5] text-[#D4527A]'
                      : 'border-[#F0E8EA] bg-bg-surface text-text-muted hover:border-[#F4A0B0] hover:text-[#D4527A]'
                  }`}
                >
                  <Heart size={13} className={isWished ? 'fill-[#D4527A]' : ''} />
                  <span className="hidden sm:inline">{isWished ? 'Saved' : 'Save'}</span>
                </button>
                <button
                  onClick={shareProduct}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#F0E8EA] bg-bg-surface px-3 py-2 text-[11px] font-semibold text-text-muted shadow-sm transition-all hover:border-[#F4A0B0] hover:text-[#D4527A]"
                >
                  <Share2 size={13} />
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>
            </div>

            {/* Rating */}
            <div className="mt-4 flex items-center gap-2">
              <StarRating rating={product.rating} />
              <span className="text-[13px] font-bold text-text-main">{product.rating}</span>
              <span className="text-[12px] text-text-muted">({product.reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="mt-5 rounded-2xl bg-gradient-to-br from-[#FFF0F5] to-[#FDF5F8] border border-[#F4A0B0]/20 p-3.5 sm:p-4">
              {product.pricingType === 'weight' ? (
                <>
                  {/* Weight-based: show live breakdown */}
                  <div className="flex flex-wrap items-end gap-2 mb-3">
                    <span className="font-serif text-[32px] font-medium text-text-main leading-none">
                      {formatPrice(computeWeightBasedPrice(product.weightGrams, product.makingCharges))}
                    </span>
                    <span className="mb-0.5 rounded-full bg-[#1C1C2E]/90 text-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.8px]">+ 3% GST</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-center min-[380px]:grid-cols-3">
                    <div className="rounded-xl bg-white/70 border border-[#F4A0B0]/30 px-2 py-2">
                      <p className="flex items-center justify-center gap-0.5 text-[9px] font-bold uppercase tracking-[1px] text-[#D4527A] mb-1"><Scale size={10} />Silver</p>
                      <p className="text-[13px] font-semibold text-text-main">{formatPrice(SILVER_RATE_PER_GRAM)}/g</p>
                      <p className="text-[10px] text-text-muted">{product.weightGrams}g</p>
                    </div>
                    <div className="rounded-xl bg-white/70 border border-[#F4A0B0]/30 px-2 py-2">
                      <p className="flex items-center justify-center gap-0.5 text-[9px] font-bold uppercase tracking-[1px] text-[#D4527A] mb-1"><Wrench size={10} />Making</p>
                      <p className="text-[13px] font-semibold text-text-main">{formatPrice(product.makingCharges)}</p>
                      <p className="text-[10px] text-text-muted">charges</p>
                    </div>
                    <div className="rounded-xl bg-white/70 border border-[#F4A0B0]/30 px-2 py-2">
                      <p className="flex items-center justify-center gap-0.5 text-[9px] font-bold uppercase tracking-[1px] text-[#D4527A] mb-1"><IndianRupee size={10} />GST</p>
                      <p className="text-[13px] font-semibold text-text-main">3%</p>
                      <p className="text-[10px] text-text-muted">at checkout</p>
                    </div>
                  </div>
                  <p className="mt-2.5 text-[11px] text-[#D4527A] flex items-center gap-1">
                    <Scale size={11} /> Price based on live silver rate: {formatPrice(SILVER_RATE_PER_GRAM)}/g · Final price confirmed at checkout
                  </p>
                </>
              ) : (
                <>
                  <div className="flex flex-wrap items-end gap-2">
                    <span className="font-serif text-[28px] font-medium text-text-main leading-none sm:text-[32px]">{formatPrice(product.price)}</span>
                    {discount > 0 && (
                      <>
                        <span className="text-[15px] text-text-muted line-through mb-0.5">{formatPrice(product.mrp)}</span>
                        <span className="mb-0.5 rounded-full bg-white border border-[#F4A0B0]/50 px-2.5 py-0.5 text-[11px] font-bold text-[#D4527A]">{discount}% off</span>
                      </>
                    )}
                  </div>
                  {discount > 0 && (
                    <p className="mt-1.5 text-[12px] text-[#D4527A]">You save {formatPrice(product.mrp - product.price)} on this piece</p>
                  )}
                  <p className="mt-1.5 text-[11px] text-text-muted">+ 3% GST · Fixed MRP price</p>
                </>
              )}
            </div>

            {/* International Payments Banner */}
            <div className="mt-4 p-3.5 rounded-xl border border-[#D4527A]/20 bg-gradient-to-r from-white to-[#FFF0F5]/50 flex gap-3 items-start shadow-sm">
              <div className="w-8 h-8 rounded-full bg-[#D4527A]/10 flex items-center justify-center shrink-0">
                <span className="text-[16px]">🌍</span>
              </div>
              <div>
                <p className="font-sans text-[12px] font-bold text-text-main mb-0.5">International Payments Accepted</p>
                <p className="font-sans text-[11px] text-text-muted leading-relaxed">
                  We accept Visa, Mastercard, American Express, and other major international cards. Customers worldwide can securely pay in <span className="font-bold text-[#D4527A]">USD</span>.
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="mt-5 text-[13px] leading-[1.75] text-text-muted">{product.shortDescription}</p>

            {/* Size selector (rings) */}
            {isRing && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-[11px] font-bold uppercase tracking-[1.2px] text-text-main">Ring size</h2>
                  <button onClick={() => setIsSizeGuideOpen(true)} className="flex items-center gap-1 text-[11px] font-semibold text-[#D4527A] hover:underline">
                    <Ruler size={12} /> Size guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`flex h-10 min-w-[40px] items-center justify-center rounded-full border px-3 text-[13px] font-semibold transition-all duration-200 ${
                        selectedSize === size
                          ? 'border-[#1C1C2E] bg-[#1C1C2E] text-white shadow-[0_2px_12px_rgba(28,28,46,0.2)]'
                          : 'border-[#E8E0E2] bg-bg-surface text-text-muted hover:border-[#D4527A] hover:text-[#D4527A]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Shipping & Stock Info */}
            <div className="mt-6 flex flex-col gap-2 text-[13px] text-text-main">
              <p className="flex items-center gap-2">
                <Globe size={15} strokeWidth={1.5} className="text-[#333]" /> Worldwide shipping available, T&C applied.
              </p>
              <p className="flex items-center gap-2">
                <span className="flex items-center justify-center w-3 h-3 rounded-full bg-[#E8F5EF]"><span className="w-1.5 h-1.5 rounded-full bg-[#3A8C5A]"></span></span> In stock, ready to ship
              </p>
            </div>

            {/* CTA buttons */}
            <div className="mt-5 flex h-auto flex-col gap-2.5 sm:h-[46px] sm:flex-row sm:gap-3">
              <button
                onClick={addToCart}
                className="flex min-h-11 flex-1 items-center justify-center rounded-full border border-[#D4527A] text-[11px] font-bold uppercase tracking-[1.1px] text-[#D4527A] transition-colors hover:bg-[#FFF0F5] sm:text-[12px] sm:tracking-[1.5px]"
              >
                Add to cart
              </button>
              <button
                onClick={buyNow}
                className="flex min-h-11 flex-[1.5] items-center justify-center gap-2 rounded-full bg-[#D4527A] text-[11px] font-bold uppercase tracking-[1.1px] text-white shadow-[0_4px_20px_rgba(212,82,122,0.3)] transition-colors hover:bg-[#B94B68] sm:text-[12px] sm:tracking-[1.5px]"
              >
                Buy now <ChevronRight size={14} />
              </button>
            </div>

            {/* International Orders Box */}
            <div className="mt-5 rounded-2xl border border-[#F0E8EA] bg-[#FAF8F7] p-4 text-left">
              <p className="font-bold text-[13px] text-text-main mb-3">International orders click here</p>
              <button
                onClick={buyNow}
                className="w-full bg-[#1C1C2E] text-white font-bold text-[11px] tracking-[1.5px] uppercase py-3.5 px-4 hover:bg-[#2C2C3E] transition-all rounded-full shadow-md"
              >
                Buy now (International orders)
              </button>
            </div>

            {/* 5 Promises */}
            <div className="mt-8 grid grid-cols-3 gap-3 text-center pb-6 border-b border-[#F0E8EA] min-[430px]:grid-cols-5">
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FFF0F5] text-[#D4527A] flex items-center justify-center mb-2"><Award size={16} strokeWidth={1.5} /></div>
                <p className="text-[9px] font-semibold text-[#B94B68] uppercase tracking-wide leading-tight mb-1">Timeless<br/>Assurance</p>
                <p className="text-[9px] text-text-muted leading-[1.2]">Lifetime Trade &<br/>Upgrade</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FFF0F5] text-[#D4527A] flex items-center justify-center mb-2"><Shield size={16} strokeWidth={1.5} /></div>
                <p className="text-[9px] font-semibold text-[#B94B68] uppercase tracking-wide leading-tight mb-1">One year<br/>Promise</p>
                <p className="text-[9px] text-text-muted leading-[1.2]">Warranty & Premium<br/>Care</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FFF0F5] text-[#D4527A] flex items-center justify-center mb-2"><Heart size={16} strokeWidth={1.5} /></div>
                <p className="text-[9px] font-semibold text-[#B94B68] uppercase tracking-wide leading-tight mb-1">Authenticity<br/>Assured</p>
                <p className="text-[9px] text-text-muted leading-[1.2]">100% Certified &<br/>Genuine</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FFF0F5] text-[#D4527A] flex items-center justify-center mb-2"><Sparkles size={16} strokeWidth={1.5} /></div>
                <p className="text-[9px] font-semibold text-[#B94B68] uppercase tracking-wide leading-tight mb-1">BIS<br/>Hallmarked</p>
                <p className="text-[9px] text-text-muted leading-[1.2]">Authentic 925<br/>sterling silver</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FFF0F5] text-[#D4527A] flex items-center justify-center mb-2"><PackageCheck size={16} strokeWidth={1.5} /></div>
                <p className="text-[9px] font-semibold text-[#B94B68] uppercase tracking-wide leading-tight mb-1">Gift-<br/>Ready</p>
                <p className="text-[9px] text-text-muted leading-[1.2]">Packed with<br/>care</p>
              </div>
            </div>

            {/* Offer strip */}
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-dashed border-[#F4A0B0]/60 bg-gradient-to-r from-[#FFF0F5] to-[#FDF8FA] p-3.5 sm:gap-4 sm:p-4">
              <div className="flex-1">
                <p className="text-[9px] font-bold uppercase tracking-[1.5px] text-[#D4527A] mb-1">Available offer</p>
                <p className="text-[15px] font-semibold text-text-main">Flat ₹500 off</p>
                <p className="text-[11px] text-text-muted mt-0.5">On your first purchase</p>
              </div>
              <span className="shrink-0 rounded-xl border border-dashed border-[#D4527A]/40 bg-white px-3 py-2 text-[12px] font-bold tracking-[1px] text-[#D4527A] sm:text-[13px]">SK500</span>
            </div>

            {/* Delivery check */}
            <div className="mt-4 rounded-2xl border border-[#F0E8EA] bg-bg-surface p-4">
              <h2 className="text-[11px] font-bold uppercase tracking-[1.2px] text-text-main mb-3">Check delivery</h2>
              <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2 sm:flex">
                <div className="flex h-11 items-center gap-1.5 rounded-full border border-[#F0E8EA] bg-[#FFF0F5] px-3 text-[12px] font-bold text-[#D4527A] shrink-0">
                  <MapPin size={13} /> IN
                </div>
                <input
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter pincode"
                  className="min-w-0 flex-1 rounded-full border border-[#F0E8EA] px-4 text-[13px] outline-none focus:border-[#F4A0B0] transition-colors bg-bg-surface"
                />
                <button
                  onClick={checkDelivery}
                  className="col-span-2 min-h-11 shrink-0 rounded-full bg-[#1C1C2E] px-4 text-[11px] font-bold uppercase tracking-[0.8px] text-white transition-colors hover:bg-[#2C2C3E] sm:col-span-1"
                >
                  Check
                </button>
              </div>
              {deliveryMessage && (
                <p className={`mt-2.5 flex items-center gap-1.5 text-[12px] font-medium ${deliveryMessage.startsWith('D') ? 'text-[#3A8C5A]' : 'text-[#D4527A]'}`}>
                  {deliveryMessage.startsWith('D') ? <Check size={13} /> : null}
                  {deliveryMessage}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ── Customer love + Promises ── */}
        <section className="mt-10 md:mt-14 grid gap-5 lg:grid-cols-2">
          {/* Customer love */}
          <div className="rounded-2xl border border-[#F0E8EA] bg-bg-surface p-4 md:rounded-3xl md:p-7">
            <SectionLabel>Customer confidence</SectionLabel>
            <h2 className="font-serif text-[22px] md:text-[26px] text-text-main">What customers love</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {loveMetrics.map(([label, score]) => (
                <div key={label}>
                  <div className="flex justify-between text-[12px] mb-2">
                    <span className="text-text-muted">{label}</span>
                    <span className="font-bold text-text-main">{score}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[#F1ECEA]">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-[#F4A0B0] to-[#D4527A]"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${score}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      viewport={{ once: true }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Product details */}
          <div className="rounded-2xl border border-[#F0E8EA] bg-bg-surface p-4 md:rounded-3xl md:p-7">
            <button
              type="button"
              onClick={() => setIsProductDetailsOpen((isOpen) => !isOpen)}
              className="flex w-full items-center justify-between gap-4 text-left"
              aria-expanded={isProductDetailsOpen}
              aria-controls="product-details-dropdown"
            >
              <span>
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[2px] text-[#D4527A]">Explore the story</span>
                <span className="block font-serif text-[22px] text-text-main md:text-[26px]">Product details</span>
              </span>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#F0E8EA] bg-[#FFF8FA] text-[#D4527A] transition-colors">
                <ChevronRight
                  size={18}
                  className={`transition-transform duration-300 ${isProductDetailsOpen ? 'rotate-90' : ''}`}
                />
              </span>
            </button>

            <AnimatePresence initial={false}>
              {isProductDetailsOpen && (
                <motion.div
                  id="product-details-dropdown"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
                  <p className="mt-4 text-[13px] leading-[1.85] text-text-muted">{product.description}</p>
                  <div className="mt-7 grid gap-6 border-t border-[#F0E8EA] pt-7 grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                    <DetailGroup title="General" items={[
                      ['Design code', product.sku],
                      ['Category', product.category],
                      ['Occasion', product.occasion],
                      ['Style', product.style],
                    ]} />
                    <DetailGroup title="Silver details" items={[
                      ['Material', product.metal],
                      ['Purity', '925 sterling silver'],
                      ['Finish', product.metal.includes('Oxidized') ? 'Oxidized' : 'High polish'],
                      ['Approx. weight', `${(3.5 + product.id % 6).toFixed(1)}g`],
                    ]} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* ── Related products ── */}
        {relatedProducts.length > 0 && (
          <section className="mt-10 md:mt-14">
            <div className="mb-5 flex items-end justify-between gap-4 md:mb-6">
              <div>
                <SectionLabel>More to discover</SectionLabel>
                <h2 className="font-serif text-[22px] md:text-[28px] text-text-main">You may also like</h2>
              </div>
              <Link
                to={`/shop?category=${product.category}`}
                className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.8px] text-[#D4527A] hover:gap-2 transition-all"
              >
                View all <ChevronRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5">
              {relatedProducts.map((item) => <RelatedCard key={item.id} product={item} />)}
            </div>
          </section>
        )}
      </main>

      <AnimatePresence>
        {isSizeGuideOpen && <RingSizeGuide onClose={() => setIsSizeGuideOpen(false)} />}
        {isZoomOpen && <ImageZoom image={mainImage} name={product.name} onClose={() => setIsZoomOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}

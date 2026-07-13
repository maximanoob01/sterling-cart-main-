import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Award, Check, ChevronRight, Heart, Home, MapPin, PackageCheck,
  Ruler, Share2, Shield, Globe, Star, X, ZoomIn,
  Sparkles, ShoppingBag, Scale, Wrench, IndianRupee, Coins, PenTool
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { useLoyalty } from '../context/LoyaltyContext';
import { useProducts } from '../context/ProductContext';
import SEO from '../components/seo/SEO';
import { calculateDiscount } from '../utils/formatPrice';
import { computeWeightBasedPrice } from '../utils/silverRate';
import personaliseCoinImg from '../assets/images/personalise_coin.webp';
import royalPointsCoinImg from '../assets/images/royal_points_coin.webp';

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
          src={product.images?.[0]} alt={product.name}
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 sm:p-6 backdrop-blur-md"
      onMouseDown={onClose}
    >
      <motion.div
        initial={{ y: 50, opacity: 0, scale: 0.95 }} 
        animate={{ y: 0, opacity: 1, scale: 1 }} 
        exit={{ y: 50, opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
        className="w-full max-w-[500px] overflow-hidden rounded-[24px] bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] ring-1 ring-black/5 flex flex-col max-h-[90vh]"
        onMouseDown={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-black/5 bg-[#FAFAFA] px-6 py-5 shrink-0">
          <h3 className="font-serif text-[20px] md:text-[22px] tracking-wide text-[#1A1A1A]">{title}</h3>
          <button 
            onClick={onClose} 
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#666] shadow-sm ring-1 ring-black/5 transition-all hover:bg-black/5 hover:text-black focus:outline-none"
            aria-label="Close"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>
        <div className="p-6 md:p-8 overflow-y-auto">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

function RingSizeGuide({ onClose }) {
  return (
    <ModalShell title="Find your ring size" onClose={onClose}>
      <p className="text-[13px] md:text-[14px] leading-relaxed text-[#666] mb-6">
        Wrap a strip of paper around the base of your finger, mark where it overlaps, then measure the length. Match that circumference to the guide below. Measure at the end of the day for a comfortable fit.
      </p>
      
      <div className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm ring-1 ring-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] whitespace-nowrap">
            <thead className="bg-[#FAF7F8]">
              <tr>
                {['Ring size', 'Circumference', 'Diameter'].map(h => (
                  <th key={h} className="px-5 py-4 font-semibold uppercase tracking-wider text-[#D4527A] text-[10px] md:text-[11px] border-b border-black/5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {[[5, 44.2, 14.1], [7, 46.8, 14.9], [9, 49.3, 15.7], [11, 51.9, 16.5], [13, 54.4, 17.3], [15, 57, 18.1]].map(([size, circ, dia]) => (
                <tr key={size} className="hover:bg-[#FCFAFB] transition-colors duration-200">
                  <td className="px-5 py-4 font-medium text-[#1A1A1A]">{size}</td>
                  <td className="px-5 py-4 text-[#666]">{circ} mm</td>
                  <td className="px-5 py-4 text-[#666]">{dia} mm</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-6 flex items-start gap-3 rounded-xl bg-[#F5F8FA] p-4 text-[#4A5568]">
        <div className="mt-0.5 text-[#3182CE] shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
        </div>
        <p className="text-[12px] md:text-[12.5px] leading-snug">
          <span className="font-medium text-[#2D3748]">Between sizes?</span> Choose the larger size for a more comfortable and secure fit.
        </p>
      </div>
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

function LoyaltyPointsGuide({ onClose }) {
  return (
    <ModalShell title="Loyalty Points Program" onClose={onClose}>
      <div className="space-y-5 text-[13px] md:text-[14px] text-[#666] leading-relaxed">
        <p>
          <strong className="text-[#1A1A1A]">Earn points on every purchase:</strong><br />
          You earn 1 Loyalty Point for every ₹100 spent on our website. Points are credited to your account once your order is marked as "Delivered".
        </p>
        <p>
          <strong className="text-[#1A1A1A]">Redeem points:</strong><br />
          You can use your Loyalty Points to get a discount on future orders. You can redeem points up to 10% of your total order value.
        </p>
        <p>
          <strong className="text-[#1A1A1A]">Validity:</strong><br />
          Loyalty Points are valid for exactly 12 months from the date they are credited to your account.
        </p>
      </div>
    </ModalShell>
  );
}

/* ── main page ───────────────────────────────────────────────────────── */
export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem, silverRate } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();
  const { formatPrice } = useCurrency();
  const { isAuthenticated } = useAuth();
  const { pointsEarned } = useLoyalty();
  const { products, isLoaded } = useProducts();
  const decodedId = decodeURIComponent(id);
  
  // Find product by slug or id from global context
  const product = products.find(p => p.slug === decodedId || String(p.id) === decodedId);
  
  // Get related products from context instead of mock data
  const relatedProducts = product ? products.filter(p => p.category === product.category && String(p.id) !== String(product.id)).slice(0, 4) : [];

  // SEO & AEO Data
  const entityTitle = product ? `925 Sterling Silver ${product.name} | Women Jewellery | Sterling Kart` : 'Sterling Kart Product';
  const entityDescription = product ? `Shop authentic ${product.name}. Crafted from premium 925 Sterling Silver, hypoallergenic, nickel-free, and BIS hallmarked. Perfect gift for wife or everyday wear. Worldwide shipping available.` : '';
  
  // Dynamic FAQ for AEO (Generative Engine Optimization)
  const productFaqs = product ? [
    { question: "Is this real 925 silver?", answer: "Yes, this piece is made from authentic 925 Sterling Silver and is BIS hallmarked for purity." },
    { question: "Does it tarnish or fade?", answer: "Over time, all sterling silver naturally oxidizes. However, our premium rhodium/e-coating helps delay tarnishing. Regular cleaning will keep it shining." },
    { question: "Is it suitable for gifting?", answer: "Absolutely. It comes carefully packed in our premium gift-ready packaging, making it a perfect gift for anniversaries, birthdays, or weddings." },
    { question: "Can it be worn daily?", answer: "Yes, this hypoallergenic and nickel-free jewellery is designed for everyday wear. We recommend removing it during heavy physical activities." },
    { question: "Is it waterproof?", answer: "While occasional water exposure is fine, we recommend keeping it away from harsh chemicals, perfumes, and pools to maintain its shine." },
    { question: "How should I clean it?", answer: "Gently wipe it with a soft polishing cloth. Avoid using harsh chemical cleaners or abrasive materials." }
  ] : [];

  const getItemPrice = (prod) => {
    if (prod.pricingType === 'weight' && prod.weightGrams != null && prod.makingCharges != null) {
      return computeWeightBasedPrice(prod.weightGrams, prod.makingCharges, silverRate);
    }
    return prod.price;
  };

  const schemas = product ? [
    {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.name,
      "image": product.images,
      "description": entityDescription,
      "sku": product.sku || product.id,
      "brand": {
        "@type": "Brand",
        "name": "Sterling Kart"
      },
      "offers": {
        "@type": "Offer",
        "url": `https://sterlingkart.in/product/${product.slug || product.id}`,
        "priceCurrency": "INR",
        "price": getItemPrice(product),
        "availability": "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition"
      },
      "aggregateRating": product.reviewCount > 0 ? {
        "@type": "AggregateRating",
        "ratingValue": product.rating,
        "reviewCount": product.reviewCount
      } : undefined
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://sterlingkart.in/" },
        { "@type": "ListItem", "position": 2, "name": "Shop", "item": "https://sterlingkart.in/shop" },
        { "@type": "ListItem", "position": 3, "name": product.category, "item": `https://sterlingkart.in/shop?category=${product.category}` },
        { "@type": "ListItem", "position": 4, "name": product.name }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": productFaqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    }
  ].filter(Boolean) : [];

  const [mainImage, setMainImage] = useState(product?.images?.[0] || '');
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || null);
  const [quantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [deliveryMessage, setDeliveryMessage] = useState('');
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isProductDetailsOpen, setIsProductDetailsOpen] = useState(false);
  const [isEngravingEnabled, setIsEngravingEnabled] = useState(false);
  const [engravingText, setEngravingText] = useState('');
  const [engravingType, setEngravingType] = useState('text');
  const [isLoyaltyPointsGuideOpen, setisLoyaltyPointsGuideOpen] = useState(false);



  if (!product) {
    if (!isLoaded) {
      return (
        <div className="flex min-h-[65vh] flex-col items-center justify-center bg-bg-primary px-4 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF0F5] text-[#D4527A] animate-pulse">
            <ShoppingBag size={28} strokeWidth={1.5} />
          </div>
          <h1 className="font-serif text-[24px] text-text-main animate-pulse">Loading Product...</h1>
        </div>
      );
    }
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

  const addToCart = async () => {
    let finalEngraving = engravingText;
    if (isEngravingEnabled && engravingType === 'date' && engravingText) {
      const parts = engravingText.split('-');
      if (parts.length === 3) {
        finalEngraving = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    await addItem(product, selectedSize, quantity, isEngravingEnabled ? finalEngraving : '');
  };
  const buyNow = async () => { await addToCart(); navigate('/checkout'); };
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
      {product && (
        <SEO 
          title={entityTitle} 
          description={entityDescription} 
          image={product.images?.[0]} 
          schemas={schemas} 
        />
      )}

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
                  <div className="flex flex-wrap items-end gap-2">
                    <span className="font-serif text-[32px] font-medium text-text-main leading-none">
                      {formatPrice(getItemPrice(product))}
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] text-[#D4527A] flex items-center gap-1">
                    <Scale size={11} /> Price based on live silver rate · GST included
                  </p>
                </>
              ) : (
                <>
                  <div className="flex flex-wrap items-end gap-2">
                    <span className="font-serif text-[28px] font-medium text-text-main leading-none sm:text-[32px]">{formatPrice(getItemPrice(product))}</span>
                    {discount > 0 && (
                      <>
                        <span className="text-[15px] text-text-muted line-through mb-0.5">{formatPrice(Math.round(product.mrp * 1.03))}</span>
                        <span className="mb-0.5 rounded-full bg-white border border-[#F4A0B0]/50 px-2.5 py-0.5 text-[11px] font-bold text-[#D4527A]">{discount}% off</span>
                      </>
                    )}
                  </div>
                  {discount > 0 && (
                    <p className="mt-1.5 text-[12px] text-[#D4527A]">You save {formatPrice(Math.round(product.mrp * 1.03) - getItemPrice(product))} on this piece</p>
                  )}
                  <p className="mt-1.5 text-[11px] text-text-muted">GST included</p>
                </>
              )}

              {/* ── Loyalty Points badge (logged-in users only) ── */}
              {isAuthenticated && (() => {
                const basePrice = getItemPrice(product);
                const earnOnThis = pointsEarned(basePrice);
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-3 pt-3 border-t border-[#F4A0B0]/30 flex items-center justify-between gap-2.5"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={royalPointsCoinImg}
                        alt="Loyalty Points"
                        className="w-7 h-7 rounded-full object-cover flex-shrink-0 drop-shadow-[0_0_4px_rgba(212,82,122,0.4)]"
                      />
                      <p className="font-sans text-[12px] font-bold text-[#D4527A]">
                        Earn <span className="text-[14px]">{earnOnThis}</span> Loyalty Points
                      </p>
                    </div>
                    <button 
                      onClick={() => setisLoyaltyPointsGuideOpen(true)} 
                      className="text-[10px] text-text-muted hover:text-[#D4527A] underline shrink-0 font-medium"
                    >
                      How does it work?
                    </button>
                  </motion.div>
                );
              })()}
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

            {/* Free Engraving Option */}
            <div className="mt-5 rounded-2xl border border-[#F4A0B0]/40 bg-gradient-to-r from-[#FFF0F5]/50 to-white p-4 shadow-sm">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-[#D4527A] text-[#D4527A] focus:ring-[#D4527A] cursor-pointer" 
                  checked={isEngravingEnabled} 
                  onChange={(e) => { setIsEngravingEnabled(e.target.checked); if (!e.target.checked) setEngravingText(''); }} 
                />
                <span className="font-bold text-[13px] text-text-main flex items-center gap-1.5">
                  <PenTool size={15} className="text-[#D4527A]" /> Add Free Engraving
                </span>
                <span className="ml-auto text-[10px] uppercase font-bold tracking-wider text-[#D4527A] bg-[#FFF0F5] px-2 py-1 rounded-md">Complimentary</span>
              </label>
              
              {isEngravingEnabled && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 overflow-hidden">
                  <div className="flex gap-2 mb-3">
                    <button 
                      onClick={() => { setEngravingType('text'); setEngravingText(''); }}
                      className={`px-3 py-1.5 text-[11px] rounded-full border transition-all ${engravingType === 'text' ? 'bg-[#1C1C2E] text-white border-[#1C1C2E]' : 'bg-white text-text-muted border-[#F0E8EA]'}`}
                    >Text</button>
                    <button 
                      onClick={() => { setEngravingType('date'); setEngravingText(''); }}
                      className={`px-3 py-1.5 text-[11px] rounded-full border transition-all ${engravingType === 'date' ? 'bg-[#1C1C2E] text-white border-[#1C1C2E]' : 'bg-white text-text-muted border-[#F0E8EA]'}`}
                    >Date</button>
                  </div>
                  
                  {engravingType === 'text' ? (
                    <>
                      <input
                        type="text"
                        value={engravingText}
                        onChange={(e) => setEngravingText(e.target.value)}
                        placeholder="Enter name or message..."
                        className="w-full rounded-xl border border-[#F0E8EA] px-4 py-2.5 text-[13px] outline-none transition-all focus:border-[#D4527A] focus:ring-1 focus:ring-[#D4527A] bg-white"
                        maxLength={10}
                      />
                      <p className="mt-1.5 text-[10.5px] text-text-muted flex justify-between">
                        <span>Will be engraved exactly as entered</span>
                        <span className={engravingText.length >= 10 ? 'text-[#D4527A]' : ''}>{engravingText.length}/10</span>
                      </p>
                    </>
                  ) : (
                    <>
                      <input
                        type="date"
                        value={engravingText}
                        onChange={(e) => setEngravingText(e.target.value)}
                        className="w-full rounded-xl border border-[#F0E8EA] px-4 py-2.5 text-[13px] outline-none transition-all focus:border-[#D4527A] focus:ring-1 focus:ring-[#D4527A] bg-white text-text-main"
                      />
                      <p className="mt-1.5 text-[10.5px] text-text-muted">
                        Will be engraved in DD-MM-YYYY format
                      </p>
                    </>
                  )}
                </motion.div>
              )}
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

            {/* Personalise Banner — shown only for silver coins */}
            {product.category === 'coins' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-4"
              >
                <Link
                  to="/personalise"
                  className="group relative flex items-center gap-4 rounded-2xl overflow-hidden border border-[#D4527A]/30 bg-gradient-to-r from-[#1C1C2E] via-[#2A1A2E] to-[#1C1C2E] p-4 shadow-[0_4px_24px_rgba(212,82,122,0.18)] hover:shadow-[0_6px_32px_rgba(212,82,122,0.35)] transition-all duration-300 hover:-translate-y-0.5"
                >
                  {/* Shimmer overlay */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/5 to-transparent" />

                  {/* Floating animated coin */}
                  <div className="relative shrink-0 w-14 h-14">
                    {/* Glow ring */}
                    <div className="absolute inset-0 rounded-full bg-[#D4527A]/30 blur-md animate-pulse" />
                    <motion.img
                      src={personaliseCoinImg}
                      alt="Personalise silver coin"
                      className="relative w-14 h-14 rounded-full object-cover border-2 border-[#D4527A]/50 shadow-[0_0_20px_rgba(212,82,122,0.4)]"
                      animate={{ y: [0, -5, 0], rotate: [0, 2, 0, -2, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    {/* Sparkle badge */}
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-[#D4527A] to-[#B94B68] flex items-center justify-center shadow-md">
                      <Sparkles size={10} className="text-white" />
                    </div>
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#F4A0B0] mb-0.5">Custom Engraving</p>
                    <p className="text-white font-semibold text-[14px] leading-snug">Get your own engraved coin</p>
                    <p className="text-white/50 text-[11px] mt-0.5">Your design, name or logo — laser engraved →</p>
                  </div>

                  {/* Arrow badge */}
                  <div className="shrink-0 w-8 h-8 rounded-full bg-[#D4527A]/20 border border-[#D4527A]/40 flex items-center justify-center group-hover:bg-[#D4527A] group-hover:border-[#D4527A] transition-all duration-300">
                    <ChevronRight size={15} className="text-[#D4527A] group-hover:text-white transition-colors duration-300" />
                  </div>
                </Link>
              </motion.div>
            )}

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
                <p className="text-[9px] font-semibold text-[#B94B68] uppercase tracking-wide leading-tight mb-1">15 Days<br/>Exchange</p>
                <p className="text-[9px] text-text-muted leading-[1.2]">Hassle-free<br/>Exchange Policy</p>
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
                <p className="text-[15px] font-semibold text-text-main">10% off on your first order</p>
                <p className="text-[12px] text-text-muted mt-0.5">Use code during checkout</p>
              </div>
              <span className="shrink-0 rounded-xl border border-dashed border-[#D4527A]/40 bg-white px-3 py-2 text-[12px] font-bold tracking-[1px] text-[#D4527A] sm:text-[13px]">SILVER10</span>
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

        {/* ── AI Search Optimized FAQ (AEO) ── */}
        <section className="mt-10 md:mt-14 rounded-2xl border border-[#F0E8EA] bg-bg-surface p-4 md:rounded-3xl md:p-7">
          <SectionLabel>Expert Answers</SectionLabel>
          <h2 className="font-serif text-[20px] md:text-[26px] text-text-main mb-4 md:mb-6">Frequently Asked Questions</h2>
          <div className="grid gap-3 md:gap-4 md:grid-cols-2 lg:gap-6">
            {productFaqs.map((faq, idx) => (
              <div key={idx} className="border-b border-[#F0E8EA] pb-3 last:border-0 md:border-0 md:pb-0">
                <h3 className="text-[12px] md:text-[13px] font-bold text-text-main mb-1.5 flex items-start gap-2">
                  <Sparkles size={13} className="text-[#D4527A] mt-0.5 shrink-0 md:w-3.5 md:h-3.5 w-3 h-3" /> {faq.question}
                </h3>
                <p className="text-[11px] md:text-[12px] leading-relaxed text-text-muted">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Aggressive Internal Linking Architecture ── */}
        <section className="mt-10 md:mt-14 border-t border-[#F0E8EA] pt-8 pb-4">
          <SectionLabel>Explore Sterling Kart</SectionLabel>
          <div className="flex flex-wrap gap-3 mt-4">
            <Link to={`/shop?category=${product.category}`} className="rounded-full bg-[#FAF8F7] border border-[#F0E8EA] px-4 py-2 text-[11px] font-medium text-text-main hover:border-[#F4A0B0] transition-colors">Related {product.category}</Link>
            <Link to="/shop?category=earrings" className="rounded-full bg-[#FAF8F7] border border-[#F0E8EA] px-4 py-2 text-[11px] font-medium text-text-main hover:border-[#F4A0B0] transition-colors">Matching Earrings</Link>
            <Link to="/shop?category=necklaces" className="rounded-full bg-[#FAF8F7] border border-[#F0E8EA] px-4 py-2 text-[11px] font-medium text-text-main hover:border-[#F4A0B0] transition-colors">Matching Necklaces</Link>
            <Link to="/gifting" className="rounded-full bg-[#FAF8F7] border border-[#F0E8EA] px-4 py-2 text-[11px] font-medium text-text-main hover:border-[#F4A0B0] transition-colors">Gift Cards</Link>
            <Link to="/about" className="rounded-full bg-[#FAF8F7] border border-[#F0E8EA] px-4 py-2 text-[11px] font-medium text-text-main hover:border-[#F4A0B0] transition-colors">Silver Authenticity Guide</Link>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {isSizeGuideOpen && <RingSizeGuide onClose={() => setIsSizeGuideOpen(false)} />}
        {isZoomOpen && <ImageZoom image={mainImage} name={product.name} onClose={() => setIsZoomOpen(false)} />}
        {isLoyaltyPointsGuideOpen && <LoyaltyPointsGuide onClose={() => setisLoyaltyPointsGuideOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}

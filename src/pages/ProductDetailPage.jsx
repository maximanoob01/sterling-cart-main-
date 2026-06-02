import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Award, Check, ChevronRight, Heart, Home, Lock, MapPin, Minus, PackageCheck,
  Plus, RotateCcw, Ruler, Share2, ShieldCheck, ShoppingCart, Star, Truck, X, ZoomIn,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { getProductById, getRelatedProducts } from '../data/products';
import { calculateDiscount, formatPrice } from '../utils/formatPrice';

const loveMetrics = [
  ['Design of product', 93],
  ['Value for money', 91],
  ['Unboxing experience', 95],
  ['Product variety', 94],
];

const promises = [
  [ShieldCheck, 'BIS hallmarked', 'Authentic 925 sterling silver'],
  [RotateCcw, 'Easy returns', '7-day return window'],
  [Truck, 'Free shipping', 'On orders above Rs. 1,999'],
  [Award, 'Quality checked', 'Inspected before dispatch'],
  [Lock, 'Secure payment', 'Protected checkout'],
  [PackageCheck, 'Gift-ready', 'Packed with care'],
];

function StarRating({ rating, size = 15 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((index) => (
        <Star key={index} size={size} className={index <= Math.round(rating) ? 'fill-[#D9909F] text-[#D9909F]' : 'fill-[#E8E8E8] text-[#E8E8E8]'} />
      ))}
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();
  const product = getProductById(id);
  const relatedProducts = product ? getRelatedProducts(product, 4) : [];

  const [mainImage, setMainImage] = useState(product?.images[0] || '');
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [deliveryMessage, setDeliveryMessage] = useState('');
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  if (!product) {
    return (
      <div className="flex min-h-[55vh] flex-col items-center justify-center bg-bg-primary px-4 text-center">
        <h1 className="font-serif text-[34px] text-text-main">Product not found</h1>
        <p className="mt-3 text-[14px] text-text-muted">This piece may have moved or is no longer available.</p>
        <Link to="/shop" className="btn-primary mt-6">Browse jewellery</Link>
      </div>
    );
  }

  const discount = calculateDiscount(product.price, product.mrp);
  const isRing = product.category === 'rings';
  const isWished = isWishlisted(product.id);

  const addToCart = () => addItem(product, selectedSize, quantity);
  const buyNow = () => {
    addToCart();
    navigate('/checkout');
  };
  const checkDelivery = () => {
    if (!/^\d{6}$/.test(pincode)) {
      setDeliveryMessage('Enter a valid 6-digit pincode.');
      return;
    }
    setDeliveryMessage('Delivery available. Expected in 3-5 business days.');
  };
  const shareProduct = async () => {
    const shareData = { title: product.name, text: product.shortDescription, url: window.location.href };
    if (navigator.share) await navigator.share(shareData);
    else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Product link copied');
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary pb-20 sm:pb-0">
      <div className="border-b border-[#F1E7E9] bg-pink-50 px-4 py-3 md:px-8">
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center gap-2 text-[12px] text-text-muted">
          <Link to="/" className="flex items-center gap-1 hover:text-[#B94B68]"><Home size={13} /> Home</Link>
          <ChevronRight size={12} />
          <Link to="/shop" className="hover:text-[#B94B68]">Shop</Link>
          <ChevronRight size={12} />
          <Link to={`/shop?category=${product.category}`} className="capitalize hover:text-[#B94B68]">{product.category}</Link>
          <ChevronRight size={12} />
          <span className="max-w-[220px] truncate font-medium text-[#B94B68]">{product.name}</span>
        </div>
      </div>

      <main className="mx-auto max-w-[1320px] px-4 py-8 md:px-8 md:py-12">
        <section className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div className="grid min-w-0 gap-4 md:grid-cols-[72px_minmax(0,1fr)]">
            <div className="order-2 flex gap-3 overflow-x-auto md:order-1 md:flex-col">
              {product.images.map((image, index) => (
                <button key={`${image}-${index}`} onClick={() => setMainImage(image)} className={`h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg border-2 bg-bg-alt transition-colors ${mainImage === image ? 'border-[#B94B68]' : 'border-transparent hover:border-[#E7BCC5]'}`}>
                  <img src={image} alt={`${product.name} view ${index + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
            <button onClick={() => setIsZoomOpen(true)} className="group relative order-1 block aspect-square min-w-0 w-full self-start overflow-hidden rounded-2xl bg-bg-alt md:order-2" aria-label="Zoom product image">
              <img src={mainImage} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
              <span className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-bg-surface/90 text-text-muted shadow-sm"><ZoomIn size={18} /></span>
            </button>
          </div>

          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                {product.badge && <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-[#B94B68]">{product.badge}</p>}
                <h1 className="mt-2 font-serif text-[26px] md:text-[34px] lg:text-[40px] leading-tight text-text-main">{product.name}</h1>
                <p className="mt-2 text-[12px] text-text-muted">Design code: {product.sku}</p>
              </div>
              <button onClick={shareProduct} className="flex shrink-0 items-center gap-1.5 rounded-full border border-border-main px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.6px] text-text-muted hover:text-[#B94B68]"><Share2 size={15} /> Share</button>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <StarRating rating={product.rating} />
              <span className="text-[13px] font-semibold text-[#444]">{product.rating}</span>
              <span className="text-[12px] text-text-muted">({product.reviewCount} customer reviews)</span>
            </div>

            <div className="mt-5 flex flex-wrap items-end gap-3 border-b border-[#EEEAE8] pb-5">
              <span className="text-[28px] font-semibold text-text-main">{formatPrice(product.price)}</span>
              {discount > 0 && <>
                <span className="mb-1 text-[15px] text-text-muted line-through">{formatPrice(product.mrp)}</span>
                <span className="mb-1 rounded-full bg-pink-50 px-2.5 py-1 text-[11px] font-bold text-[#B94B68]">{discount}% off</span>
              </>}
            </div>

            <p className="mt-5 text-[14px] leading-6 text-[#666]">{product.shortDescription}</p>

            {isRing && (
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-sans text-[13px] font-bold uppercase tracking-[0.8px] text-[#444]">Select ring size</h2>
                  <button onClick={() => setIsSizeGuideOpen(true)} className="flex items-center gap-1 text-[12px] font-semibold text-[#B94B68] hover:underline"><Ruler size={14} /> Ring size guide</button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button key={size} onClick={() => setSelectedSize(size)} className={`flex h-10 min-w-10 items-center justify-center rounded-full border px-2 text-[13px] font-semibold transition-colors ${selectedSize === size ? 'border-[#1C1C2E] bg-[#1C1C2E] text-white' : 'border-[#DDD6D3] bg-bg-surface text-text-muted hover:border-[#B94B68]'}`}>{size}</button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between rounded-xl border border-[#EEEAE8] bg-bg-surface p-4">
              <div>
                <p className="text-[12px] font-bold uppercase tracking-[0.7px] text-text-muted">Quantity</p>
                <div className="mt-2 flex h-9 w-[110px] items-center rounded-full border border-[#DDD6D3]">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="flex h-full flex-1 items-center justify-center"><Minus size={14} /></button>
                  <span className="text-[13px] font-semibold">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.stockQty, quantity + 1))} className="flex h-full flex-1 items-center justify-center"><Plus size={14} /></button>
                </div>
              </div>
              <span className="flex items-center gap-1 text-[12px] font-semibold text-[#43835D]"><Check size={15} /> In stock</span>
            </div>

            <div className="mt-4 flex gap-3">
              <button onClick={addToCart} className="btn-primary h-[50px] flex-1"><ShoppingCart size={17} /> Add to cart</button>
              <button onClick={() => toggleItem(product)} className={`flex h-[50px] w-[50px] items-center justify-center rounded-full border ${isWished ? 'border-[#D4527A] bg-pink-50' : 'border-[#DDD6D3] bg-bg-surface'}`} aria-label="Toggle wishlist">
                <Heart size={18} className={isWished ? 'fill-[#D4527A] text-[#D4527A]' : 'text-text-muted'} />
              </button>
            </div>
            <button onClick={buyNow} className="btn-dark mt-3 h-[50px] w-full">Buy it now</button>

            <div className="mt-6 rounded-xl border border-[#EEEAE8] bg-bg-surface p-4">
              <h2 className="text-[13px] font-bold uppercase tracking-[0.7px] text-[#444]">Delivery details</h2>
              <div className="mt-3 flex gap-2">
                <div className="flex h-11 items-center gap-2 rounded-lg border border-border-main px-3 text-[12px] font-semibold text-text-muted"><MapPin size={15} className="text-[#B94B68]" /> IN</div>
                <input value={pincode} onChange={(event) => setPincode(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Pincode" className="min-w-0 flex-1 rounded-lg border border-border-main px-3 text-[13px] outline-none" />
                <button onClick={checkDelivery} className="rounded-lg bg-[#1C1C2E] px-3 text-[11px] font-bold uppercase tracking-[0.5px] text-white">Check</button>
              </div>
              {deliveryMessage && <p className={`mt-2 text-[12px] ${deliveryMessage.startsWith('Delivery') ? 'text-[#43835D]' : 'text-[#B94B68]'}`}>{deliveryMessage}</p>}
            </div>

            <div className="mt-4 rounded-xl border border-[#F1D8DE] bg-pink-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.8px] text-[#B94B68]">Available offer</p>
              <div className="mt-2 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[16px] font-semibold text-text-main">Flat Rs. 500 off</p>
                  <p className="mt-1 text-[12px] text-text-muted">Applicable on your first purchase.</p>
                </div>
                <span className="rounded-lg border border-dashed border-[#D9909F] bg-bg-surface px-3 py-2 text-[12px] font-bold tracking-[0.8px] text-[#B94B68]">SK500</span>
              </div>
            </div>
          </div>
        </section>

        <section className="relative mt-10 md:mt-14 grid clear-both gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-[#EEEAE8] bg-bg-surface p-5 md:p-6">
            <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-[#B94B68]">Customer confidence</p>
            <h2 className="mt-2 font-serif text-[20px] md:text-[28px] text-text-main">What our customers love</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {loveMetrics.map(([label, score]) => (
                <div key={label}>
                  <div className="flex justify-between gap-3 text-[12px]"><span className="text-[#666]">{label}</span><strong>{score}%</strong></div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#F1ECEA]"><div className="h-full rounded-full bg-[#D9909F]" style={{ width: `${score}%` }} /></div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#EEEAE8] bg-bg-surface p-5 md:p-6">
            <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-[#B94B68]">The Sterling Kart standard</p>
            <h2 className="mt-2 font-serif text-[20px] md:text-[28px] text-text-main">Our promises</h2>
            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {promises.map(([Icon, title, text]) => <div key={title} className="flex gap-2.5"><Icon size={18} className="shrink-0 text-[#B94B68]" /><div><p className="text-[12px] font-semibold text-[#444]">{title}</p><p className="mt-1 text-[11px] leading-4 text-text-muted">{text}</p></div></div>)}
            </div>
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-[#EEEAE8] bg-bg-surface p-5 md:p-7">
          <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-[#B94B68]">Explore the story</p>
          <h2 className="mt-2 font-serif text-[20px] md:text-[28px] text-text-main">Product details</h2>
          <p className="mt-4 max-w-[1000px] text-[14px] leading-7 text-[#666]">{product.description}</p>
          <div className="mt-6 grid gap-6 border-t border-[#EEEAE8] pt-6 md:grid-cols-3">
            <DetailGroup title="General" items={[['Design code', product.sku], ['Category', product.category], ['Occasion', product.occasion], ['Style', product.style]]} />
            <DetailGroup title="Silver details" items={[['Material', product.metal], ['Purity', '925 sterling silver'], ['Finish', product.metal.includes('Oxidized') ? 'Oxidized' : 'High polish'], ['Approx. weight', `${(3.5 + product.id % 6).toFixed(1)}g`]]} />
            <DetailGroup title="Stone details" items={[['Stone', product.stoneType], ['Setting', product.stoneType === 'No Stone' ? 'Not applicable' : 'Hand-set'], ['Quality check', 'Completed'], ['Care', 'Store dry and wipe softly']]} />
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="mt-14">
            <div className="flex items-end justify-between">
              <div><p className="text-[10px] font-bold uppercase tracking-[1.4px] text-[#B94B68]">More to discover</p><h2 className="mt-2 font-serif text-[20px] md:text-[28px] text-text-main">You may also like</h2></div>
              <Link to={`/shop?category=${product.category}`} className="text-[11px] font-bold uppercase tracking-[0.7px] text-[#B94B68]">View category</Link>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5">
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

function DetailGroup({ title, items }) {
  return <div><h3 className="font-sans text-[12px] font-bold uppercase tracking-[0.8px] text-[#B94B68]">{title}</h3><dl className="mt-3 space-y-2">{items.map(([label, value]) => <div key={label} className="flex justify-between gap-3 border-b border-[#F3EFED] pb-2 text-[12px]"><dt className="text-text-muted">{label}</dt><dd className="text-right font-medium capitalize text-text-muted">{value}</dd></div>)}</dl></div>;
}

function RelatedCard({ product }) {
  return <Link to={`/product/${product.slug}`} className="group overflow-hidden rounded-xl border border-[#EEEAE8] bg-bg-surface"><div className="aspect-square overflow-hidden bg-bg-alt"><img src={product.images[0]} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" /></div><div className="p-3"><p className="line-clamp-2 text-[12px] font-medium leading-4 text-[#444] group-hover:text-[#B94B68]">{product.name}</p><p className="mt-2 text-[12px] font-semibold">{formatPrice(product.price)}</p></div></Link>;
}

function RingSizeGuide({ onClose }) {
  return (
    <ModalShell title="Find your ring size" onClose={onClose}>
      <p className="text-[13px] leading-6 text-[#666]">Wrap a strip of paper around the base of your finger, mark where it overlaps, then measure the length. Match that circumference to the guide below. Measure at the end of the day for a comfortable fit.</p>
      <div className="mt-4 overflow-x-auto rounded-xl border border-[#EEEAE8]">
        <table className="w-full text-left text-[12px]">
          <thead className="bg-pink-50 text-[#B94B68]"><tr><th className="p-3">Ring size</th><th className="p-3">Circumference</th><th className="p-3">Diameter</th></tr></thead>
          <tbody>{[[5, 44.2, 14.1], [7, 46.8, 14.9], [9, 49.3, 15.7], [11, 51.9, 16.5], [13, 54.4, 17.3], [15, 57, 18.1]].map(([size, circumference, diameter]) => <tr key={size} className="border-t border-[#EEEAE8]"><td className="p-3 font-semibold">{size}</td><td className="p-3">{circumference} mm</td><td className="p-3">{diameter} mm</td></tr>)}</tbody>
        </table>
      </div>
      <p className="mt-4 text-[11px] leading-5 text-text-muted">Between sizes? Choose the larger size for a more comfortable fit.</p>
    </ModalShell>
  );
}

function ImageZoom({ image, name, onClose }) {
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-surface/95 p-5" onClick={onClose}><button className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-bg-alt" aria-label="Close zoom"><X size={19} /></button><img src={image} alt={name} className="max-h-full max-w-full object-contain" /></motion.div>;
}

function ModalShell({ title, onClose, children }) {
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onMouseDown={onClose}><motion.section initial={{ y: 14, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 14, scale: 0.98 }} onMouseDown={(event) => event.stopPropagation()} className="max-h-[88vh] w-full max-w-[560px] overflow-y-auto rounded-2xl bg-bg-surface p-5 shadow-modal md:p-6"><div className="flex items-start justify-between gap-4"><h2 className="font-serif text-[28px] text-text-main">{title}</h2><button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-alt" aria-label="Close"><X size={17} /></button></div><div className="mt-4">{children}</div></motion.section></motion.div>;
}

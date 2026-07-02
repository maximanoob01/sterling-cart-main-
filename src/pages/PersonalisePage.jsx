import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, CheckCircle, Truck, ArrowRight, ShieldCheck,
  Image as ImageIcon, Check, ChevronDown, Calendar, Clock, Sparkles, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import engraveProcessVid from '../assets/images/engrave_process.mp4';
import engraveResultVid from '../assets/images/engrave_result.mp4';
import heroBgVid from '../assets/images/hero_bg_video.mp4';
import engravedCoinImg from '../assets/images/engraved_coin.png';
import plainCoinImg from '../assets/images/plain_coin.png';
import lakshmiCoinImg from '../assets/images/lakshmi_coin.png';
import ganeshCoinImg from '../assets/images/ganesh_coin.png';

const COIN_BASE_PRICE = 2499;
const ENGRAVING_FEE = 250;

const coins = [
  { id: 'plain',    label: 'Plain Silver',  img: plainCoinImg,    price: COIN_BASE_PRICE },
  { id: 'engraved', label: 'Engraved',      img: engravedCoinImg, price: COIN_BASE_PRICE },
  { id: 'lakshmi',  label: 'Lakshmi',       img: lakshmiCoinImg,  price: COIN_BASE_PRICE },
  { id: 'ganesh',   label: 'Ganesh',        img: ganeshCoinImg,   price: COIN_BASE_PRICE },
];

const faqs = [
  {
    q: 'What designs work best for engraving?',
    a: 'High-contrast black and white designs work best — monograms, initials, line art, dates, or simple logos. Vector files (SVG, PDF) give the sharpest result. Avoid gradients, shading, or anything with fine detail smaller than 2mm.',
  },
  {
    q: 'What happens if my design is rejected?',
    a: "If your design cannot be engraved, you will receive a message within 24 hours with the exact reason along with a resubmission link. Alternatively, our team will contact you directly to assist you through the process.",
  },
  {
    q: 'Can I submit a photo?',
    a: "Standard photos cannot be laser-engraved clearly on silver. Convert your photo to a high-contrast line art or silhouette first, then upload. If you're unsure, book a call and we'll guide you.",
  },
  {
    q: 'How long does the full process take?',
    a: 'Submit before 6pm and your design is reviewed same business day. Engraving is done the next business day — so total dispatch time is 2 business days from order. Delivery takes 3–5 business days after dispatch via Shiprocket.',
  },
  {
    q: 'What is the policy if I cancel or change my personalisation order?',
    a: 'We do not offer refunds on personalised orders. However, if there is a quality issue or a defect on our end, you are covered under our 15-day exchange policy. Please note that personalised items cannot be exchanged for a change of mind.',
  },
];

const steps = [
  {
    icon: Upload,
    title: 'Upload your design',
    desc: 'PNG, SVG, or PDF. Minimum 300 DPI, high contrast.',
  },
  {
    icon: Clock,
    title: 'Reviewed within 24 hrs',
    desc: 'You will receive an approval notification once your design is reviewed.',
  },
  {
    icon: Sparkles,
    title: 'Laser engraved',
    desc: 'Precision engraving on your 10g sterling silver coin.',
  },
  {
    icon: Truck,
    title: 'Dispatched in 2 days',
    desc: 'Delivered in 3–5 business days after dispatch.',
  },
];

export default function PersonalisePage() {
  const [file, setFile]           = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasRights, setHasRights] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [selectedCoin, setSelectedCoin] = useState(coins[0]);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef(null);

  const { addItem } = useCart();
  const navigate = useNavigate();

  const total = selectedCoin.price + ENGRAVING_FEE;

  const handleDragOver  = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop      = (e) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
  };

  const handleFileChange = (f) => {
    if (!f) return;
    setFileError('');
    const valid = ['image/png', 'image/svg+xml', 'application/pdf'];
    if (!valid.includes(f.type)) {
      setFileError('Only PNG, SVG, or PDF files are accepted.');
      return;
    }
    if (f.size < 1_000_000) { setFileError('File must be at least 1MB to ensure quality.'); return; }
    if (f.size > 10_000_000) { setFileError('File must be under 10MB.'); return; }
    setFile(f);
  };

  const canSubmit = file && hasRights;

  const handleAddToCart = () => {
    if (!canSubmit) return;
    const customProduct = {
      id: `custom-coin-${selectedCoin.id}`,
      name: `10g Silver Coin - ${selectedCoin.label}`,
      price: total,
      images: [selectedCoin.img],
      category: 'coins',
      pricingType: 'fixed',
    };
    addItem(customProduct, null, 1, `Custom Design: ${file.name}`);
    navigate('/cart');
  };

  return (
    <div className="bg-bg-main min-h-screen font-sans">

      {/* ── 1. HERO ── */}
      <section className="relative h-[55vh] min-h-[460px] flex items-center overflow-hidden">
        <video
          src={heroBgVid} autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-main via-transparent to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 w-full flex flex-col items-center text-center pt-8">
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="text-[#D4527A] uppercase tracking-[0.2em] text-xs font-bold mb-5"
          >
            Sterling Kart · Custom Engraving
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.05 }}
            className="font-serif text-5xl md:text-7xl font-semibold text-white tracking-tight mb-6 max-w-2xl leading-[1.1]"
          >
            Make It Yours
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 }}
            className="text-white/80 text-lg md:text-xl max-w-2xl leading-relaxed mb-10"
          >
            Your name, a date, or your own artwork — laser engraved forever on a 10g 925 sterling silver coin.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.15 }}
            className="flex flex-col md:flex-row gap-4 items-center justify-center"
          >
            <a
              href="#upload"
              className="inline-flex items-center gap-2 bg-[#D4527A] hover:bg-[#B94B68] text-white px-8 py-4 rounded-xl font-semibold text-sm transition-all duration-300 hover:-translate-y-0.5 shadow-lg"
            >
              Start your design <ArrowRight size={16} />
            </a>
            <div className="text-white/60 text-sm">
              ₹{ENGRAVING_FEE} engraving fee · Ships in 2 business days
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 2. HOW IT WORKS ── */}
      <section className="py-20 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-[#D4527A] uppercase tracking-[0.18em] text-xs font-bold mb-4 text-center">The process</p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-center text-gray-900 mb-16">
            From upload to your door
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 relative">
            {/* connector — visible only on md+ */}
            <div className="hidden md:block absolute top-7 left-[12.5%] right-[12.5%] h-px bg-gray-200 z-0" />

            {steps.map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-white border border-[#F1D8DE] rounded-2xl flex items-center justify-center mb-5 shadow-sm">
                  <Icon size={24} strokeWidth={1.5} className="text-[#D4527A]" />
                </div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1.5">Step {i + 1}</p>
                <h3 className="font-serif text-base font-semibold text-gray-900 mb-1.5 leading-snug">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. VIDEOS ── */}
      <section className="pt-16 pb-8 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[#D4527A] uppercase tracking-[0.18em] text-xs font-bold mb-4">See it happen</p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-gray-900">
            Precision you can see
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          {[
            { src: engraveProcessVid, label: 'The Engraving Process' },
            { src: engraveResultVid,  label: 'The Finished Result'   },
          ].map(({ src, label }) => (
            <div key={label} className="group flex flex-col gap-4">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 shadow-md">
                <video src={src} autoPlay loop muted playsInline className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
              </div>
              <p className="font-serif text-base font-medium text-gray-800 text-center">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. COIN SELECTOR ── */}
      <section className="pt-10 pb-16 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-[#D4527A] uppercase tracking-[0.18em] text-xs font-bold mb-4">Choose your base coin</p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-gray-900 mb-3">
              Pick a coin, then personalise it
            </h2>
            <p className="text-gray-500 text-sm">All coins are 10g, 925 sterling silver.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {coins.map((coin) => (
              <button
                key={coin.id}
                onClick={() => setSelectedCoin(coin)}
                className={`group relative rounded-2xl overflow-hidden border-2 transition-all duration-300 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4527A] ${
                  selectedCoin.id === coin.id
                    ? 'border-[#D4527A] shadow-lg shadow-pink-100'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="aspect-square overflow-hidden bg-gray-50">
                  <img
                    src={coin.img}
                    alt={coin.label}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-3 bg-white">
                  <p className="font-serif text-sm font-semibold text-gray-900">{coin.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">₹{coin.price.toLocaleString('en-IN')}</p>
                </div>
                {selectedCoin.id === coin.id && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-[#D4527A] rounded-full flex items-center justify-center">
                    <Check size={12} className="text-white" strokeWidth={3} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. UPLOAD + SIDEBAR ── */}
      <section id="upload" className="py-20 px-6 max-w-6xl mx-auto scroll-mt-20">
        <div className="text-center mb-14">
          <p className="text-[#D4527A] uppercase tracking-[0.18em] text-xs font-bold mb-4">Final step</p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-gray-900">Upload your design</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* Upload card */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-gray-100">

              {/* Selected coin summary */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 mb-8">
                <img src={selectedCoin.img} alt={selectedCoin.label} className="w-14 h-14 rounded-lg object-cover border border-gray-200" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-0.5">Selected coin</p>
                  <p className="font-serif font-semibold text-gray-900">{selectedCoin.label} · 10g Sterling Silver</p>
                </div>
                <a href="#" className="text-xs text-[#D4527A] font-semibold hover:underline whitespace-nowrap">Change</a>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !file && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all duration-200 ${
                  file
                    ? 'border-[#D4527A]/40 bg-pink-50/40 cursor-default'
                    : isDragging
                    ? 'border-[#D4527A] bg-pink-50/60 cursor-copy'
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100/80 hover:border-gray-300 cursor-pointer'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFileChange(e.target.files[0])}
                  accept=".png,.svg,.pdf"
                  className="hidden"
                />

                {file ? (
                  <div className="flex flex-col items-center w-full">
                    <div className="w-12 h-12 bg-[#D4527A]/10 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle size={24} className="text-[#D4527A]" strokeWidth={1.5} />
                    </div>
                    <p className="font-semibold text-gray-900 text-sm mb-1 max-w-xs truncate">{file.name}</p>
                    <p className="text-xs text-gray-400 mb-5">{(file.size / 1024 / 1024).toFixed(2)} MB · Ready to engrave</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFile(null); setFileError(''); }}
                      className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-lg"
                    >
                      <X size={12} /> Remove file
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <ImageIcon size={22} className="text-gray-400" strokeWidth={1.5} />
                    </div>
                    <p className="font-semibold text-gray-800 text-sm mb-1.5">
                      {isDragging ? 'Drop it here' : 'Click or drag file to upload'}
                    </p>
                    <p className="text-xs text-gray-400 max-w-xs leading-relaxed mb-5">
                      PNG, SVG, or PDF · High contrast, solid black/white · No gradients or photos
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {['Min 300 DPI', '1MB – 10MB', 'B&W only'].map((t) => (
                        <span key={t} className="text-[10px] font-bold uppercase tracking-wider bg-white px-2.5 py-1 rounded-md border border-gray-200 text-gray-500">{t}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* File error */}
              <AnimatePresence>
                {fileError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="mt-3 text-xs text-red-500 font-medium flex items-center gap-1.5"
                  >
                    <X size={12} /> {fileError}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Copyright checkbox */}
              <button
                onClick={() => setHasRights(!hasRights)}
                className="mt-8 flex items-start gap-3 text-left w-full group"
              >
                <div className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center mt-0.5 border transition-colors ${
                  hasRights ? 'bg-[#D4527A] border-[#D4527A]' : 'bg-white border-gray-300 group-hover:border-gray-400'
                }`}>
                  {hasRights && <Check size={11} className="text-white" strokeWidth={3} />}
                </div>
                <span className="text-xs text-gray-500 leading-relaxed">
                  I confirm I own the rights to this design and it does not contain copyrighted logos, trademarks, or protected artwork. I understand unauthorised designs will be rejected.
                </span>
              </button>

              {/* CTA */}
              <button
                onClick={handleAddToCart}
                disabled={!canSubmit}
                className={`w-full mt-8 py-4 rounded-xl flex items-center justify-center gap-2.5 font-bold text-sm transition-all duration-300 ${
                  canSubmit
                    ? 'bg-[#D4527A] hover:bg-[#B94B68] text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {canSubmit
                  ? <>Add to Cart · ₹{total.toLocaleString('en-IN')} <ArrowRight size={16} /></>
                  : 'Upload a design and confirm rights to continue'
                }
              </button>

              {canSubmit && (
                <p className="text-center text-xs text-gray-400 mt-3">
                  Includes ₹{ENGRAVING_FEE} engraving fee · Full refund if design can't be engraved
                </p>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="lg:col-span-5 flex flex-col gap-5 lg:sticky lg:top-24">

            {/* Pricing breakdown */}
            <div className="bg-[#1A1A1A] rounded-2xl p-6 md:p-8 text-white">
              <p className="text-xs uppercase tracking-widest text-white/40 font-bold mb-6">Order summary</p>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/70">{selectedCoin.label} silver coin</span>
                  <span className="text-sm font-semibold">₹{selectedCoin.price.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/70">Laser engraving</span>
                  <span className="text-sm font-semibold">₹{ENGRAVING_FEE}</span>
                </div>
                <div className="h-px bg-white/10" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-white">Total</span>
                  <span className="text-lg font-bold text-[#D4527A]">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="space-y-3 pt-2 border-t border-white/10">
                {[
                  { icon: Clock,       text: 'Reviewed by 6pm same business day' },
                  { icon: Sparkles,    text: 'Engraved next business day' },
                  { icon: Truck,       text: 'Dispatched in 2 business days' },
                  { icon: ShieldCheck, text: 'Full refund if design rejected twice' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-start gap-3 pt-3">
                    <Icon size={15} className="text-[#D4527A] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                    <span className="text-xs text-white/60 leading-relaxed">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Help card */}
            <div className="bg-[#FFF4F6] rounded-2xl p-6 md:p-8 border border-[#F1D8DE]">
              <h3 className="font-serif text-xl font-semibold text-gray-900 mb-1.5">Not sure about your design?</h3>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                Talk to us before you upload. We'll tell you if it'll engrave well and save you a rejection.
              </p>
              <div className="flex flex-col gap-3">
                <a
                  href="https://wa.me/919911773307"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1fba5a] text-white py-3 rounded-xl font-semibold text-sm transition-colors shadow-sm"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                  </svg>
                  Chat on WhatsApp
                </a>
                <a
                  href="#"
                  className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 py-3 rounded-xl font-semibold text-sm transition-colors shadow-sm"
                >
                  <Calendar size={15} /> Book a call
                </a>
              </div>
              <p className="text-center text-xs text-gray-400 mt-4">Mon–Sat · 11am–8pm</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. FAQ ── */}
      <section className="py-20 px-6 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#D4527A] uppercase tracking-[0.18em] text-xs font-bold mb-4">Got questions?</p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-gray-900">Frequently asked</h2>
          </div>
          <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
            {faqs.map((faq, i) => (
              <div key={i}>
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-serif text-base font-medium text-gray-900 pr-8">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`text-gray-400 flex-shrink-0 transition-transform duration-300 ${activeFaq === i ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. BOTTOM CTA STRIP ── */}
      <section className="py-16 px-6 bg-[#1A1A1A]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-white mb-4">
            Ready to create something permanent?
          </h2>
          <p className="text-white/50 text-sm mb-8">
            Every order is reviewed and engraved by hand. No templates. Just your design on real silver.
          </p>
          <a
            href="#upload"
            className="inline-flex items-center gap-2 bg-[#D4527A] hover:bg-[#B94B68] text-white px-8 py-4 rounded-xl font-semibold text-sm transition-all duration-300 hover:-translate-y-0.5 shadow-lg"
          >
            Upload your design <ArrowRight size={16} />
          </a>
        </div>
      </section>

    </div>
  );
}
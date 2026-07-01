import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Award, ChevronLeft, ChevronRight, Pause, Play, RotateCcw, Shield, Star, Truck, Gift } from 'lucide-react';
import MagneticButton from '../components/ui/MagneticButton';
import CircularGallery from '../components/ui/CircularGallery';
import { categories } from '../data/products';
import { useProducts } from '../context/ProductContext';
import { testimonials } from '../data/orders';
import heroLifestyle1 from '../assets/images/hero_lifestyle_1.png';
import heroLifestyle2 from '../assets/images/hero_lifestyle_2.png';
import heroLifestyle3 from '../assets/images/hero_lifestyle_3.png';
import heroLifestyle4 from '../assets/images/hero_lifestyle_4.png';
import heroLifestyle5 from '../assets/images/hero_lifestyle_5.png';
import storeVideo from '../assets/images/v1.mp4';
import v2 from '../assets/images/v2.mp4';
import v3 from '../assets/images/v3.mp4';
import v4 from '../assets/images/v4.mp4';
import c1 from '../assets/images/c1.jpeg';
import c2 from '../assets/images/c2.jpeg';
import c3 from '../assets/images/c3.jpeg';
import c4 from '../assets/images/c4.jpeg';
import c5 from '../assets/images/c5.jpeg';
import c6 from '../assets/images/c6.jpeg';
import promise1 from '../assets/images/promise_1.png';
import promise2 from '../assets/images/promise_2.png';
import promise3 from '../assets/images/promise_3.png';
import promise4 from '../assets/images/promise_4.png';
import weddingCampaign1 from '../assets/images/wedding_campaign_1.png';
import weddingCampaign2 from '../assets/images/wedding_campaign_2.png';
import productRing1 from '../assets/images/product_ring_1.png';
import productNecklace1 from '../assets/images/product_necklace_1.png';
import productEarring1 from '../assets/images/product_earring_1.png';
import productBangle1 from '../assets/images/product_bangle_1.png';

const occasions = [
  ['Everyday', 'everyday'],
  ['Wedding', 'wedding'],
  ['Festive', 'festivals'],
  ['Gifting', 'gifting'],
  ['Office', 'office'],
];

const promises = [
  { icon: Shield, title: '925 sterling silver', description: 'Authentic & hallmarked purity' },
  { icon: Award, title: 'Hallmarked and certified', description: 'Certified by the highest standards' },
  { icon: Truck, title: 'Free delivery above Rs. 1,999', description: 'Swift, secure & fully insured' },
  { icon: RotateCcw, title: '15-day exchange policy', description: 'Hassle-free process if you change your mind' },
];

const heroSlides = [
  {
    image: heroLifestyle1,
    alt: 'Woman wearing layered Sterling Kart silver necklaces and silver earrings',
    eyebrow: 'Made to be lived in',
    title: 'Silver jewellery, thoughtfully made.',
    description: 'Everyday pieces in hallmarked 925 sterling silver, designed to feel personal and easy to wear.',
  },
  {
    image: heroLifestyle2,
    alt: 'Woman wearing Sterling Kart silver jhumka earrings and a delicate silver bracelet',
    eyebrow: 'Artisan details',
    title: 'Tradition, with a lighter touch.',
    description: 'Discover handcrafted silver jewellery that brings a quiet glow to celebrations and everyday moments.',
  },
  {
    image: heroLifestyle3,
    alt: 'Woman wearing layered Sterling Kart silver chains and a silver ring by a window',
    eyebrow: 'Everyday layers',
    title: 'Silver that moves with you.',
    description: 'Layer delicate chains, pendants and rings made to settle naturally into your everyday style.',
  },
  {
    image: heroLifestyle4,
    alt: 'Woman wearing a Sterling Kart oxidized silver statement necklace and silver bangles',
    eyebrow: 'The festive edit',
    title: 'Make the moment unmistakably yours.',
    description: 'Statement silver with an heirloom mood, created for evenings that call for a little more presence.',
  },
  {
    image: heroLifestyle5,
    alt: 'Woman wearing a Sterling Kart silver pendant, silver bracelet and rings while holding a cup',
    eyebrow: 'Quiet luxury',
    title: 'Easy pieces for unhurried days.',
    description: 'Wearable silver jewellery that feels considered, comfortable and beautifully your own.',
  },
];

function StarRating({ rating, size = 13 }) {
  return (
    <div className="flex items-center gap-[2px]">
      {[1, 2, 3, 4, 5].map((index) => (
        <Star key={index} size={size} className={index <= Math.round(rating) ? 'fill-[#D9909F] text-[#D9909F]' : 'fill-[#E8E8E8] text-[#E8E8E8]'} />
      ))}
    </div>
  );
}

function CategorySlideCard({ category, slideIndex }) {
  return (
    <Link to={`/shop?category=${category.id}`} className="group flex flex-col items-center p-1.5 md:p-2">
      {/* Circular Image Container with Liquid Glass Ring */}
      <div className="relative aspect-square w-full max-w-[104px] sm:max-w-[120px] md:max-w-[150px] overflow-hidden rounded-full bg-bg-alt shadow-sm ring-[3px] ring-white/60 group-hover:ring-[#D4527A]/20 group-hover:shadow-[0_8px_30px_rgba(212,82,122,0.15)] transition-all duration-700 mb-3 md:mb-5">
        {/* Subtle glass overlay border */}
        <div className="absolute inset-0 rounded-full border border-white/40 z-10 pointer-events-none" />
        
        <div 
          className="absolute inset-0 h-full transition-transform duration-[1200ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
          style={{ width: '300%', transform: `translateX(-${(slideIndex * 100) / 3}%)` }}
        >
          <img 
            src={category.image} 
            alt={category.name} 
            className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.15]" 
            loading="lazy" 
          />
        </div>
      </div>

      {/* Typography */}
      <h3 className="font-serif text-[14px] sm:text-[16px] md:text-[20px] tracking-wide text-text-main group-hover:text-[#D4527A] transition-colors duration-300 text-center">
        {category.name}
      </h3>
      
      {/* Elegant slide indicators */}
      <div className="mt-3 flex gap-1.5 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity">
        {[0, 1, 2].map((idx) => (
          <div key={idx} className={`h-[2px] rounded-full transition-all duration-500 ${idx === slideIndex ? 'w-4 bg-[#D4527A]' : 'w-1.5 bg-[#A8A8A8]'}`} />
        ))}
      </div>
    </Link>
  );
}

function MinimalProductCard({ product }) {
  return (
    <Link to={`/product/${product.slug}`} className="group block overflow-hidden rounded-[14px] glass-card transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(212,82,122,0.15)] bg-white/40 md:rounded-[20px]">
      <div className="relative overflow-hidden aspect-[4/5] bg-transparent">
        {product.badge && <span className="absolute left-2 top-2 z-10 rounded-full glass-dark px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.8px] text-white shadow-sm md:left-3 md:top-3 md:px-3 md:py-1.5 md:text-[9px] md:tracking-[1px]">{product.badge}</span>}
        <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.1]" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
      <div className="p-2.5 text-center md:p-5">
        <h3 className="text-[12px] md:text-[16px] font-serif tracking-wide leading-tight text-text-main transition-colors group-hover:text-[#D4527A]">{product.name}</h3>
      </div>
    </Link>
  );
}

function MobileFloatingGift() {
  return (
    <motion.div
      initial={{ x: -120, opacity: 0 }}
      animate={{ 
        x: [-120, 0, 0, -120], 
        opacity: [0, 1, 1, 0] 
      }}
      transition={{ 
        duration: 6.5, 
        times: [0, 0.115, 0.885, 1], // ~0.75s slide in, 5 seconds stay, ~0.75s slide out
        repeat: Infinity,
        repeatDelay: 1.5, // 1.5 seconds wait before sliding back in
        ease: [0.25, 1, 0.5, 1] // Super smooth cubic bezier easing
      }}
      className="fixed bottom-24 left-0 z-50 md:hidden"
    >
      <Link 
        to="/gifting"
        className="group relative flex items-center justify-center overflow-hidden rounded-r-full border border-l-0 border-white/60 bg-gradient-to-r from-[#D4527A] to-[#B94B68] p-3.5 pr-4 pl-3.5 shadow-[0_12px_40px_-5px_rgba(212,82,122,0.6)] backdrop-blur-xl transition-transform active:scale-95"
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" />
        
        <motion.div
          animate={{ 
            rotate: [0, -12, 12, -12, 12, 0],
            scale: [1, 1.15, 1.15, 1.15, 1.15, 1]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 3,
            ease: "easeInOut"
          }}
          className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 shadow-inner backdrop-blur-sm cursor-pointer"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-[26px] h-[26px] text-white drop-shadow-md">
            <path d="M9.375 3a1.875 1.875 0 000 3.75h1.875v4.5H3.375A1.875 1.875 0 011.5 9.375v-.75c0-1.036.84-1.875 1.875-1.875h3.193A3.375 3.375 0 0112 2.753a3.375 3.375 0 015.432 3.997h3.193c1.036 0 1.875.84 1.875 1.875v.75c0 1.036-.84 1.875-1.875 1.875H12.75v-4.5h1.875a1.875 1.875 0 10-1.875-1.875V6.75h-1.5V4.875C11.25 3.839 10.41 3 9.375 3zM11.25 12.75H3v6.75a2.25 2.25 0 002.25 2.25h6v-9zM12.75 12.75v9h6a2.25 2.25 0 002.25-2.25v-6.75h-8.25z" />
          </svg>
        </motion.div>
      </Link>
    </motion.div>
  );
}

export default function HomePage() {
  const { products, isLoaded } = useProducts();
  const [email, setEmail] = useState('');
  const [heroIndex, setHeroIndex] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);
  const [isHeroHovered, setIsHeroHovered] = useState(false);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [testimonialCount, setTestimonialCount] = useState(3);
  const [categorySlideIndex, setCategorySlideIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  const heroRef = useRef(null);
  const collageRef = useRef(null);
  const categoryScrollRef = useRef(null);
  const favoritesScrollRef = useRef(null);
  const newArrivalsScrollRef = useRef(null);

  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroScroll, [0, 1], ["0%", "25%"]);

  const { scrollYProgress: collageScroll } = useScroll({ target: collageRef, offset: ["start end", "end start"] });
  const ySlow = useTransform(collageScroll, [0, 1], ["-10%", "10%"]);
  const yFast = useTransform(collageScroll, [0, 1], ["-20%", "20%"]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCategorySlideIndex((prev) => (prev + 1) % 3);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isHeroPaused || isHeroHovered) return undefined;

    const timer = window.setInterval(() => {
      setHeroIndex((currentIndex) => (currentIndex + 1) % heroSlides.length);
    }, 3500);

    return () => window.clearInterval(timer);
  }, [isHeroHovered, isHeroPaused]);

  useEffect(() => {
    const nextSlideImage = new window.Image();
    nextSlideImage.src = heroSlides[(heroIndex + 1) % heroSlides.length].image;
  }, [heroIndex]);

  useEffect(() => {
    const updateCount = () => {
      setTestimonialCount(window.innerWidth < 768 ? 1 : 3);
      setIsMobile(window.innerWidth < 768);
    };
    updateCount();
    window.addEventListener('resize', updateCount);
    return () => window.removeEventListener('resize', updateCount);
  }, []);

  const scrollCategoryLeft = () => {
    if (categoryScrollRef.current) categoryScrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
  };
  const scrollCategoryRight = () => {
    if (categoryScrollRef.current) categoryScrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
  };

  const scrollFavoritesLeft = () => {
    if (favoritesScrollRef.current) favoritesScrollRef.current.scrollBy({ left: -350, behavior: 'smooth' });
  };
  const scrollFavoritesRight = () => {
    if (favoritesScrollRef.current) favoritesScrollRef.current.scrollBy({ left: 350, behavior: 'smooth' });
  };

  const scrollNewArrivalsLeft = () => {
    if (newArrivalsScrollRef.current) newArrivalsScrollRef.current.scrollBy({ left: -350, behavior: 'smooth' });
  };
  const scrollNewArrivalsRight = () => {
    if (newArrivalsScrollRef.current) newArrivalsScrollRef.current.scrollBy({ left: 350, behavior: 'smooth' });
  };

  const bestsellers = products
    .filter((product) => product.badge === 'Bestseller' || product.rating >= 4.6)
    .slice(0, 12);
  const newArrivals = products
    .filter((product) => product.badge === 'New' || product.isNew)
    .slice(0, 12);
  const activeHeroSlide = heroSlides[heroIndex];
  const visibleTestimonials = testimonials.slice(testimonialIndex, testimonialIndex + testimonialCount);
  const maxIndex = Math.max(0, testimonials.length - testimonialCount);

  const showPreviousHero = () => setHeroIndex((currentIndex) => (currentIndex - 1 + heroSlides.length) % heroSlides.length);
  const showNextHero = () => setHeroIndex((currentIndex) => (currentIndex + 1) % heroSlides.length);

  const handleSubscribe = (event) => {
    event.preventDefault();
    setEmail('');
  };

  return (
    <div className="overflow-x-hidden bg-bg-primary bg-pattern-diamond">
      <section
        ref={heroRef}
        className="relative isolate flex h-[345px] min-h-0 items-end overflow-hidden bg-bg-alt sm:h-[420px] md:h-auto md:min-h-[100vh] md:items-center"
        aria-label="Sterling Kart jewellery collections"
        aria-roledescription="carousel"
        onMouseEnter={() => setIsHeroHovered(true)}
        onMouseLeave={() => setIsHeroHovered(false)}
        onFocus={() => setIsHeroHovered(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setIsHeroHovered(false);
        }}
      >
        <AnimatePresence initial={false}>
          <motion.img
            key={activeHeroSlide.image}
            src={activeHeroSlide.image}
            alt={activeHeroSlide.alt}
            className="absolute inset-0 h-full w-full object-cover object-center sm:object-center"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1.02 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: 'easeOut' }}
            style={{ y: heroY }}
          />
        </AnimatePresence>

        {/* Cinematic gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent md:from-black/70 md:via-black/30 md:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/10 md:from-black/60 md:via-transparent md:to-black/20" />

        {/* Bottom-right watermark */}
        <div className="absolute bottom-8 right-8 z-10 hidden md:block text-right pointer-events-none">
          <p className="brand-wordmark text-[13px] text-white/30">STERLING KART</p>
          <p className="brand-submark mt-1 text-[8px] text-white/20">925 SILVER JEWELS</p>
        </div>

        {/* Hero content — floats freely over the image */}
        <div className="relative z-10 mx-auto w-full max-w-[1320px] px-4 pb-14 pt-20 sm:px-6 sm:pb-16 sm:pt-28 md:px-10 md:pb-28 md:pt-[190px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={heroIndex}
              className="max-w-[260px] sm:max-w-[430px] md:max-w-[580px]"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
              aria-live="polite"
            >
              {/* Eyebrow */}
              <motion.p
                initial={{ opacity: 0, letterSpacing: '0.1em' }}
                animate={{ opacity: 1, letterSpacing: '0.24em' }}
                transition={{ duration: 0.9, ease: 'easeOut', delay: 0.05 }}
                className="mb-2 text-[8px] font-semibold uppercase text-white/75 tracking-[0.2em] drop-shadow-md sm:text-[9px] md:mb-5 md:text-[10px] md:tracking-[0.35em]"
              >
                {activeHeroSlide.eyebrow}
              </motion.p>

              {/* Thin decorative line */}
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 48, opacity: 1 }}
                transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
                className="mb-3 h-[1px] bg-gradient-to-r from-white/60 to-transparent md:mb-6"
              />

              {/* Title */}
              <h1
                className="font-serif text-[24px] leading-[1.08] text-white sm:text-[34px] md:text-[64px]"
                style={{ textShadow: '0 2px 30px rgba(0,0,0,0.5)' }}
              >
                {activeHeroSlide.title}
              </h1>

              {/* Description */}
              <p
                className="mt-2 max-w-[240px] text-[10px] leading-relaxed text-white/80 sm:mt-3 sm:max-w-[340px] sm:text-[12px] md:mt-6 md:max-w-[400px] md:text-[15px] md:text-white/65"
                style={{ textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}
              >
                {activeHeroSlide.description}
              </p>

              {/* CTA buttons */}
              <div className="mt-4 flex flex-row items-center gap-2 sm:gap-3 md:mt-9">
                <MagneticButton>
                  <Link
                    to="/shop"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-[9px] font-bold uppercase tracking-[1px] text-[#1A1A1A] shadow-[0_4px_24px_rgba(0,0,0,0.3)] transition-all hover:bg-white/90 hover:shadow-[0_6px_30px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 sm:px-5 sm:py-2.5 sm:text-[10px] md:px-8 md:py-3.5 md:text-[11px] md:tracking-[2px]"
                  >
                    Shop the collection
                  </Link>
                </MagneticButton>
                <MagneticButton>
                  <Link
                    to="/shop?badge=New"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-2 text-[9px] font-bold uppercase tracking-[1px] text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:border-white/60 hover:-translate-y-0.5 sm:px-5 sm:py-2.5 sm:text-[10px] md:px-8 md:py-3.5 md:text-[11px] md:tracking-[2px]"
                  >
                    New arrivals
                  </Link>
                </MagneticButton>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Prev/Next arrows — dark glass style */}
        <button
          type="button"
          onClick={showPreviousHero}
          className="absolute left-3 top-[56%] z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur-md shadow-lg transition-all hover:bg-black/45 hover:border-white/40 hover:scale-105 focus:outline-none md:left-7 md:top-1/2 md:flex md:h-11 md:w-11"
          aria-label="Show previous hero image"
        >
          <ChevronLeft size={20} strokeWidth={1.5} />
        </button>
        <button
          type="button"
          onClick={showNextHero}
          className="absolute right-3 top-[56%] z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur-md shadow-lg transition-all hover:bg-black/45 hover:border-white/40 hover:scale-105 focus:outline-none md:right-7 md:top-1/2 md:flex md:h-11 md:w-11"
          aria-label="Show next hero image"
        >
          <ChevronRight size={20} strokeWidth={1.5} />
        </button>

        {/* Slide indicators + play/pause — bottom-center, dark glass */}
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/15 bg-black/25 px-2.5 py-1.5 shadow-[0_6px_18px_rgba(0,0,0,0.22)] backdrop-blur-xl md:bottom-7 md:gap-2.5 md:px-4 md:py-2">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.image}
              type="button"
              onClick={() => setHeroIndex(index)}
              className={`rounded-full transition-all duration-500 ${
                index === heroIndex
                  ? 'h-[2px] w-5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.45)] md:h-[3px] md:w-8'
                  : 'h-[2px] w-2 bg-white/35 hover:bg-white/65 md:h-[3px] md:w-3'
              }`}
              aria-label={`Show hero image ${index + 1}`}
              aria-current={index === heroIndex ? 'true' : undefined}
            />
          ))}
          <div className="mx-0.5 h-2.5 w-[1px] bg-white/15 md:mx-1 md:h-3.5" />
          <button
            type="button"
            onClick={() => setIsHeroPaused((isPaused) => !isPaused)}
            className="flex h-5 w-5 items-center justify-center rounded-full text-white/65 transition hover:bg-white/10 hover:text-white focus:outline-none md:h-6 md:w-6"
            aria-label={isHeroPaused ? 'Play hero slideshow' : 'Pause hero slideshow'}
          >
            {isHeroPaused ? <Play size={8} fill="currentColor" className="md:size-[10px]" /> : <Pause size={8} fill="currentColor" className="md:size-[10px]" />}
          </button>
        </div>

        {/* Slide counter — bottom right */}
        <div className="absolute bottom-8 left-6 z-20 hidden md:flex items-center gap-2 pointer-events-none md:left-10">
          <span className="font-serif text-[22px] text-white/80 leading-none">{String(heroIndex + 1).padStart(2, '0')}</span>
          <div className="w-8 h-[1px] bg-white/30" />
          <span className="text-[11px] text-white/30 font-medium">{String(heroSlides.length).padStart(2, '0')}</span>
        </div>
      </section>

      <section className="bg-bg-surface px-4 pt-6 pb-5 md:pt-16 md:pb-10 md:px-8 lg:pt-20 lg:pb-12 bg-pattern-diamond relative">
        <SectionHeading eyebrow="Find your favourites" title="Shop by category" />
        
        <div className="relative max-w-[1320px] mx-auto group">
          <button 
            onClick={scrollCategoryLeft} 
            className="absolute left-0 top-[73px] md:top-[83px] -translate-y-1/2 -ml-2 md:-ml-5 z-10 w-9 h-9 md:w-11 md:h-11 bg-white/80 backdrop-blur-sm border border-[#EEE8E5] rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.1)] flex items-center justify-center text-[#D4527A] hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft size={22} strokeWidth={1.5} />
          </button>
          
          <div ref={categoryScrollRef} className="flex gap-1.5 md:gap-4 overflow-x-auto snap-x snap-mandatory pb-5 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] justify-start md:justify-center">
            {categories.map((category) => (
              <div key={category.id} className="min-w-[108px] sm:min-w-[130px] md:min-w-[170px] lg:min-w-[190px] snap-start shrink-0">
                <CategorySlideCard category={category} slideIndex={categorySlideIndex} />
              </div>
            ))}
          </div>

          <button 
            onClick={scrollCategoryRight} 
            className="absolute right-0 top-[73px] md:top-[83px] -translate-y-1/2 -mr-2 md:-mr-5 z-10 w-9 h-9 md:w-11 md:h-11 bg-white/80 backdrop-blur-sm border border-[#EEE8E5] rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.1)] flex items-center justify-center text-[#D4527A] hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronRight size={22} strokeWidth={1.5} />
          </button>
        </div>
        <div className="mx-auto mt-5 flex max-w-[1320px] flex-wrap items-center justify-center gap-1.5 md:mt-9 md:gap-2">
          <span className="mr-1 text-[10px] font-semibold uppercase tracking-[1px] text-text-muted md:mr-2 md:text-[12px] md:tracking-[1.2px]">Shop for</span>
          {occasions.map(([name, id]) => <Link key={id} to={`/shop?occasion=${id}`} className="rounded-full border border-border-main bg-bg-primary px-3 py-1.5 text-[11px] font-medium text-text-muted transition-colors hover:border-[#D9909F] hover:text-[#B94B68] md:px-4 md:py-2 md:text-[12px]">{name}</Link>)}
        </div>
      </section>

      {/* Wedding Collection Section */}
      <section className="bg-bg-surface px-4 pt-8 pb-12 md:px-5 md:pt-12 md:pb-24 bg-pattern-diamond border-t border-[#EEE8E5]">
        <div className="mx-auto max-w-[1320px]">
          <div className="flex items-center justify-center gap-3 mb-8 md:gap-4 md:mb-12">
            <div className="h-[1px] w-8 md:w-24 bg-[#1FA8A1]/40" />
            <h2 className="font-serif text-[20px] md:text-[32px] tracking-[1.2px] md:tracking-[2px] uppercase text-[#1FA8A1]">Wedding Collection</h2>
            <div className="h-[1px] w-8 md:w-24 bg-[#1FA8A1]/40" />
          </div>

          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [-ms-overflow-style:none] md:mx-0 md:grid md:grid-cols-2 md:gap-8 md:overflow-visible md:px-0 md:pb-0 lg:gap-12 [&::-webkit-scrollbar]:hidden">
            {/* Card 1 */}
            <div className="flex w-[78vw] max-w-[290px] shrink-0 snap-start flex-col items-center md:w-auto md:max-w-none">
              <div className="relative w-full aspect-[4/3] group">
                <div className="absolute inset-0 rounded-[16px] overflow-hidden shadow-lg">
                  <img src={weddingCampaign1} alt="Rhiwayat Bridal" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <h3 className="absolute bottom-14 right-4 text-right font-serif text-[20px] leading-[1.1] tracking-wide text-white drop-shadow-md md:bottom-28 md:right-8 md:text-[40px]">
                    RHIWAYAT<br />BRIDAL
                  </h3>
                </div>
                
                {/* Product Thumbnails */}
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex items-end justify-center gap-2 w-full px-3 z-10 md:-bottom-6 md:gap-3 md:px-4">
                  {[productNecklace1, productEarring1, productBangle1].map((img, i) => (
                    <div key={i} className="w-[54px] h-[54px] rounded-lg bg-[#1A1A1A] border border-white/20 p-1 shadow-xl overflow-hidden transition-transform hover:-translate-y-2 cursor-pointer md:h-[100px] md:w-[100px] md:rounded-xl">
                      <img src={img} alt="Product Thumbnail" className="w-full h-full object-cover rounded-lg" />
                    </div>
                  ))}
                </div>
              </div>
              <Link to="/shop?collection=rhiwayat-bridal" className="mt-8 md:mt-14 inline-flex items-center gap-2 bg-[#1FA8A1] text-white px-6 py-2.5 md:px-8 md:py-3 rounded-md text-[12px] md:text-[13px] font-medium tracking-wide hover:bg-[#178f89] transition-colors shadow-md relative z-20">
                View Full Collection <ArrowRight size={16} />
              </Link>
            </div>

            {/* Card 2 */}
            <div className="flex w-[78vw] max-w-[290px] shrink-0 snap-start flex-col items-center md:mt-0 md:w-auto md:max-w-none">
              <div className="relative w-full aspect-[4/3] group">
                <div className="absolute inset-0 rounded-[16px] overflow-hidden shadow-lg">
                  <img src={weddingCampaign2} alt="Sakhi Kutumbh" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <h3 className="absolute bottom-14 right-4 text-right font-serif text-[20px] leading-[1.1] tracking-wide text-white drop-shadow-md md:bottom-28 md:right-8 md:text-[40px]">
                    SAKHI<br />KUTUMBH
                  </h3>
                </div>
                
                {/* Product Thumbnails */}
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex items-end justify-center gap-2 w-full px-3 z-10 md:-bottom-6 md:gap-3 md:px-4">
                  {[productRing1, productNecklace1, productEarring1].map((img, i) => (
                    <div key={i} className="w-[54px] h-[54px] rounded-lg bg-[#FAF6F3] border border-[#D9D0C8] p-1 shadow-xl overflow-hidden transition-transform hover:-translate-y-2 cursor-pointer md:h-[100px] md:w-[100px] md:rounded-xl">
                      <img src={img} alt="Product Thumbnail" className="w-full h-full object-contain rounded-lg" />
                    </div>
                  ))}
                </div>
              </div>
              <Link to="/shop?collection=sakhi-kutumbh" className="mt-8 md:mt-14 inline-flex items-center gap-2 bg-[#1FA8A1] text-white px-6 py-2.5 md:px-8 md:py-3 rounded-md text-[12px] md:text-[13px] font-medium tracking-wide hover:bg-[#178f89] transition-colors shadow-md relative z-20">
                View Full Collection <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#EEE8E5] bg-[#F7E1E8] px-4 py-8 md:px-8 md:py-20 bg-pattern-diamond">
        <SectionHeading eyebrow="Most loved" title="Customer favourites" />
        
        <div className="relative max-w-[1320px] mx-auto group">
          <button 
            onClick={scrollFavoritesLeft} 
            className="absolute left-0 top-[40%] md:top-[45%] -translate-y-1/2 -ml-2 md:-ml-5 z-10 w-9 h-9 md:w-11 md:h-11 bg-white/80 backdrop-blur-sm border border-[#EEE8E5] rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.1)] flex items-center justify-center text-[#D4527A] hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft size={22} strokeWidth={1.5} />
          </button>
          
          <div ref={favoritesScrollRef} className="flex gap-3 md:gap-5 overflow-x-auto snap-x snap-mandatory pb-5 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {bestsellers.map((product) => (
              <div key={product.id} className="w-[42vw] max-w-[150px] sm:w-[170px] sm:max-w-none md:w-[calc(33.333%-14px)] lg:w-[calc(20%-16px)] snap-start shrink-0">
                <MinimalProductCard product={product} />
              </div>
            ))}
          </div>

          <button 
            onClick={scrollFavoritesRight} 
            className="absolute right-0 top-[40%] md:top-[45%] -translate-y-1/2 -mr-2 md:-mr-5 z-10 w-9 h-9 md:w-11 md:h-11 bg-white/80 backdrop-blur-sm border border-[#EEE8E5] rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.1)] flex items-center justify-center text-[#D4527A] hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronRight size={22} strokeWidth={1.5} />
          </button>
        </div>
        <div className="mt-5 text-center md:mt-9"><Link to="/shop" className="btn-secondary">View all jewellery</Link></div>
      </section>

      <section className="bg-bg-surface px-3 py-6 md:px-8 md:py-8 bg-pattern-diamond">
        <div className="mx-auto max-w-[1100px]">
          <div className="relative overflow-hidden rounded-[24px] md:rounded-[32px] bg-white border border-[#F4A0B0]/30 shadow-[0_10px_40px_rgba(212,82,122,0.06)] px-2 py-6 md:px-10 md:py-10">
            <div className="pointer-events-none absolute top-0 right-0 h-40 w-40 rounded-full bg-gradient-to-br from-[#FFF0F5] to-transparent blur-[60px]" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 rounded-full bg-gradient-to-tr from-[#FFF0F5] to-transparent blur-[60px]" />
            
            <div className="relative z-10 grid grid-cols-4 gap-x-2 md:gap-x-8 divide-x-0 md:divide-x divide-[#F4A0B0]/20">
              {promises.map((promise, idx) => {
                const Icon = promise.icon;
                return (
                  <div key={idx} className="flex flex-col items-center text-center group px-1 sm:px-2 md:px-5">
                    <div className="flex h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#FFF0F5] to-[#FDF5F8] border border-[#F4A0B0]/20 shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:shadow-[0_8px_30px_rgba(212,82,122,0.15)] mb-2.5 md:mb-4">
                      <Icon className="text-[#D4527A] size-[18px] md:size-[24px]" strokeWidth={1.5} />
                    </div>
                    <h3 className="font-serif text-[9px] min-[400px]:text-[10px] md:text-[15px] font-medium text-text-main leading-[1.2] mb-1.5 md:mb-2 tracking-[0.2px] max-w-[80px] sm:max-w-none mx-auto break-words">
                      {promise.title}
                    </h3>
                    <p className="text-[11px] text-text-muted leading-relaxed hidden sm:block">
                      {promise.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#EEE8E5] bg-[#F7E1E8] px-4 pt-6 pb-8 md:px-8 md:pt-10 md:pb-20 bg-pattern-diamond">
        <SectionHeading eyebrow="Just dropped" title="New arrivals" />
        
        <div className="relative max-w-[1320px] mx-auto group">
          <button 
            onClick={scrollNewArrivalsLeft} 
            className="absolute left-0 top-[40%] md:top-[45%] -translate-y-1/2 -ml-2 md:-ml-5 z-10 w-9 h-9 md:w-11 md:h-11 bg-white/80 backdrop-blur-sm border border-[#EEE8E5] rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.1)] flex items-center justify-center text-[#D4527A] hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft size={22} strokeWidth={1.5} />
          </button>
          
          <div ref={newArrivalsScrollRef} className="flex gap-3 md:gap-5 overflow-x-auto snap-x snap-mandatory pb-5 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {newArrivals.map((product) => (
              <div key={product.id} className="w-[42vw] max-w-[150px] sm:w-[170px] sm:max-w-none md:w-[calc(33.333%-14px)] lg:w-[calc(20%-16px)] snap-start shrink-0">
                <MinimalProductCard product={product} />
              </div>
            ))}
          </div>

          <button 
            onClick={scrollNewArrivalsRight} 
            className="absolute right-0 top-[40%] md:top-[45%] -translate-y-1/2 -mr-2 md:-mr-5 z-10 w-9 h-9 md:w-11 md:h-11 bg-white/80 backdrop-blur-sm border border-[#EEE8E5] rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.1)] flex items-center justify-center text-[#D4527A] hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronRight size={22} strokeWidth={1.5} />
          </button>
        </div>
        <div className="mt-5 text-center md:mt-9"><Link to="/shop?badge=New" className="btn-secondary">View all new arrivals</Link></div>
      </section>

      {/* Curated Collage Section */}
      <section className="bg-bg-surface px-4 py-8 md:px-8 md:py-24 relative overflow-hidden bg-pattern-diamond" ref={collageRef}>
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-pink-100/40 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-slate-100/60 rounded-full blur-[100px] translate-x-1/3 pointer-events-none" />
        
        <div className="mx-auto max-w-[1320px] relative z-10">
          <SectionHeading eyebrow="The Edit" title="Curated for you" align="center" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-6 mt-6 md:mt-12 auto-rows-[92px] sm:auto-rows-[120px] md:auto-rows-[300px]">
            
            <div className="col-span-2 row-span-2 relative group overflow-hidden rounded-[12px] md:rounded-[24px] bg-bg-alt shadow-sm">
              <motion.img style={{ y: ySlow, scale: 1.2 }} src={c1} alt="Curated style 1" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.25]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-80" />
              <div className="absolute bottom-2 left-2 right-2 glass-dark rounded-lg p-2 text-white transition-all duration-500 md:bottom-6 md:left-6 md:right-6 md:translate-y-4 md:rounded-2xl md:p-6 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 border-white/20">
                <span className="text-[7px] font-semibold uppercase tracking-[1px] text-white/80 md:text-[11px] md:tracking-[3px]">Signature Series</span>
                <h3 className="text-[13px] font-serif mt-0.5 md:mt-2 md:mb-1 md:text-[28px]">Elegance Defined</h3>
                <p className="hidden text-[13px] text-white/70 max-w-[80%] md:block">Discover pieces that elevate your everyday presence.</p>
              </div>
            </div>

            <div className="col-span-1 row-span-1 relative group overflow-hidden rounded-[12px] md:rounded-[24px] bg-bg-alt shadow-sm">
              <motion.img style={{ y: yFast, scale: 1.2 }} src={c2} alt="Curated style 2" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.25]" />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-500" />
            </div>

            <div className="col-span-1 row-span-2 relative group overflow-hidden rounded-[12px] md:rounded-[24px] bg-bg-alt shadow-sm">
              <motion.img style={{ y: ySlow, scale: 1.2 }} src={c3} alt="Curated style 3" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.25]" />
            </div>

            <div className="col-span-1 row-span-1 relative group overflow-hidden rounded-[12px] md:rounded-[24px] bg-bg-alt shadow-sm">
              <motion.img style={{ y: yFast, scale: 1.2 }} src={c4} alt="Curated style 4" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.25]" />
              <div className="absolute inset-0 glass-dark opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center border-none">
                <span className="text-white font-serif text-[12px] md:text-[20px] tracking-wide drop-shadow-md">Details</span>
              </div>
            </div>

            <div className="col-span-2 relative group overflow-hidden rounded-[12px] md:rounded-[24px] bg-bg-alt shadow-sm">
              <motion.img style={{ y: ySlow, scale: 1.2 }} src={c5} alt="Curated style 5" className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-[1200ms] group-hover:scale-[1.25]" />
            </div>

            <div className="col-span-2 relative group overflow-hidden rounded-[12px] md:rounded-[24px] bg-bg-alt shadow-sm">
              <motion.img style={{ y: yFast, scale: 1.2 }} src={c6} alt="Curated style 6" className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-[1200ms] group-hover:scale-[1.25]" />
              <div className="absolute inset-0 flex flex-col items-center justify-center glass-dark opacity-0 group-hover:opacity-100 transition-all duration-500 border-none">
                <span className="text-white font-serif text-[13px] md:text-[26px]">Modern Classics</span>
                <MagneticButton className="mt-2 md:mt-4">
                  <Link to="/shop" className="inline-block text-[9px] font-semibold uppercase tracking-[1px] text-white border-b border-white/50 pb-0.5 hover:text-white hover:border-white transition-all md:text-[11px] md:tracking-[2px] md:pb-1">Shop The Look</Link>
                </MagneticButton>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Influencer Spotlight / Circular Gallery Section */}
      <section className="bg-black px-0 py-10 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,82,122,0.15)_0%,transparent_70%)]" />
        
        <div className="mx-auto max-w-[1320px] px-5 md:px-8 relative z-10 mb-0 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[2px] text-[#F4A0B0] mb-2">Influencer Spotlight</p>
          <h2 className="font-serif text-[28px] leading-tight text-white md:text-[40px] mb-4">
            Trusted by Creators, Loved by Customers
          </h2>
          <p className="mx-auto max-w-2xl text-[14px] text-white/60 leading-relaxed">
            See how influencers and jewellery enthusiasts style Sterling Kart's handcrafted sterling silver collections in real life. Swipe to explore.
          </p>
        </div>

        <div className="relative z-10 -mt-12 h-[240px] w-full md:-mt-8 md:h-[600px]">
          <CircularGallery 
            videos={[v4, storeVideo, v2, v3]}
            bend={0.06}
            itemWidth={isMobile ? 2.5 : 4}
            itemHeight={isMobile ? 4.4 : 7}
            gap={isMobile ? 0.3 : 0.4}
          />
        </div>
      </section>

      <section className="group relative h-[520px] w-full overflow-hidden md:h-[600px]">
        <video 
          src={storeVideo} 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[10s] group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-black/20 transition-colors duration-500 group-hover:bg-black/10" />
        
        {/* Top Left Watermark */}
        <div className="absolute top-6 left-6 z-10 pointer-events-none opacity-60 md:top-8 md:left-10">
          <span className="brand-wordmark text-xl text-white md:text-2xl">STERLING KART</span>
        </div>

        <div className="absolute inset-0 flex items-end justify-end p-4 pb-8 md:items-center md:p-16 lg:pr-24">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-[480px] rounded-2xl border border-white/20 bg-black/35 p-5 text-left backdrop-blur-md md:p-12"
          >
            <h2 className="font-serif text-[28px] leading-tight text-white md:text-[46px]">Find the store</h2>
            <div className="mt-4 h-[1px] w-12 bg-bg-surface/40 md:mt-6" />
            <p className="mt-4 text-[12px] leading-relaxed tracking-wide text-white/90 md:mt-6 md:text-[15px]">
              Step into the world of Sterling Kart. Discover our latest collections, experience our craftsmanship up close, and enjoy personal styling sessions with our experts.
              <br/><br/>
              <strong className="text-white font-medium uppercase tracking-wider text-[13px]">Flagship Store</strong><br/>
              Roorkee, Uttarakhand 247667
            </p>
            <a href="#store-locator" className="mt-5 inline-block border border-white/60 bg-transparent px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[1.2px] text-white transition-all hover:bg-bg-surface hover:text-black md:mt-8 md:px-8 md:py-3 md:text-[12px] md:tracking-[1.5px]">
              Get Directions
            </a>
          </motion.div>
        </div>
      </section>

      <section className="bg-bg-alt px-4 pt-10 pb-6 md:px-8 md:pt-20 md:pb-8 relative overflow-hidden bg-pattern-diamond">
        <div className="mx-auto max-w-[1320px] relative z-10">
          <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
            <SectionHeading eyebrow="Kind words" title="Loved by our customers" align="left" />
            <div className="flex gap-3 mb-2">
              <button onClick={() => setTestimonialIndex(Math.max(0, testimonialIndex - 1))} disabled={testimonialIndex === 0} className="flex h-12 w-12 items-center justify-center rounded-full glass text-text-main shadow-sm disabled:opacity-40 transition-all hover:scale-105 hover:bg-white"><ChevronLeft size={20} strokeWidth={1.5} /></button>
              <button onClick={() => setTestimonialIndex(Math.min(maxIndex, testimonialIndex + 1))} disabled={testimonialIndex === maxIndex} className="flex h-12 w-12 items-center justify-center rounded-full glass text-text-main shadow-sm disabled:opacity-40 transition-all hover:scale-105 hover:bg-white"><ChevronRight size={20} strokeWidth={1.5} /></button>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {visibleTestimonials.map((testimonial) => (
              <article key={testimonial.id} className="rounded-[18px] glass-card p-5 transition-transform duration-500 hover:-translate-y-1 md:rounded-[24px] md:p-8">
                <StarRating rating={testimonial.rating} size={14} />
                <p className="mt-4 text-[13px] leading-relaxed text-text-main font-serif italic tracking-wide md:mt-6 md:text-[15px]">"{testimonial.text}"</p>
                <div className="mt-6 flex items-center gap-3 md:mt-8 md:gap-4">
                  <div className="h-11 w-11 rounded-full bg-[#E8DDD5] flex items-center justify-center text-[13px] font-serif text-text-main">{testimonial.name.charAt(0)}</div>
                  <div>
                    <p className="text-[13px] font-semibold text-text-main uppercase tracking-widest">{testimonial.name}</p>
                    <p className="text-[11px] text-text-muted tracking-wide mt-0.5">{testimonial.city}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-4 pt-6 pb-12 md:px-8 md:pt-10 md:pb-24 text-text-main overflow-hidden bg-bg-surface bg-pattern-diamond">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(244,160,176,0.1)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(232,221,213,0.3)_0%,transparent_50%)]" />
        
        <div className="relative z-10 mx-auto flex max-w-[1040px] flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left glass-panel p-6 md:p-14 rounded-[24px] md:rounded-[40px] border-white/60 shadow-xl">
          <div className="max-w-[420px]">
            <p className="text-[11px] font-semibold uppercase tracking-[3px] text-[#B94B68]">A little something extra</p>
            <h2 className="mt-3 font-serif text-[28px] leading-[1.1] md:text-[38px]">Get 10% off your first order.</h2>
            <p className="mt-3 text-[13px] text-text-muted leading-relaxed md:mt-4 md:text-[15px]">Join our inner circle for new launches, thoughtful offers, and exclusive early access.</p>
          </div>
          <form onSubmit={handleSubscribe} className="flex w-full max-w-[420px] flex-col gap-2 rounded-[20px] glass bg-white/70 p-2 shadow-sm border border-white sm:flex-row sm:rounded-full sm:gap-0">
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required placeholder="Your email address" className="min-w-0 flex-1 bg-transparent border-0 px-4 py-3 text-[13px] text-text-main outline-none placeholder:text-text-muted/60 sm:px-6 sm:py-0 md:text-[14px]" />
            <button className="rounded-full bg-[#1A1A1A] px-6 py-3 text-[10px] font-bold uppercase tracking-[1px] text-white hover:bg-[#2A2A2A] transition-all hover:scale-[1.02] md:px-7 md:py-4 md:text-[11px]">Subscribe</button>
          </form>
        </div>
      </section>
      
      <MobileFloatingGift />
    </div>
  );
}

function SectionHeading({ eyebrow, title, align = 'center' }) {
  return (
    <div className={`mb-6 md:mb-9 ${align === 'left' ? 'text-left' : 'text-center'}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[1.5px] text-[#B94B68] md:text-[11px] md:tracking-[2px]">{eyebrow}</p>
      <h2 className="mt-2 font-serif text-[28px] leading-tight text-text-main md:text-[40px]">{title}</h2>
      {align === 'left' && <Link to="/shop" className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold uppercase tracking-[0.7px] text-[#B94B68]">Browse all <ArrowRight size={14} /></Link>}
    </div>
  );
}

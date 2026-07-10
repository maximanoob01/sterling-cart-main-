import { useEffect, useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Award, ChevronLeft, ChevronRight, Pause, Play, RotateCcw, Shield, Star, Truck, Gift, Crown, Heart, Quote, Sparkles, Box, Mail, ShieldCheck } from 'lucide-react';
import MagneticButton from '../components/ui/MagneticButton';
import CircularGallery from '../components/ui/CircularGallery';
import LazyLoad from '../components/ui/LazyLoad';
import GiftCardPromo from '../components/home/GiftCardPromo';
import SEO from '../components/seo/SEO';
import { categories } from '../data/products';
import { useProducts } from '../context/ProductContext';
import { testimonials } from '../data/orders';
import api from '../services/api';
import image1 from '../assets/images/image.webp';
import image2 from '../assets/images/image copy.webp';
import image3 from '../assets/images/image copy 2.webp';
import image4 from '../assets/images/image copy 3.webp';
import image5 from '../assets/images/image copy 4.webp';
import storeVideo from '../assets/images/v1.mp4';
import v2 from '../assets/images/v2.mp4';
import v3 from '../assets/images/v3.mp4';
import v4 from '../assets/images/v4.mp4';
import c1 from '../assets/images/c1.webp';
import c2 from '../assets/images/c2.webp';
import c3 from '../assets/images/c3.webp';
import c4 from '../assets/images/c4.webp';
import c5 from '../assets/images/c5.webp';
import c6 from '../assets/images/c6.webp';
import promise1 from '../assets/images/promise_1.webp';
import promise2 from '../assets/images/promise_2.webp';
import newsletterBg from '../assets/images/newsletter-bg.png';
import promise3 from '../assets/images/promise_3.webp';
import promise4 from '../assets/images/promise_4.webp';
import weddingCampaign1 from '../assets/images/wedding_campaign_1.webp';
import weddingCampaign2 from '../assets/images/wedding_campaign_2.webp';
import productRing1 from '../assets/images/product_ring_1.webp';
import productNecklace1 from '../assets/images/product_necklace_1.webp';
import productEarring1 from '../assets/images/product_earring_1.webp';
import productBangle1 from '../assets/images/product_bangle_1.webp';

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
    image: image1,
    alt: 'Sterling Kart premium silver jewelry collection',
    eyebrow: 'The New Era',
    title: 'Elegance Redefined.',
    description: 'Discover our latest collection of premium silver pieces that speak to your inner radiance.',
  },
  {
    image: image2,
    alt: 'Timeless craftsmanship by Sterling Kart',
    eyebrow: 'Timeless Beauty',
    title: 'Crafted for Eternity.',
    description: 'Every piece tells a story of unmatched craftsmanship and delicate design.',
  },
  {
    image: image3,
    alt: 'Minimalist silver jewelry edit',
    eyebrow: 'Minimalist Magic',
    title: 'Simplicity is Ultimate Sophistication.',
    description: 'Embrace the beauty of subtle luxury with our minimalist silver jewelry edit.',
  },
  {
    image: image4,
    alt: 'Statement silver jewelry pieces',
    eyebrow: 'Shine Brighter',
    title: 'Let Your Light Sparkle.',
    description: 'Statement pieces designed to make you stand out on every special occasion.',
  },
  {
    image: image5,
    alt: 'Gifting pure 925 sterling silver',
    eyebrow: 'Perfect Gift',
    title: 'Expressions of Love.',
    description: 'Gift the magic of pure 925 sterling silver to the ones who matter most.',
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

function CustomerFavoriteCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Decide badge color based on text
  const badgeColor = product.badge === 'Bestseller' ? 'bg-gradient-to-r from-[#E68A9A] to-[#F4A0B0]' : 'bg-gradient-to-r from-[#D4AF37] to-[#E6C25B]';
  
  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group block overflow-hidden rounded-[16px] bg-[#FFFDFB] transition-all duration-300 border ${isHovered ? 'border-[#D9909F] shadow-xl' : 'border-[#F4EBE8] shadow-sm'}`}
    >
       <div className="relative aspect-[4/5] overflow-hidden bg-[#FDF8F9]">
         {product.badge && (
           <div className={`absolute top-0 left-0 z-10 px-3 py-1.5 flex items-center gap-1.5 text-white text-[9px] font-bold tracking-[1.5px] uppercase rounded-br-xl shadow-sm ${badgeColor}`}>
             <Crown size={11} className="text-white" /> {product.badge}
           </div>
         )}
         <Link to={`/product/${product.slug}`}>
           <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
         </Link>
       </div>
       
       <div className="relative p-2.5 md:p-5 text-center flex flex-col items-center bg-[#FFFDFB]">
         <Link to={`/product/${product.slug}`} className="w-full">
           <h3 className="font-serif text-[12px] md:text-[17px] text-[#1A202C] leading-tight mb-1 truncate">{product.name}</h3>
           <p className="text-[8px] md:text-[10px] text-[#A0AEC0] uppercase tracking-wide mb-2 md:mb-3">925 Sterling Silver</p>
           
           <div className="flex items-center justify-center gap-1.5 md:gap-2 mb-2 md:mb-3">
             <div className="h-[1px] w-4 md:w-6 bg-[#E2D8D5]" />
             <Star className="text-[#D4AF37] w-2.5 h-2.5 md:w-3 md:h-3" fill="currentColor" />
             <div className="h-[1px] w-4 md:w-6 bg-[#E2D8D5]" />
           </div>
           
           <p className="text-[12px] md:text-[15px] font-bold text-[#D9909F] mb-3 md:mb-4">₹{product.price.toLocaleString()}</p>
         </Link>
         
         <div className="w-full flex items-center justify-between gap-1.5 md:gap-2 mt-auto">
            <button className="w-7 h-7 md:w-9 md:h-9 shrink-0 rounded-full border border-[#D9909F]/40 flex items-center justify-center text-[#D9909F] hover:bg-[#D9909F] hover:text-white transition-colors">
              <Heart className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
            <Link 
              to={`/product/${product.slug}`} 
              className="flex-1 h-7 md:h-9 rounded-full bg-[#FFF0F5] flex items-center justify-center gap-1 md:gap-1.5 text-[8px] md:text-[10px] font-bold text-[#D9909F] uppercase tracking-wider hover:bg-[#D9909F] hover:text-white transition-colors whitespace-nowrap px-1"
            >
              QUICK VIEW <ArrowRight className="w-2.5 h-2.5 md:w-3 md:h-3" />
            </Link>
         </div>
       </div>
    </div>
  );
}

function NewArrivalsCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Link 
      to={`/product/${product.slug}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group block overflow-hidden rounded-[16px] bg-[#FFFDFB] transition-all duration-300 border ${isHovered ? 'border-[#D4AF37] shadow-lg' : 'border-white shadow-sm'}`}
    >
       <div className="relative aspect-square sm:aspect-[4/5] overflow-hidden bg-[#FDF8F9]">
         <span className="absolute top-3 left-3 bg-[#F48FB1] text-white text-[9px] font-bold px-2 py-1 tracking-wider uppercase rounded-sm z-10">NEW</span>
         <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
       </div>
       <div className="relative p-2.5 md:p-5 text-center flex flex-col items-center bg-[#FFFDFB] pt-5 md:pt-8">
         <div className={`absolute -top-3 md:-top-4 w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#FFFDFB] flex items-center justify-center border shadow-sm transition-colors duration-300 ${isHovered ? 'border-[#D4AF37]' : 'border-[#F4EBE8]'}`}>
            <Star className={`${isHovered ? "text-[#D4AF37]" : "text-[#D9909F]"} w-3 h-3 md:w-3.5 md:h-3.5`} fill="currentColor" />
         </div>
         <h3 className="font-serif text-[12px] md:text-[17px] text-[#1A202C] leading-tight mb-1.5 md:mb-2">{product.name}</h3>
         <p className="text-[12px] md:text-[14px] text-[#4A5568] mb-3 md:mb-4">₹{product.price.toLocaleString()}</p>
         
         <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full border flex items-center justify-center transition-colors duration-300 ${isHovered ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-[#E2D8D5] text-[#8B5A65]'}`}>
            <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5" />
         </div>
       </div>
    </Link>
  );
}

const newArrivalPromises = [
  { icon: Award, title: '925 PURE SILVER', description: 'Authentic & Hallmarked' },
  { icon: Gift, title: 'PREMIUM PACKAGING', description: 'Made with Love' },
  { icon: Shield, title: 'SECURE PAYMENTS', description: '100% Safe & Encrypted' },
  { icon: Truck, title: 'FREE SHIPPING', description: 'On orders above ₹2499' },
];

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
const galleryVideos = [v4, storeVideo, v2, v3];

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
  const [heroImageOverride, setHeroImageOverride] = useState('');
  const [touchStartX, setTouchStartX] = useState(null);

  const heroRef = useRef(null);
  const collageRef = useRef(null);
  const categoryScrollRef = useRef(null);
  const favoritesScrollRef = useRef(null);
  const newArrivalsScrollRef = useRef(null);
  const lastWheelTime = useRef(0);

  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroScroll, [0, 1], ["0%", "25%"]);

  const { scrollYProgress: collageScroll } = useScroll({ target: collageRef, offset: ["start end", "end start"] });
  const ySlow = useTransform(collageScroll, [0, 1], ["-10%", "10%"]);
  const yFast = useTransform(collageScroll, [0, 1], ["-20%", "20%"]);
  const activeHeroSlides = useMemo(() => heroImageOverride
    ? [{ ...heroSlides[0], image: heroImageOverride }, ...heroSlides.slice(1)]
    : heroSlides, [heroImageOverride]);

  useEffect(() => {
    const fetchSiteSettings = async () => {
      try {
        const res = await api.get('/settings');
        setHeroImageOverride(res.settings?.heroImageUrl || '');
      } catch (err) {
        console.error('Failed to load site settings:', err);
      }
    };

    fetchSiteSettings();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCategorySlideIndex((prev) => (prev + 1) % 3);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isHeroPaused || isHeroHovered) return undefined;

    const timer = window.setInterval(() => {
      setHeroIndex((currentIndex) => (currentIndex + 1) % activeHeroSlides.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [activeHeroSlides.length, isHeroHovered, isHeroPaused]);

  useEffect(() => {
    const nextSlideImage = new window.Image();
    nextSlideImage.src = activeHeroSlides[(heroIndex + 1) % activeHeroSlides.length].image;
  }, [activeHeroSlides, heroIndex]);

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
  const activeHeroSlide = activeHeroSlides[heroIndex] || activeHeroSlides[0];
  const visibleTestimonials = testimonials.slice(testimonialIndex, testimonialIndex + testimonialCount);
  const maxIndex = Math.max(0, testimonials.length - testimonialCount);

  const showPreviousHero = () => setHeroIndex((currentIndex) => (currentIndex - 1 + activeHeroSlides.length) % activeHeroSlides.length);
  const showNextHero = () => setHeroIndex((currentIndex) => (currentIndex + 1) % activeHeroSlides.length);

  const handleSubscribe = (event) => {
    event.preventDefault();
    setEmail('');
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    
    if (diff > 50) {
      showNextHero();
    } else if (diff < -50) {
      showPreviousHero();
    }
    setTouchStartX(null);
  };

  const handleWheel = (e) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 10) {
      const now = Date.now();
      if (now - lastWheelTime.current > 800) {
        if (e.deltaX > 0) {
          showNextHero();
        } else {
          showPreviousHero();
        }
        lastWheelTime.current = now;
      }
    }
  };

  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Sterling Kart",
      "url": "https://sterlingkart.in",
      "logo": "https://sterlingkart.in/giftcard.webp",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+91-9999999999",
        "contactType": "customer service"
      },
      "sameAs": [
        "https://www.instagram.com/sterlingkart",
        "https://www.facebook.com/sterlingkart"
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Sterling Kart",
      "url": "https://sterlingkart.in",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://sterlingkart.in/shop?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is 925 Sterling Silver?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "925 Sterling Silver is an alloy made of 92.5% pure silver and 7.5% other metals (usually copper) for strength. It is the international standard for high-quality silver jewellery."
          }
        },
        {
          "@type": "Question",
          "name": "Is Sterling Kart genuine?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, Sterling Kart provides authentic, BIS hallmarked 925 Sterling Silver jewellery. Every piece is certified for purity and craftsmanship."
          }
        },
        {
          "@type": "Question",
          "name": "How long does silver jewellery last?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "With proper care, high-quality 925 Sterling Silver jewellery can last a lifetime. It is highly durable and designed for long-term wear."
          }
        }
      ]
    }
  ];

  return (
    <div className="overflow-x-hidden bg-bg-primary bg-pattern-diamond">
      <SEO 
        title="Sterling Kart — Premium 925 Sterling Silver Jewellery Store"
        description="Shop authentic, BIS hallmarked 925 Sterling Silver Jewellery. Rings, earrings, necklaces, and more. Free shipping & 15-day exchange."
        schemas={schemas}
      />
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
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
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
          {activeHeroSlides.map((slide, index) => (
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
          <span className="text-[11px] text-white/30 font-medium">{String(activeHeroSlides.length).padStart(2, '0')}</span>
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

      {/* ── CUSTOMER FAVOURITES REDESIGN ────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-[#FFF5F5] to-[#FDF8F8] px-4 pt-12 pb-12 md:px-8 md:pt-16 md:pb-16 relative overflow-hidden border-t border-[#F4EBE8]">
        {/* Diamond pattern fading out from top */}
        <div className="absolute inset-0 bg-pattern-diamond opacity-60 pointer-events-none [mask-image:linear-gradient(to_bottom,white_0%,transparent_60%)] [-webkit-mask-image:linear-gradient(to_bottom,white_0%,transparent_60%)]" />
        
        {/* Diamond pattern fading in from bottom */}
        <div className="absolute inset-0 bg-pattern-diamond opacity-60 pointer-events-none [mask-image:linear-gradient(to_top,white_0%,transparent_60%)] [-webkit-mask-image:linear-gradient(to_top,white_0%,transparent_60%)]" />
        
        {/* Soft decorative background circles (mimicking floral corners) */}
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#F4A0B0]/20 rounded-full blur-[80px] -translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#F4A0B0]/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        
        {/* Custom Header for Customer Favourites */}
        <div className="text-center mb-10 relative z-10">
          <p className="text-[10px] md:text-[11px] font-bold text-[#D4AF37] uppercase tracking-[3px] mb-3 flex items-center justify-center gap-2">
            <div className="h-[1px] w-8 bg-[#D4AF37]/40" />
            MOST LOVED
            <div className="h-[1px] w-8 bg-[#D4AF37]/40" />
          </p>
          <h2 className="font-serif text-[32px] md:text-[46px] text-[#1A202C] leading-tight mb-3">Customer favourites</h2>
          <p className="text-[13px] md:text-[15px] text-[#4A5568] max-w-lg mx-auto">Handpicked pieces our customers can't get enough of.</p>
          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="h-[1px] w-12 bg-[#D9909F]/40" />
            <Star className="text-[#D9909F]" size={14} fill="currentColor" />
            <div className="h-[1px] w-12 bg-[#D9909F]/40" />
          </div>
        </div>

        <div className="relative max-w-[1320px] mx-auto group z-10">
          <button 
            onClick={scrollFavoritesLeft} 
            className="absolute left-0 top-[45%] md:top-[50%] -translate-y-1/2 -ml-2 md:-ml-5 z-10 w-9 h-9 md:w-11 md:h-11 bg-white/90 backdrop-blur-sm border border-[#EEE8E5] rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.1)] flex items-center justify-center text-[#D4527A] hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft size={22} strokeWidth={1.5} />
          </button>
          
          <div ref={favoritesScrollRef} className="flex gap-4 md:gap-5 overflow-x-auto snap-x snap-mandatory pb-5 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {bestsellers.map((product) => (
              <div key={product.id} className="w-[36vw] max-w-[145px] sm:w-[170px] sm:max-w-none md:w-[calc(25%-15px)] lg:w-[calc(20%-16px)] snap-start shrink-0">
                <CustomerFavoriteCard product={product} />
              </div>
            ))}
          </div>

          <button 
            onClick={scrollFavoritesRight} 
            className="absolute right-0 top-[45%] md:top-[50%] -translate-y-1/2 -mr-2 md:-mr-5 z-10 w-9 h-9 md:w-11 md:h-11 bg-white/90 backdrop-blur-sm border border-[#EEE8E5] rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.1)] flex items-center justify-center text-[#D4527A] hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronRight size={22} strokeWidth={1.5} />
          </button>
        </div>
        
        {/* View All Jewellery Button */}
        <div className="mt-6 md:mt-10 text-center relative z-10">
          <Link 
            to="/shop" 
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#F4A0B0] to-[#E68A9A] px-8 py-3.5 text-[11px] md:text-[12px] font-bold uppercase tracking-[2px] text-white hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-sm"
          >
            <Star size={14} fill="currentColor" className="opacity-70" /> VIEW ALL JEWELLERY <ArrowRight size={16} />
          </Link>
        </div>
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

      <GiftCardPromo />

      {/* ── NEW ARRIVALS REDESIGN ────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-[#FAF5F5] to-[#FDF8F8] px-4 pt-12 pb-12 md:px-8 md:pt-16 md:pb-16 relative overflow-hidden">
        {/* Soft decorative background circles */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/40 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#FFF0F5]/50 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />
        
        {/* Custom Header for New Arrivals */}
        <div className="text-center mb-10 relative z-10">
          <p className="text-[10px] md:text-[11px] font-bold text-[#D4AF37] uppercase tracking-[3px] mb-3 flex items-center justify-center gap-2">
            <Star size={12} fill="currentColor" /> JUST DROPPED <Star size={12} fill="currentColor" />
          </p>
          <h2 className="font-serif text-[32px] md:text-[46px] text-[#1A202C] leading-tight mb-3">New Arrivals</h2>
          <p className="text-[13px] md:text-[15px] text-[#4A5568] max-w-lg mx-auto">Handpicked 925 Silver jewellery to elevate every moment.</p>
          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="h-[1px] w-12 bg-[#D9909F]/40" />
            <Star className="text-[#D9909F]" size={14} fill="currentColor" />
            <div className="h-[1px] w-12 bg-[#D9909F]/40" />
          </div>
        </div>

        <div className="relative max-w-[1320px] mx-auto group z-10">
          <button 
            onClick={scrollNewArrivalsLeft} 
            className="absolute left-0 top-[40%] md:top-[45%] -translate-y-1/2 -ml-2 md:-ml-5 z-10 w-9 h-9 md:w-11 md:h-11 bg-white/90 backdrop-blur-sm border border-[#EEE8E5] rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.1)] flex items-center justify-center text-[#D4527A] hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft size={22} strokeWidth={1.5} />
          </button>
          
          <div ref={newArrivalsScrollRef} className="flex gap-4 md:gap-5 overflow-x-auto snap-x snap-mandatory pb-5 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {newArrivals.map((product) => (
              <div key={product.id} className="w-[36vw] max-w-[145px] sm:w-[170px] sm:max-w-none md:w-[calc(25%-15px)] lg:w-[calc(20%-16px)] snap-start shrink-0">
                <NewArrivalsCard product={product} />
              </div>
            ))}
          </div>

          <button 
            onClick={scrollNewArrivalsRight} 
            className="absolute right-0 top-[40%] md:top-[45%] -translate-y-1/2 -mr-2 md:-mr-5 z-10 w-9 h-9 md:w-11 md:h-11 bg-white/90 backdrop-blur-sm border border-[#EEE8E5] rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.1)] flex items-center justify-center text-[#D4527A] hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronRight size={22} strokeWidth={1.5} />
          </button>
        </div>
        
        {/* View All Collections Button */}
        <div className="mt-6 md:mt-10 text-center relative z-10">
          <Link 
            to="/shop?badge=New" 
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#D9909F] bg-transparent px-6 py-2.5 md:px-8 md:py-3 text-[11px] md:text-[12px] font-bold uppercase tracking-[2px] text-[#8B5A65] hover:bg-[#D9909F] hover:text-white transition-all shadow-sm"
          >
            VIEW ALL COLLECTIONS <ArrowRight size={16} />
          </Link>
        </div>

        {/* 4 Feature Highlights - Integrated as per reference image */}
        <div className="relative z-10 max-w-[1100px] mx-auto mt-12 md:mt-16 pt-8 border-t border-[#E8D4BB]/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4">
            {newArrivalPromises.map((promise, idx) => {
              const Icon = promise.icon;
              return (
                <div key={idx} className={`flex items-center gap-3 md:gap-4 px-2 md:px-4 ${idx !== 0 && idx !== 2 ? 'md:border-l md:border-[#E8D4BB]/50' : ''} ${idx % 2 !== 0 ? 'border-l border-[#E8D4BB]/50' : ''}`}>
                  <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-transparent shrink-0 text-[#D4AF37]">
                    <Icon size={20} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-serif text-[10px] md:text-[12px] font-bold text-[#1A202C] leading-tight uppercase tracking-wide">
                      {promise.title}
                    </h3>
                    <p className="text-[10px] md:text-[11px] text-[#718096] mt-0.5">
                      {promise.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Curated Collage Section */}
      <section className="bg-bg-surface px-4 py-8 md:px-8 md:py-24 relative overflow-hidden bg-pattern-diamond" ref={collageRef}>
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-pink-100/40 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-slate-100/60 rounded-full blur-[100px] translate-x-1/3 pointer-events-none" />
        
        <div className="mx-auto max-w-[1050px] relative z-10">
          <SectionHeading eyebrow="The Edit" title="Curated for you" align="center" />
          
          <div className="flex flex-col gap-3 md:gap-6 mt-6 md:mt-10">
            
            {/* Card 1: Signature Collection (Top Large Card) */}
            <Link to="/shop" className="relative group overflow-hidden rounded-[16px] md:rounded-[32px] aspect-[16/11] sm:aspect-[16/9] md:aspect-[21/9] shadow-sm block">
              <motion.img style={{ y: ySlow, scale: 1.1 }} src={c5} alt="Signature Collection" className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-[1200ms] group-hover:scale-[1.15]" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent z-10" />
              <div className="absolute top-1/2 -translate-y-1/2 left-5 sm:left-8 md:left-12 max-w-[260px] md:max-w-[400px] z-20 text-white">
                <span className="text-[#D4A373] text-[9px] sm:text-[10px] md:text-[12px] font-bold uppercase tracking-[2px]">Signature Collection</span>
                <h2 className="font-serif text-[32px] sm:text-[40px] md:text-[56px] leading-[1.1] mt-2 mb-3">Elegance<br />Defined</h2>
                <p className="text-[12px] sm:text-[14px] md:text-[16px] text-white/90 mb-5 md:mb-6 leading-relaxed max-w-[200px] md:max-w-none">Timeless designs, crafted to celebrate every you.</p>
                <div className="inline-flex items-center gap-2 md:gap-3 bg-white text-black px-4 sm:px-5 py-2.5 sm:py-3 rounded-[12px] text-[10px] sm:text-[11px] md:text-[13px] font-bold tracking-[1px] hover:bg-white/90 transition-colors shadow-lg">
                  EXPLORE COLLECTION <ChevronRight size={14} className="sm:w-[16px] sm:h-[16px]" />
                </div>
              </div>
              {/* Fake carousel dots for aesthetic match */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-white/40 border border-white/40"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-white/40 border border-white/40"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-white/40 border border-white/40"></div>
              </div>
            </Link>

            {/* The 3 Small Cards Row */}
            <div className="grid grid-cols-3 gap-2 md:gap-6">
              
              {/* Card 2: New Arrivals */}
              <Link to="/shop" className="relative group overflow-hidden rounded-[12px] md:rounded-[24px] aspect-[3/4] md:aspect-[4/5] shadow-sm block">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-500 z-10" />
                <motion.img style={{ y: ySlow, scale: 1.2 }} src={c1} alt="New Arrivals" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1000ms] group-hover:scale-[1.25]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
                <div className="absolute bottom-3 left-3 right-3 md:bottom-8 md:left-8 md:right-8 z-20 text-white">
                  <span className="text-[7px] md:text-[11px] font-bold uppercase tracking-[1px] md:tracking-[2px] text-white/90">New Arrivals</span>
                  <h3 className="font-serif text-[14px] sm:text-[18px] md:text-[28px] leading-[1.2] mt-1 mb-2 md:mt-2 md:mb-4 text-white">Fresh Designs<br />Just For You</h3>
                  <span className="inline-flex items-center gap-1 md:gap-2 text-[8px] md:text-[12px] font-bold uppercase tracking-[1px] md:tracking-[1.5px] group-hover:gap-2 md:group-hover:gap-3 transition-all">
                    Shop Now <ChevronRight size={12} className="md:w-[14px] md:h-[14px]" />
                  </span>
                </div>
              </Link>

              {/* Card 3: Bestsellers */}
              <Link to="/shop" className="relative group overflow-hidden rounded-[12px] md:rounded-[24px] aspect-[3/4] md:aspect-[4/5] shadow-sm block">
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors duration-500 z-10" />
                <motion.img style={{ y: yFast, scale: 1.2 }} src={c2} alt="Bestsellers" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1000ms] group-hover:scale-[1.25]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#E2CDC2]/90 via-transparent to-transparent z-10" />
                <div className="absolute bottom-3 left-3 right-3 md:bottom-8 md:left-8 md:right-8 z-20 text-[#2C2420]">
                  <span className="text-[7px] md:text-[11px] font-bold uppercase tracking-[1px] md:tracking-[2px] text-[#5A4A42]">Bestsellers</span>
                  <h3 className="font-serif text-[14px] sm:text-[18px] md:text-[28px] leading-[1.2] mt-1 mb-2 md:mt-2 md:mb-4 text-[#2C2420]">Loved by<br />Thousands</h3>
                  <span className="inline-flex items-center gap-1 md:gap-2 text-[8px] md:text-[12px] font-bold uppercase tracking-[1px] md:tracking-[1.5px] group-hover:gap-2 md:group-hover:gap-3 transition-all">
                    Shop Now <ChevronRight size={12} className="md:w-[14px] md:h-[14px]" />
                  </span>
                </div>
              </Link>

              {/* Card 4: Rings */}
              <Link to="/shop" className="relative group overflow-hidden rounded-[12px] md:rounded-[24px] aspect-[3/4] md:aspect-[4/5] shadow-sm block">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-500 z-10" />
                <motion.img style={{ y: ySlow, scale: 1.2 }} src={c3} alt="Rings" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1000ms] group-hover:scale-[1.25]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
                <div className="absolute bottom-3 left-3 right-3 md:bottom-8 md:left-8 md:right-8 z-20 text-white">
                  <span className="text-[7px] md:text-[11px] font-bold uppercase tracking-[1px] md:tracking-[2px] text-white/90">Rings</span>
                  <h3 className="font-serif text-[14px] sm:text-[18px] md:text-[28px] leading-[1.2] mt-1 mb-2 md:mt-2 md:mb-4 text-white">Grace in Every<br />Detail</h3>
                  <span className="inline-flex items-center gap-1 md:gap-2 text-[8px] md:text-[12px] font-bold uppercase tracking-[1px] md:tracking-[1.5px] group-hover:gap-2 md:group-hover:gap-3 transition-all">
                    Shop Now <ChevronRight size={12} className="md:w-[14px] md:h-[14px]" />
                  </span>
                </div>
              </Link>

            </div>

            {/* Card 5: Men's Collection (Bottom Large Card) */}
            <Link to="/shop" className="relative group overflow-hidden rounded-[16px] md:rounded-[32px] aspect-[21/9] sm:aspect-[4/1] shadow-sm block mt-1 md:mt-2">
              <motion.img style={{ y: yFast, scale: 1.1 }} src={c6} alt="Men's Collection" className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-[1200ms] group-hover:scale-[1.15]" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-black/10 z-10" />
              <div className="absolute top-1/2 -translate-y-1/2 left-5 sm:left-8 md:left-12 max-w-[200px] sm:max-w-[280px] md:max-w-[400px] z-20 text-white">
                <span className="text-[#D4A373] text-[8px] sm:text-[10px] md:text-[11px] font-bold uppercase tracking-[1px] md:tracking-[2px]">Men's Collection</span>
                <h2 className="font-serif text-[18px] sm:text-[24px] md:text-[36px] leading-[1.2] mt-1 mb-1 md:mt-2 md:mb-2">Bold. Minimal. Timeless.</h2>
                <p className="text-[10px] sm:text-[12px] md:text-[14px] text-white/80 mb-3 md:mb-4">Crafted for the modern man.</p>
                <span className="inline-flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[12px] font-bold uppercase tracking-[1px] md:tracking-[1.5px] group-hover:gap-2 md:group-hover:gap-3 transition-all">
                  Explore Now <ChevronRight size={12} className="md:w-[14px] md:h-[14px]" />
                </span>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* Influencer Spotlight / Circular Gallery Section */}
      <section className="bg-black px-0 py-10 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,82,122,0.15)_0%,transparent_70%)]" />
        
        <div className="mx-auto max-w-[1320px] px-5 md:px-8 relative z-10 mb-10 text-center flex flex-col items-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-[1px] w-10 md:w-16 bg-[#F4A0B0]/30" />
            <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-[3px] text-[#F4A0B0] flex flex-col items-center gap-1.5">
              <span>Influencer Spotlight</span>
              <Star className="text-[#F4A0B0] w-2.5 h-2.5 opacity-70" fill="currentColor" />
            </div>
            <div className="h-[1px] w-10 md:w-16 bg-[#F4A0B0]/30" />
          </div>
          
          <h2 className="font-serif text-[28px] md:text-[46px] leading-[1.15] text-white mb-4 max-w-3xl">
            Trusted by <span className="text-[#F4A0B0] italic font-medium">Creators</span>, Loved by <span className="text-[#F4A0B0] italic font-medium">Customers</span>
          </h2>
          
          <p className="mx-auto max-w-[600px] text-[13px] md:text-[15px] text-[#A0AEC0] leading-relaxed mb-8">
            Real stories, real style. See how influencers and jewellery lovers shine with Sterling Kart's handcrafted 925 silver collections.
          </p>
          
          {/* Avatars Row */}
          <div className="flex items-center justify-center gap-3 md:gap-5">
            <div className="flex -space-x-3 md:-space-x-4">
              {[c1, c2, c3, c4, c5].map((img, i) => (
                <div key={i} className="w-8 h-8 md:w-12 md:h-12 rounded-full border-[2px] border-black overflow-hidden relative" style={{ zIndex: 10 - i }}>
                  <img src={img} alt="Creator" className="w-full h-full object-cover" />
                </div>
              ))}
              <div className="w-8 h-8 md:w-12 md:h-12 rounded-full border-[2px] border-black bg-[#F4A0B0]/10 flex items-center justify-center text-[#F4A0B0] text-[8px] md:text-[10px] font-bold z-0 relative">
                +12K
              </div>
            </div>
            
            <div className="text-left flex flex-col justify-center border-l border-white/20 pl-3 md:pl-5">
              <span className="text-[10px] md:text-[12px] text-[#A0AEC0] mb-0.5">Loved by</span>
              <div className="text-[11px] md:text-[13px] text-white">
                <span className="text-[#F4A0B0] font-bold text-[13px] md:text-[16px] mr-1">12K+</span> creators & customers
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 -mt-12 h-[360px] w-full md:-mt-8 md:h-[600px]">
          <LazyLoad fallback={<div className="w-full h-full flex items-center justify-center text-white/50">Loading videos...</div>}>
            <CircularGallery 
              videos={galleryVideos}
              bend={0.06}
              itemWidth={isMobile ? 3.4 : 4}
              itemHeight={isMobile ? 6.0 : 7}
              gap={isMobile ? 0.3 : 0.4}
            />
          </LazyLoad>
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

      {/* ── TESTIMONIALS (Loved by our customers) ── */}
      <section className="bg-[#FAF7F6] px-4 pt-16 pb-12 md:px-8 md:pt-24 md:pb-20 relative overflow-hidden bg-pattern-diamond">
        {/* Soft background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pink-100/30 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-100/20 rounded-full blur-[80px] pointer-events-none" />

        <div className="mx-auto max-w-[1200px] relative z-10">
          <div className="text-center mb-10 md:mb-14">
            <p className="text-[10px] md:text-[11px] font-bold text-[#D4527A] uppercase tracking-[3px] mb-3">
              Kind words
            </p>
            <h2 className="font-serif text-[32px] md:text-[46px] text-[#1A202C] leading-tight mb-4">
              Loved by our customers
            </h2>
            <div className="flex items-center justify-center gap-3">
              <div className="h-[1px] w-12 bg-[#D4527A]/30" />
              <Heart className="text-[#D4527A]" size={14} fill="currentColor" />
              <div className="h-[1px] w-12 bg-[#D4527A]/30" />
            </div>
            <p className="mt-4 text-[#4A5568] text-[13px] md:text-[15px]">Real stories. Real love. Real Sterling Kart.</p>
          </div>

          <div className="relative">
            {/* Nav Left */}
            <button 
              onClick={() => setTestimonialIndex(Math.max(0, testimonialIndex - 1))} 
              disabled={testimonialIndex === 0} 
              className="absolute left-0 top-1/2 -translate-y-1/2 -ml-3 md:-ml-6 z-10 w-10 h-10 md:w-12 md:h-12 bg-white border border-[#EEE8E5] rounded-full shadow-sm flex items-center justify-center text-[#D4527A] disabled:opacity-40 hover:scale-105 transition-transform"
            >
              <ChevronLeft size={20} strokeWidth={1.5} />
            </button>

            <div className="grid gap-6 md:gap-8 md:grid-cols-3 mx-4 md:mx-10">
              {visibleTestimonials.map((testimonial) => (
                <article key={testimonial.id} className="relative rounded-[24px] bg-white p-6 md:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-white transition-transform duration-500 hover:-translate-y-1">
                  <div className="flex justify-between items-start mb-4">
                    <Quote size={24} className="text-[#F4A0B0] fill-[#F4A0B0]/20" />
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className="text-[#D4527A]" fill="currentColor" />
                      ))}
                    </div>
                  </div>
                  <p className="text-[13px] md:text-[14px] leading-[1.8] text-[#2D3748] font-serif italic mb-8">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center justify-between border-t border-[#F4EBE8] pt-4 mt-auto">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#E8DDD5] flex items-center justify-center text-[12px] font-bold text-[#4A5568]">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-[#1A202C] uppercase tracking-[1px]">{testimonial.name}</p>
                        <p className="text-[11px] text-[#718096]">{testimonial.city}</p>
                      </div>
                    </div>
                    <Heart size={18} className="text-[#F4A0B0]" />
                  </div>
                </article>
              ))}
            </div>

            {/* Nav Right */}
            <button 
              onClick={() => setTestimonialIndex(Math.min(maxIndex, testimonialIndex + 1))} 
              disabled={testimonialIndex === maxIndex} 
              className="absolute right-0 top-1/2 -translate-y-1/2 -mr-3 md:-mr-6 z-10 w-10 h-10 md:w-12 md:h-12 bg-white border border-[#EEE8E5] rounded-full shadow-sm flex items-center justify-center text-[#D4527A] disabled:opacity-40 hover:scale-105 transition-transform"
            >
              <ChevronRight size={20} strokeWidth={1.5} />
            </button>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8 md:mt-10">
            <div className="w-2 h-2 rounded-full bg-[#D4527A]" />
            <div className="w-2 h-2 rounded-full bg-[#E2E8F0]" />
            <div className="w-2 h-2 rounded-full bg-[#E2E8F0]" />
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER (A little something extra) ── */}
      <section className="px-4 py-8 md:px-8 md:py-16 bg-[#FAF7F6]">
        <div className="mx-auto max-w-[1200px] relative rounded-[24px] md:rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgba(212,82,122,0.1)] border border-[#F4EBE8]">
          <img src={newsletterBg} alt="Background" className="absolute inset-0 w-full h-full object-cover object-center" />
          
          {/* Gradient overlay to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-transparent md:from-white/80 md:via-white/60 md:to-white/10" />

          <div className="relative z-10 p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16">
            <div className="w-full md:w-1/2 text-center md:text-left">
              <p className="text-[10px] font-bold uppercase tracking-[3px] text-[#D4527A] mb-3">
                A little something extra
              </p>
              <h2 className="font-serif text-[32px] md:text-[48px] leading-[1.1] text-[#1A202C] mb-4">
                Get <span className="text-[#D4527A] italic">10%</span> off<br />your first order.
              </h2>
              <p className="text-[13px] md:text-[15px] text-[#4A5568] leading-relaxed max-w-md mx-auto md:mx-0">
                Join our inner circle for new launches, thoughtful offers, and exclusive early access.
              </p>
            </div>

            <div className="w-full md:w-1/2 max-w-[420px]">
              <form onSubmit={handleSubscribe} className="flex bg-white rounded-full p-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-[#F4EBE8]">
                <div className="flex-1 flex items-center px-4">
                  <Mail size={18} className="text-[#A0AEC0] shrink-0" />
                  <input 
                    value={email} 
                    onChange={(event) => setEmail(event.target.value)} 
                    type="email" 
                    required 
                    placeholder="Your email address" 
                    className="w-full bg-transparent border-0 px-3 py-2 text-[13px] text-[#1A202C] outline-none placeholder:text-[#A0AEC0]" 
                  />
                </div>
                <button className="rounded-full bg-[#D4527A] px-6 py-3 text-[11px] font-bold uppercase tracking-[1px] text-white hover:bg-[#B94B68] transition-colors shrink-0 shadow-md">
                  Subscribe
                </button>
              </form>
              <div className="flex items-center justify-center md:justify-start gap-2 mt-4 text-[#718096]">
                <ShieldCheck size={14} className="text-[#D4527A]" />
                <p className="text-[11px] md:text-[12px]">No spam, ever. Unsubscribe anytime.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* ── FAQ (Expert Answers) ── */}
      <section className="bg-[#FAF7F6] px-4 pb-12 md:px-8 md:pb-24">
        <div className="mx-auto max-w-[1200px] bg-white rounded-[32px] p-8 md:p-16 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-[#F4EBE8]">
          
          <div className="flex flex-col md:flex-row items-center justify-between mb-10 md:mb-12">
            <div className="text-center md:text-center w-full relative">
              <p className="text-[10px] md:text-[11px] font-bold text-[#D4527A] uppercase tracking-[3px] mb-3">
                Expert Answers
              </p>
              <h2 className="font-serif text-[32px] md:text-[42px] text-[#1A202C] leading-tight mb-4">
                Frequently Asked Questions
              </h2>
              <div className="flex items-center justify-center gap-3">
                <div className="h-[1px] w-12 bg-[#D4527A]/30" />
                <div className="w-2 h-2 rotate-45 bg-[#D4527A]" />
                <div className="h-[1px] w-12 bg-[#D4527A]/30" />
              </div>
              <Link to="/faq" className="absolute right-0 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center gap-1 text-[13px] font-bold text-[#D4527A] hover:text-[#B94B68] transition-colors">
                Browse all FAQs <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-8">
            {/* Card 1 */}
            <div className="bg-[#FAF7F6] rounded-[16px] md:rounded-[24px] p-3 sm:p-4 md:p-8 text-center border border-white hover:border-[#F4A0B0]/40 transition-colors flex flex-col items-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 mx-auto bg-white rounded-full flex items-center justify-center border border-[#F4EBE8] mb-2 sm:mb-4 md:mb-6 shadow-sm shrink-0">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#D4527A] stroke-[1.5]" />
              </div>
              <h3 className="font-bold text-[9px] sm:text-[12px] md:text-[16px] text-[#1A202C] mb-1.5 md:mb-3 leading-tight">
                What is 925 Sterling Silver?
              </h3>
              <p className="text-[8px] sm:text-[10px] md:text-[13px] leading-[1.3] md:leading-[1.7] text-[#4A5568] mb-2 md:mb-6 line-clamp-4 md:line-clamp-none">
                925 Sterling Silver contains 92.5% pure silver and 7.5% other metals for strength. It is the international standard for high-quality silver jewellery.
              </p>
              <Link to="/faq" className="mt-auto inline-flex items-center gap-0.5 md:gap-1 text-[8px] sm:text-[11px] md:text-[13px] font-bold text-[#D4527A] hover:text-[#B94B68] transition-colors">
                Learn more <ArrowRight className="w-2 h-2 md:w-3.5 md:h-3.5" />
              </Link>
            </div>

            {/* Card 2 */}
            <div className="bg-[#FAF7F6] rounded-[16px] md:rounded-[24px] p-3 sm:p-4 md:p-8 text-center border border-white hover:border-[#F4A0B0]/40 transition-colors flex flex-col items-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 mx-auto bg-white rounded-full flex items-center justify-center border border-[#F4EBE8] mb-2 sm:mb-4 md:mb-6 shadow-sm shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#D4527A] stroke-[1.5]" />
              </div>
              <h3 className="font-bold text-[9px] sm:text-[12px] md:text-[16px] text-[#1A202C] mb-1.5 md:mb-3 leading-tight">
                Is Sterling Kart genuine?
              </h3>
              <p className="text-[8px] sm:text-[10px] md:text-[13px] leading-[1.3] md:leading-[1.7] text-[#4A5568] mb-2 md:mb-6 line-clamp-4 md:line-clamp-none">
                Yes, Sterling Kart promises authentic 925 Sterling Silver jewellery. Every piece is crafted with care and comes with a purity and authenticity certificate.
              </p>
              <Link to="/faq" className="mt-auto inline-flex items-center gap-0.5 md:gap-1 text-[8px] sm:text-[11px] md:text-[13px] font-bold text-[#D4527A] hover:text-[#B94B68] transition-colors">
                Learn more <ArrowRight className="w-2 h-2 md:w-3.5 md:h-3.5" />
              </Link>
            </div>

            {/* Card 3 */}
            <div className="bg-[#FAF7F6] rounded-[16px] md:rounded-[24px] p-3 sm:p-4 md:p-8 text-center border border-white hover:border-[#F4A0B0]/40 transition-colors flex flex-col items-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 mx-auto bg-white rounded-full flex items-center justify-center border border-[#F4EBE8] mb-2 sm:mb-4 md:mb-6 shadow-sm shrink-0">
                <Box className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#D4527A] stroke-[1.5]" />
              </div>
              <h3 className="font-bold text-[9px] sm:text-[12px] md:text-[16px] text-[#1A202C] mb-1.5 md:mb-3 leading-tight">
                How long does delivery take?
              </h3>
              <p className="text-[8px] sm:text-[10px] md:text-[13px] leading-[1.3] md:leading-[1.7] text-[#4A5568] mb-2 md:mb-6 line-clamp-4 md:line-clamp-none">
                We process orders within 24-48 hours. Standard delivery takes 3-5 days across India. Express delivery options are also available at checkout.
              </p>
              <Link to="/faq" className="mt-auto inline-flex items-center gap-0.5 md:gap-1 text-[8px] sm:text-[11px] md:text-[13px] font-bold text-[#D4527A] hover:text-[#B94B68] transition-colors">
                Learn more <ArrowRight className="w-2 h-2 md:w-3.5 md:h-3.5" />
              </Link>
            </div>
          </div>
          
          {/* Mobile "Browse all" link */}
          <div className="mt-6 text-center md:hidden">
            <Link to="/faq" className="inline-flex items-center gap-1 text-[13px] font-bold text-[#D4527A]">
              Browse all FAQs <ArrowRight size={14} />
            </Link>
          </div>
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

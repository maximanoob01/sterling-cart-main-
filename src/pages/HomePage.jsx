import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Award, ChevronLeft, ChevronRight, Heart, Pause, Play, RotateCcw, Shield, ShoppingCart, Star, Truck } from 'lucide-react';
import MagneticButton from '../components/ui/MagneticButton';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { categories, products } from '../data/products';
import { testimonials } from '../data/orders';
import { calculateDiscount, formatPrice } from '../utils/formatPrice';
import heroLifestyle1 from '../assets/images/hero_lifestyle_1.png';
import heroLifestyle2 from '../assets/images/hero_lifestyle_2.png';
import heroLifestyle3 from '../assets/images/hero_lifestyle_3.png';
import heroLifestyle4 from '../assets/images/hero_lifestyle_4.png';
import heroLifestyle5 from '../assets/images/hero_lifestyle_5.png';
import storeVideo from '../assets/images/v1.mp4';
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

const fadeIn = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

const occasions = [
  ['Everyday', 'everyday'],
  ['Wedding', 'wedding'],
  ['Festive', 'festivals'],
  ['Gifting', 'gifting'],
  ['Office', 'office'],
];

const promises = [
  { image: promise1, icon: Shield, title: '925 sterling silver' },
  { image: promise2, icon: Award, title: 'Hallmarked and certified' },
  { image: promise3, icon: Truck, title: 'Free delivery above Rs. 1,999' },
  { image: promise4, icon: RotateCcw, title: 'Easy 7-day returns' },
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

function ProductCard({ product }) {
  const { addItem } = useCart();
  const { toggleItem, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);
  const discount = calculateDiscount(product.price, product.mrp);

  return (
    <motion.article variants={fadeIn} className="group overflow-hidden rounded-xl border border-border-main bg-bg-surface transition-shadow hover:shadow-product">
      <div className="relative overflow-hidden bg-bg-alt">
        {product.badge && <span className="absolute left-3 top-3 z-10 rounded-full bg-[#1C1C2E] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.8px] text-white">{product.badge}</span>}
        <button onClick={() => toggleItem(product)} className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-bg-surface/90 text-text-muted shadow-sm transition-colors hover:text-[#D4527A]" aria-label="Toggle wishlist">
          <Heart size={15} className={wishlisted ? 'fill-[#D4527A] text-[#D4527A]' : ''} />
        </button>
        <Link to={`/product/${product.slug}`} className="block aspect-square">
          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]" loading="lazy" />
        </Link>
      </div>
      <div className="p-4">
        <Link to={`/product/${product.slug}`} className="block min-h-[42px] text-[14px] font-medium leading-5 text-text-main transition-colors hover:text-[#D4527A]">{product.name}</Link>
        <div className="mt-2 flex items-center gap-2">
          <StarRating rating={product.rating} size={12} />
          <span className="text-[11px] text-text-muted">({product.reviewCount})</span>
        </div>
        <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-[15px] font-semibold">{formatPrice(product.price)}</span>
          {product.mrp > product.price && <span className="text-[12px] text-text-muted line-through">{formatPrice(product.mrp)}</span>}
          {discount > 0 && <span className="text-[10px] font-semibold text-[#B94B68]">{discount}% off</span>}
        </div>
        <MagneticButton className="w-full mt-5">
          <button onClick={() => addItem(product)} className="group flex h-11 w-full items-center justify-center gap-2 rounded-full border-[1.5px] border-[#1C1C2E] bg-transparent text-[11px] font-bold uppercase tracking-[1.2px] text-[#1C1C2E] transition-all hover:bg-[#1C1C2E] hover:text-white shadow-sm">
            <ShoppingCart size={15} className="transition-transform group-hover:scale-110" /> Add to cart
          </button>
        </MagneticButton>
      </div>
    </motion.article>
  );
}

function CategorySlideCard({ category, slideIndex }) {
  return (
    <div 
      className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-bg-alt"
    >
      <div 
        className="absolute inset-0 h-full transition-transform duration-700 ease-in-out"
        style={{ width: '300%', transform: `translateX(-${(slideIndex * 100) / 3}%)` }}
      >
        <img 
          src={category.image} 
          alt={category.name} 
          className="h-full w-full object-cover" 
          loading="lazy" 
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent pointer-events-none transition-opacity duration-300 group-hover:opacity-90" />
      
      <div className="absolute bottom-3 left-3 pointer-events-none flex flex-col items-start">
        <span className="text-[15px] font-bold tracking-wide text-white">{category.name}</span>
        <div className="mt-1 flex gap-1 pointer-events-none">
          {[0, 1, 2].map((idx) => (
            <div key={idx} className={`h-[3px] rounded-full transition-all duration-300 ${idx === slideIndex ? 'w-4 bg-[#D4527A]' : 'w-2 bg-bg-surface/40'}`} />
          ))}
        </div>
      </div>
      
      <Link to={`/shop?category=${category.id}`} aria-label={`Shop ${category.name}`} className="shop-link absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-bg-surface/20 text-white backdrop-blur-md transition-all hover:bg-bg-surface hover:text-[#B94B68]">
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [heroIndex, setHeroIndex] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);
  const [isHeroHovered, setIsHeroHovered] = useState(false);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [testimonialCount, setTestimonialCount] = useState(3);
  const [categorySlideIndex, setCategorySlideIndex] = useState(0);

  const heroRef = useRef(null);
  const collageRef = useRef(null);

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
    const updateCount = () => setTestimonialCount(window.innerWidth < 768 ? 1 : 3);
    updateCount();
    window.addEventListener('resize', updateCount);
    return () => window.removeEventListener('resize', updateCount);
  }, []);

  const bestsellers = products.filter((product) => product.badge === 'Bestseller').slice(0, 8);
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
    <div className="overflow-x-hidden bg-bg-primary">
      <section
        ref={heroRef}
        className="relative isolate flex min-h-[450px] items-center overflow-hidden bg-[#E8DDD5] md:min-h-[500px]"
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
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ opacity: 0, scale: 1.15 }}
            animate={{ opacity: 1, scale: 1.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            style={{ y: heroY }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,252,251,0.94)_0%,rgba(255,252,251,0.85)_35%,rgba(255,252,251,0)_100%)] md:bg-[linear-gradient(90deg,rgba(255,252,251,0.94)_0%,rgba(255,252,251,0.72)_42%,rgba(255,252,251,0.08)_100%)]" />
        <div className="absolute bottom-4 right-4 z-10 rounded-lg border border-white/60 bg-bg-surface/75 px-3 py-1.5 text-right shadow-sm backdrop-blur-sm md:bottom-6 md:right-8">
          <p className="font-serif text-[15px] uppercase tracking-[1px] text-text-main">Sterling Kart</p>
          <p className="mt-0.5 text-[7px] font-bold uppercase tracking-[2px] text-text-muted">925 Silver Jewels</p>
        </div>
        <div className="relative mx-auto w-full max-w-[1320px] px-5 py-12 md:px-8 md:py-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={heroIndex}
              className="max-w-[480px]"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              aria-live="polite"
            >
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[3px] text-[#B94B68]">{activeHeroSlide.eyebrow}</p>
              <h1 className="font-serif text-[38px] leading-[1.08] tracking-[-1px] text-text-main sm:text-[46px]">{activeHeroSlide.title}</h1>
              <p className="mt-5 max-w-[420px] text-[15px] leading-7 text-text-muted">{activeHeroSlide.description}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <MagneticButton>
                  <Link to="/shop" className="btn-primary inline-flex text-[12px] py-2.5 px-6">Shop the collection</Link>
                </MagneticButton>
                <MagneticButton>
                  <Link to="/shop?badge=New" className="btn-secondary inline-flex text-[12px] py-2.5 px-6">See new arrivals</Link>
                </MagneticButton>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        <button type="button" onClick={showPreviousHero} className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-bg-surface/80 text-text-main shadow-sm backdrop-blur-sm transition hover:bg-bg-surface focus:outline-none focus:ring-2 focus:ring-[#D4527A] focus:ring-offset-2 md:left-7" aria-label="Show previous hero image">
          <ChevronLeft size={21} />
        </button>
        <button type="button" onClick={showNextHero} className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-bg-surface/80 text-text-main shadow-sm backdrop-blur-sm transition hover:bg-bg-surface focus:outline-none focus:ring-2 focus:ring-[#D4527A] focus:ring-offset-2 md:right-7" aria-label="Show next hero image">
          <ChevronRight size={21} />
        </button>
        <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/60 bg-bg-surface/75 px-3 py-2 shadow-sm backdrop-blur-sm md:bottom-7">
          {heroSlides.map((slide, index) => (
            <button key={slide.image} type="button" onClick={() => setHeroIndex(index)} className={`h-2 rounded-full transition-all ${index === heroIndex ? 'w-6 bg-[#B94B68]' : 'w-2 bg-[#B8AEAA] hover:bg-[#8F8581]'}`} aria-label={`Show hero image ${index + 1}`} aria-current={index === heroIndex ? 'true' : undefined} />
          ))}
          <button type="button" onClick={() => setIsHeroPaused((isPaused) => !isPaused)} className="ml-1 flex h-6 w-6 items-center justify-center rounded-full text-text-muted transition hover:bg-bg-surface hover:text-[#B94B68] focus:outline-none focus:ring-2 focus:ring-[#D4527A]" aria-label={isHeroPaused ? 'Play hero slideshow' : 'Pause hero slideshow'}>
            {isHeroPaused ? <Play size={12} fill="currentColor" /> : <Pause size={12} fill="currentColor" />}
          </button>
        </div>
      </section>

      <section className="bg-bg-surface px-5 py-16 md:px-8 md:py-20">
        <SectionHeading eyebrow="Find your favourites" title="Shop by category" />
        <div className="mx-auto grid max-w-[1320px] grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((category) => (
            <CategorySlideCard key={category.id} category={category} slideIndex={categorySlideIndex} />
          ))}
        </div>
        <div className="mx-auto mt-9 flex max-w-[1320px] flex-wrap items-center justify-center gap-2">
          <span className="mr-2 text-[12px] font-semibold uppercase tracking-[1.2px] text-text-muted">Shop for</span>
          {occasions.map(([name, id]) => <Link key={id} to={`/shop?occasion=${id}`} className="rounded-full border border-border-main bg-bg-primary px-4 py-2 text-[12px] font-medium text-text-muted transition-colors hover:border-[#D9909F] hover:text-[#B94B68]">{name}</Link>)}
        </div>
      </section>

      <section className="border-y border-[#EEE8E5] bg-bg-alt px-5 py-16 md:px-8 md:py-20">
        <SectionHeading eyebrow="Most loved" title="Customer favourites" />
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="mx-auto grid max-w-[1320px] grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {bestsellers.map((product) => <ProductCard key={product.id} product={product} />)}
        </motion.div>
        <div className="mt-9 text-center"><Link to="/shop" className="btn-secondary">View all jewellery</Link></div>
      </section>

      <section className="bg-bg-surface px-5 py-8 md:px-8">
        <div className="mx-auto grid max-w-[1320px] grid-cols-2 gap-4 md:gap-5 md:grid-cols-4">
          {promises.map((promise, idx) => {
            const Icon = promise.icon;
            return (
              <div key={idx} className="relative group overflow-hidden rounded-xl aspect-[5/2] md:aspect-[3/1] bg-pink-50 flex items-center justify-center p-4">
                <img src={promise.image} alt={promise.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/65 group-hover:bg-black/75 transition-colors duration-300" />
                <div className="relative z-10 flex flex-col items-center gap-2 md:gap-2 text-center">
                  <Icon size={22} className="text-[#F4A0B0] drop-shadow-md" />
                  <span className="font-serif text-[15px] md:text-[17px] text-white tracking-[0.5px] leading-tight drop-shadow-xl">
                    {promise.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Curated Collage Section */}
      <section className="bg-bg-surface px-5 py-16 md:px-8 md:py-24" ref={collageRef}>
        <div className="mx-auto max-w-[1320px]">
          <SectionHeading eyebrow="The Edit" title="Curated for you" align="center" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-12 auto-rows-[220px] md:auto-rows-[280px]">
            
            <div className="col-span-2 row-span-2 relative group overflow-hidden rounded-xl bg-bg-alt">
              <motion.img style={{ y: ySlow, scale: 1.25 }} src={c1} alt="Curated style 1" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.3]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-6 left-6 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                <span className="text-[11px] font-semibold uppercase tracking-[2px]">Signature Series</span>
                <h3 className="text-2xl font-serif mt-1">Elegance Defined</h3>
              </div>
            </div>

            <div className="col-span-1 row-span-1 relative group overflow-hidden rounded-xl bg-bg-alt">
              <motion.img style={{ y: yFast, scale: 1.25 }} src={c2} alt="Curated style 2" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.3]" />
            </div>

            <div className="col-span-1 row-span-2 relative group overflow-hidden rounded-xl bg-bg-alt">
              <motion.img style={{ y: ySlow, scale: 1.25 }} src={c3} alt="Curated style 3" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.3]" />
            </div>

            <div className="col-span-1 row-span-1 relative group overflow-hidden rounded-xl bg-bg-alt">
              <motion.img style={{ y: yFast, scale: 1.25 }} src={c4} alt="Curated style 4" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.3]" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                <span className="text-white font-serif text-lg tracking-wide drop-shadow-md">Details</span>
              </div>
            </div>

            <div className="col-span-2 relative group overflow-hidden rounded-xl bg-bg-alt">
              <motion.img style={{ y: ySlow, scale: 1.25 }} src={c5} alt="Curated style 5" className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.3]" />
            </div>

            <div className="col-span-2 relative group overflow-hidden rounded-xl bg-bg-alt">
              <motion.img style={{ y: yFast, scale: 1.25 }} src={c6} alt="Curated style 6" className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.3]" />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]">
                <span className="text-white font-serif text-2xl">Modern Classics</span>
                <MagneticButton className="mt-3">
                  <Link to="/shop" className="inline-block text-[11px] font-semibold uppercase tracking-widest text-white border-b border-white pb-1 hover:text-[#F4A0B0] hover:border-[#F4A0B0] transition-colors">Shop The Look</Link>
                </MagneticButton>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section className="group relative h-[450px] w-full overflow-hidden md:h-[600px]">
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
          <span className="font-serif text-xl tracking-[0.2em] text-white md:text-2xl uppercase">Sterling Cart</span>
        </div>

        <div className="absolute inset-0 flex items-center justify-end p-6 md:p-16 lg:pr-24">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-[480px] rounded-2xl border border-white/20 bg-black/30 p-8 text-left backdrop-blur-md md:p-12"
          >
            <h2 className="font-serif text-[36px] leading-tight text-white md:text-[46px]">Find the store</h2>
            <div className="mt-6 h-[1px] w-12 bg-bg-surface/40" />
            <p className="mt-6 text-[14px] leading-relaxed tracking-wide text-white/90 md:text-[15px]">
              Step into the world of Sterling Cart. Discover our latest collections, experience our craftsmanship up close, and enjoy personal styling sessions with our experts.
              <br/><br/>
              <strong className="text-white font-medium uppercase tracking-wider text-[13px]">Flagship Store</strong><br/>
              Roorkee, Uttarakhand 247667
            </p>
            <a href="#store-locator" className="mt-8 inline-block border border-white/60 bg-transparent px-8 py-3 text-[12px] font-semibold uppercase tracking-[1.5px] text-white transition-all hover:bg-bg-surface hover:text-black">
              Get Directions
            </a>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-[#EEE8E5] bg-bg-primary px-5 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-[1320px]">
          <div className="mb-8 flex items-end justify-between gap-4">
            <SectionHeading eyebrow="Kind words" title="Loved by our customers" align="left" />
            <div className="flex gap-2">
              <button onClick={() => setTestimonialIndex(Math.max(0, testimonialIndex - 1))} disabled={testimonialIndex === 0} className="h-10 w-10 rounded-full border border-border-main text-text-muted disabled:opacity-30">←</button>
              <button onClick={() => setTestimonialIndex(Math.min(maxIndex, testimonialIndex + 1))} disabled={testimonialIndex === maxIndex} className="h-10 w-10 rounded-full border border-border-main text-text-muted disabled:opacity-30">→</button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {visibleTestimonials.map((testimonial) => (
              <article key={testimonial.id} className="rounded-xl border border-border-main bg-bg-surface p-6">
                <StarRating rating={testimonial.rating} />
                <p className="mt-4 text-[14px] leading-6 text-text-muted">{testimonial.text}</p>
                <p className="mt-5 text-[13px] font-semibold text-text-main">{testimonial.name}</p>
                <p className="text-[12px] text-text-muted">{testimonial.city}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#1C1C2E] px-5 py-14 text-white md:px-8">
        <div className="mx-auto flex max-w-[920px] flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[2px] text-[#E7BCC5]">A little something extra</p>
            <h2 className="mt-2 font-serif text-[32px]">Get 10% off your first order.</h2>
            <p className="mt-2 text-[13px] text-white/60">New launches, thoughtful offers, no inbox clutter.</p>
          </div>
          <form onSubmit={handleSubscribe} className="flex w-full max-w-[390px] rounded-full bg-bg-surface p-1">
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required placeholder="Your email address" className="min-w-0 flex-1 rounded-full border-0 px-4 text-[13px] text-text-main outline-none" />
            <button className="rounded-full bg-[#D4527A] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.6px] text-white">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  );
}

function SectionHeading({ eyebrow, title, align = 'center' }) {
  return (
    <div className={`mb-9 ${align === 'left' ? 'text-left' : 'text-center'}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[2px] text-[#B94B68]">{eyebrow}</p>
      <h2 className="mt-2 font-serif text-[34px] leading-tight tracking-[-0.3px] text-text-main md:text-[40px]">{title}</h2>
      {align === 'left' && <Link to="/shop" className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold uppercase tracking-[0.7px] text-[#B94B68]">Browse all <ArrowRight size={14} /></Link>}
    </div>
  );
}

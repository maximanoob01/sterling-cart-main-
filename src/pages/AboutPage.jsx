import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Shield, Gem, Heart, Home, ChevronRight, Send, Sparkles, Award, Users, Star } from 'lucide-react';
import aboutHero from '../assets/images/about_hero.webp';
import teamAarti from '../assets/images/team_aarti.png';
import teamRahul from '../assets/images/team_rahul.png';
import teamSneha from '../assets/images/team_sneha.png';
import teamVikram from '../assets/images/team_vikram.png';
import toast from 'react-hot-toast';
import SEO from '../components/seo/SEO';

/* ── Animation variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } };

/* ── Data ── */
const values = [
  {
    icon: Shield,
    title: 'Purity',
    description: 'Every piece in our collection is crafted from genuine 925 sterling silver — hallmarked and certified. We never compromise on the quality of our metals, ensuring your jewellery stays beautiful for years to come.',
    gradient: 'from-rose-400 to-pink-600',
    bgGlow: 'rgba(212,82,122,0.12)',
  },
  {
    icon: Gem,
    title: 'Craftsmanship',
    description: 'Our artisans bring decades of experience to every design. From delicate filigree work to precision stone setting, each piece is a testament to the art of fine jewellery making passed down through generations.',
    gradient: 'from-violet-400 to-purple-600',
    bgGlow: 'rgba(139,92,246,0.12)',
  },
  {
    icon: Heart,
    title: 'Customer Love',
    description: 'You are at the heart of everything we do. From curated collections to premium packaging, we pour love into every detail — because your joy in wearing our jewellery is our greatest reward.',
    gradient: 'from-amber-400 to-orange-500',
    bgGlow: 'rgba(245,158,11,0.12)',
  },
];

const teamMembers = [
  { name: 'Aarti Desai',   role: 'Founder & Creative Director', photo: teamAarti,  quote: '"Jewellery is emotion, made tangible."' },
  { name: 'Rahul Menon',   role: 'Head of Design',              photo: teamRahul,  quote: '"Every curve has a reason."' },
  { name: 'Sneha Kapoor',  role: 'Lead Artisan',                photo: teamSneha,  quote: '"Hands remember what eyes forget."' },
  { name: 'Vikram Joshi',  role: 'Customer Experience',         photo: teamVikram, quote: '"Delight is in the details."' },
];

const stats = [
  { value: '50K+', label: 'Happy Customers', icon: Users },
  { value: '2022', label: 'Founded In',       icon: Award },
  { value: '925',  label: 'Silver Purity',    icon: Star },
  { value: '100%', label: 'Hallmarked',       icon: Sparkles },
];

const milestones = [
  { year: '2020', title: 'Born in Jaipur', desc: 'A small home studio, a big dream. Aarti Desai crafted the first collection by hand.' },
  { year: '2021', title: 'Going Digital',  desc: 'Sterling Kart launched online, bringing artisan silver to doorsteps across India.' },
  { year: '2022', title: 'BIS Certified',  desc: 'Every piece earned BIS hallmarking — India\'s gold standard for precious metals.' },
  { year: '2023', title: '25K Milestone',  desc: 'We celebrated 25,000 customers and expanded into bridal collections.' },
  { year: '2024', title: 'All-India Love', desc: 'Shipping to every Indian pin code, with same-day dispatch from our Jaipur workshop.' },
];

/* ── Animated stat counter ── */
function StatCard({ stat, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const Icon = stat.icon;
  return (
    <motion.div
      ref={ref}
      className="relative flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-5 rounded-xl sm:rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.04, background: 'rgba(255,255,255,0.10)' }}
    >
      {/* glow blob */}
      <div className="absolute -top-6 -right-6 w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-pink-400/20 blur-xl sm:blur-2xl pointer-events-none" />
      <div className="w-6 h-6 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-white/10 flex items-center justify-center">
        <Icon size={12} className="text-pink-300 sm:hidden" />
        <Icon size={17} className="text-pink-300 hidden sm:block" />
      </div>
      <span className="text-[13px] sm:text-2xl font-serif text-white font-semibold tracking-tight">{stat.value}</span>
      <span className="text-[7px] sm:text-[10px] text-center leading-tight font-sans text-white/60 uppercase tracking-wider sm:tracking-widest">{stat.label}</span>
    </motion.div>
  );
}

/* ── Team card ── */
function TeamCard({ member, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      className="group relative flex flex-col items-center"
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.13, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Photo frame */}
      <div className="relative w-48 h-48 sm:w-52 sm:h-52 mb-6">
        {/* Decorative ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-300 via-pink-400 to-pink-500 p-[3px] group-hover:scale-105 transition-transform duration-500">
          <div className="w-full h-full rounded-full overflow-hidden bg-pink-50">
            <img
              src={member.photo}
              alt={member.name}
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
        {/* Floating sparkle */}
        <motion.div
          className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center"
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: index * 0.4 }}
        >
          <Sparkles size={16} className="text-pink-400" />
        </motion.div>
      </div>

      <h4 className="font-serif text-charcoal text-xl text-center">{member.name}</h4>
      <p className="text-silver-500 text-sm font-sans mt-1 uppercase tracking-wider text-center">{member.role}</p>

      {/* Quote on hover */}
      <motion.p
        className="mt-3 text-xs font-sans text-silver-600 italic text-center max-w-[180px] leading-relaxed"
        initial={{ opacity: 0, y: 6 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 + index * 0.1 }}
      >
        {member.quote}
      </motion.p>
    </motion.div>
  );
}

/* ── Main page ── */
const AboutPage = () => {
  const [email, setEmail] = useState('');
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroScale  = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email address'); return; }
    toast.success('Thank you for subscribing! 💌', {
      style: { background: '#FFF0F5', color: '#2D2D2D', border: '1px solid #FFF0F5' },
      iconTheme: { primary: '#F4A0B0', secondary: '#FFF' },
    });
    setEmail('');
  };

  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How can I verify the authenticity of Sterling Kart silver?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Every piece of jewellery from Sterling Kart is BIS hallmarked and comes with a certificate of authenticity guaranteeing it is 92.5% pure silver."
          }
        },
        {
          "@type": "Question",
          "name": "Is your jewellery hypoallergenic?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, our 925 sterling silver is hypoallergenic and 100% nickel-free, making it completely safe for sensitive skin."
          }
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-bg-surface pb-20 sm:pb-0 overflow-x-hidden">
      <SEO
        title="About Us | Sterling Kart - Authentic 925 Silver"
        description="Learn about Sterling Kart's legacy, our exquisite craftsmanship, and our dedication to providing authentic, hallmarked 925 sterling silver jewellery."
        schemas={schemas}
      />

      {/* ── Breadcrumb ── */}
      <div className="bg-pink-50 border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm font-sans">
            <Link to="/" className="text-silver-500 hover:text-pink-400 transition-colors flex items-center gap-1">
              <Home size={14} /> Home
            </Link>
            <ChevronRight size={14} className="text-silver-400" />
            <span className="text-charcoal font-medium">About Us</span>
          </nav>
        </div>
      </div>

      {/* ── Cinematic Hero ── */}
      <section ref={heroRef} className="relative w-full h-[50vh] min-h-[350px] md:h-[70vh] md:min-h-[480px] overflow-hidden">
        <motion.div className="absolute inset-0" style={{ scale: heroScale }}>
          <img
            src={aboutHero}
            alt="About Sterling Kart"
            className="w-full h-full object-cover"
          />
        </motion.div>
        {/* layered gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/20 via-charcoal/40 to-charcoal/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/30 to-transparent" />

        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
          style={{ opacity: heroOpacity }}
        >
          {/* eyebrow */}
          <motion.div
            className="flex items-center gap-2 mb-4 md:mb-5"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="h-px w-6 md:w-10 bg-pink-300/80" />
            <span className="text-pink-300 text-[9px] sm:text-[10px] md:text-xs font-sans uppercase tracking-[0.2em] sm:tracking-[0.35em] text-center max-w-[200px] sm:max-w-none">Est. 2022 · A Unit of Pal Gems, Roorkee</span>
            <div className="h-px w-6 md:w-10 bg-pink-300/80" />
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl md:text-7xl font-serif text-white mb-3 md:mb-5 drop-shadow-xl leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            Our Story
          </motion.h1>

          <motion.p
            className="text-white/85 text-base sm:text-lg md:text-xl max-w-lg font-sans leading-relaxed px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55 }}
          >
            Crafting timeless silver jewellery with love since 2022
          </motion.p>
        </motion.div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="relative bg-charcoal py-8 sm:py-14 overflow-hidden">
        {/* subtle pattern */}
        <div className="absolute inset-0 bg-pattern-diamond-dark opacity-60 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {stats.map((s, i) => <StatCard key={s.label} stat={s} index={i} />)}
          </div>
        </div>
      </section>

      {/* ── Brand Story ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <motion.div
          className="space-y-8 text-center flex flex-col items-center"
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
        >
          {/* section label */}
          <motion.div className="flex items-center justify-center gap-3" variants={fadeUp}>
            <div className="w-8 h-[2px] bg-pink-400 rounded-full" />
            <span className="text-pink-400 text-xs uppercase tracking-[0.3em] font-sans font-semibold">The Beginning</span>
            <div className="w-8 h-[2px] bg-pink-400 rounded-full" />
          </motion.div>

          <motion.h2
            className="text-4xl sm:text-5xl font-serif text-charcoal leading-tight"
            variants={fadeUp}
          >
            The Heart Behind<br />
            <span className="text-pink-400">Sterling Kart</span>
          </motion.h2>

          <motion.div className="w-20 h-[2px] bg-pink-300 mx-auto" variants={fadeUp} />

          <motion.p className="text-silver-600 leading-relaxed text-base sm:text-lg font-sans max-w-3xl" variants={fadeUp}>
            Sterling Kart was born from a simple yet powerful belief — that every woman deserves access to
            beautiful, high-quality silver jewellery without breaking the bank. What started as a small passion
            project in a home studio in Jaipur has blossomed into a beloved brand trusted by thousands of
            women across India. Our founder, Aarti Desai, grew up watching her grandmother's hands transform raw
            silver into breathtaking ornaments, and that spark of wonder never left her.
          </motion.p>

          <motion.p className="text-silver-600 leading-relaxed text-base sm:text-lg font-sans max-w-3xl" variants={fadeUp}>
            Today, we work with a close-knit team of skilled artisans who share our obsession with perfection.
            Every ring, necklace, and earring in our collection is hand-finished and inspected to meet our exacting
            standards. We source only 925 sterling silver — the international benchmark for quality — and pair it
            with ethically sourced stones to create pieces that are as pure as they are stunning. From minimalist
            everyday elegance to show-stopping bridal sets, our collections are designed for the modern Indian woman.
          </motion.p>

          <motion.p className="text-silver-600 leading-relaxed text-base sm:text-lg font-sans max-w-3xl" variants={fadeUp}>
            But Sterling Kart is more than a jewellery store — it's a community. We celebrate the stories our
            customers share: the first piece of silver a mother gifts her daughter, the earrings worn on a first
            date, the bracelet that becomes a daily talisman. These moments of connection and joy are what drive
            us to keep creating, keep innovating, and keep pouring our hearts into every design.
          </motion.p>
        </motion.div>
      </section>


      {/* ── Values ── */}
      <section className="py-10 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-8 md:mb-12"
            initial="hidden" whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
          >
            <motion.div className="flex items-center justify-center gap-3 mb-1" variants={fadeUp}>
              <div className="w-8 h-[2px] bg-pink-400 rounded-full" />
              <span className="text-pink-400 text-xs uppercase tracking-[0.3em] font-sans font-semibold">Our Principles</span>
              <div className="w-8 h-[2px] bg-pink-400 rounded-full" />
            </motion.div>
            <motion.h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-charcoal" variants={fadeUp}>
              What We Stand For
            </motion.h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8"
            initial="hidden" whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
          >
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div
                  key={v.title}
                  className="relative group rounded-2xl p-5 sm:p-8 overflow-hidden border border-pink-100 bg-bg-surface hover:border-pink-200 transition-all duration-500 hover:shadow-xl"
                  variants={fadeUp}
                  custom={i}
                  whileHover={{ y: -6 }}
                >
                  {/* glow blob */}
                  <div
                    className="absolute -top-10 -right-10 w-36 h-36 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: v.bgGlow }}
                  />
                  {/* icon */}
                  <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${v.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={20} className="text-white sm:hidden" />
                    <Icon size={26} className="text-white hidden sm:block" />
                  </div>
                  <h3 className="text-base sm:text-xl font-serif text-charcoal mb-2">{v.title}</h3>
                  <p className="text-silver-600 leading-relaxed font-sans text-xs sm:text-[15px]">{v.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-pink-50/60 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="hidden" whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
          >
            <motion.div className="flex items-center justify-center gap-3 mb-4" variants={fadeUp}>
              <div className="w-8 h-[2px] bg-pink-400 rounded-full" />
              <span className="text-pink-400 text-xs uppercase tracking-[0.3em] font-sans font-semibold">The People</span>
              <div className="w-8 h-[2px] bg-pink-400 rounded-full" />
            </motion.div>
            <motion.h2 className="text-3xl sm:text-4xl font-serif text-charcoal mb-3" variants={fadeUp}>
              Meet the Team
            </motion.h2>
            <motion.p className="text-silver-600 font-sans max-w-md mx-auto text-[15px]" variants={fadeUp}>
              The passionate people who bring Sterling Kart to life every day.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-14">
            {teamMembers.map((m, i) => <TeamCard key={m.name} member={m} index={i} />)}
          </div>
        </div>
      </section>

      {/* ── Newsletter CTA ── */}
      <section className="relative bg-charcoal py-20 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-pattern-diamond-dark opacity-40 pointer-events-none" />
        {/* ambient glows */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden" whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
          >
            <motion.div className="flex items-center justify-center gap-3 mb-5" variants={fadeUp}>
              <div className="h-px w-8 bg-pink-400/60" />
              <span className="text-pink-400 text-xs uppercase tracking-[0.3em] font-sans font-semibold">Stay Connected</span>
              <div className="h-px w-8 bg-pink-400/60" />
            </motion.div>

            <motion.h2 className="text-3xl sm:text-4xl font-serif text-white mb-4" variants={fadeUp}>
              Stay in the Loop
            </motion.h2>

            <motion.p className="text-white/60 font-sans mb-10 max-w-md mx-auto leading-relaxed" variants={fadeUp}>
              Subscribe to our newsletter for exclusive offers, new arrivals, and styling tips delivered straight to your inbox.
            </motion.p>

            <motion.form
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              onSubmit={handleNewsletter}
              variants={fadeUp}
            >
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-5 py-3 rounded-full bg-white/8 border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-pink-300 focus:ring-1 focus:ring-pink-300 transition-colors font-sans text-sm"
              />
              <button type="submit" className="btn-primary whitespace-nowrap">
                <Send size={15} /> Subscribe
              </button>
            </motion.form>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

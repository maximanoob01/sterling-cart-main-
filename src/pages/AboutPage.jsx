import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Gem, Heart, Home, ChevronRight, Send } from 'lucide-react';
import aboutHero from '../assets/images/about_hero.png';
import toast from 'react-hot-toast';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: 'easeOut' },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const values = [
  {
    icon: Shield,
    title: 'Purity',
    description:
      'Every piece in our collection is crafted from genuine 925 sterling silver — hallmarked and certified. We never compromise on the quality of our metals, ensuring your jewellery stays beautiful for years to come.',
  },
  {
    icon: Gem,
    title: 'Craftsmanship',
    description:
      'Our artisans bring decades of experience to every design. From delicate filigree work to precision stone setting, each piece is a testament to the art of fine jewellery making passed down through generations.',
  },
  {
    icon: Heart,
    title: 'Customer Love',
    description:
      'You are at the heart of everything we do. From curated collections to premium packaging, we pour love into every detail — because your joy in wearing our jewellery is our greatest reward.',
  },
];

const teamMembers = [
  { name: 'Aarti Desai', role: 'Founder & Creative Director', initials: 'AD' },
  { name: 'Rahul Menon', role: 'Head of Design', initials: 'RM' },
  { name: 'Sneha Kapoor', role: 'Lead Artisan', initials: 'SK' },
  { name: 'Vikram Joshi', role: 'Customer Experience', initials: 'VJ' },
];

const AboutPage = () => {
  const [email, setEmail] = useState('');

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    toast.success('Thank you for subscribing! 💌', {
      style: { background: '#FFF0F5', color: '#2D2D2D', border: '1px solid #FFE4EE' },
      iconTheme: { primary: '#F4A0B0', secondary: '#FFF' },
    });
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-bg-surface">
      {/* Breadcrumb */}
      <div className="bg-pink-50 border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-sm font-sans">
            <Link to="/" className="text-silver-500 hover:text-pink-400 transition-colors flex items-center gap-1">
              <Home size={14} />
              Home
            </Link>
            <ChevronRight size={14} className="text-silver-400" />
            <span className="text-charcoal font-medium">About Us</span>
          </nav>
        </div>
      </div>

      {/* Hero Banner */}
      <motion.section
        className="relative w-full h-[320px] sm:h-[400px] md:h-[480px] overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <img
          src={aboutHero}
          alt="About Sterling Cart"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/30 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-serif text-white mb-4 drop-shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            Our Story
          </motion.h1>
          <motion.p
            className="text-white/90 text-lg sm:text-xl max-w-xl font-sans"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            Crafting timeless silver jewellery with love since 2020
          </motion.p>
        </div>
      </motion.section>

      {/* Brand Story */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <motion.div
          className="space-y-6 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={staggerContainer}
        >
          <motion.h2
            className="text-3xl sm:text-4xl font-serif text-charcoal"
            variants={fadeInUp}
          >
            The Heart Behind Sterling Cart
          </motion.h2>
          <motion.div className="w-16 h-0.5 bg-pink-300 mx-auto" variants={fadeInUp} />
          <motion.p className="text-silver-600 leading-relaxed text-base sm:text-lg font-sans" variants={fadeInUp}>
            Sterling Cart was born from a simple yet powerful belief — that every woman deserves access to
            beautiful, high-quality silver jewellery without breaking the bank. What started as a small passion
            project in a home studio in Jaipur has blossomed into a beloved brand trusted by thousands of
            women across India. Our founder, Aarti Desai, grew up watching her grandmother's hands transform raw
            silver into breathtaking ornaments, and that spark of wonder never left her.
          </motion.p>
          <motion.p className="text-silver-600 leading-relaxed text-base sm:text-lg font-sans" variants={fadeInUp}>
            Today, we work with a close-knit team of skilled artisans who share our obsession with perfection.
            Every ring, necklace, and earring in our collection is hand-finished and inspected to meet our exacting
            standards. We source only 925 sterling silver — the international benchmark for quality — and pair it
            with ethically sourced stones to create pieces that are as pure as they are stunning. From minimalist
            everyday elegance to show-stopping bridal sets, our collections are designed for the modern Indian woman.
          </motion.p>
          <motion.p className="text-silver-600 leading-relaxed text-base sm:text-lg font-sans" variants={fadeInUp}>
            But Sterling Cart is more than a jewellery store — it's a community. We celebrate the stories our
            customers share: the first piece of silver a mother gifts her daughter, the earrings worn on a first
            date, the bracelet that becomes a daily talisman. These moments of connection and joy are what drive
            us to keep creating, keep innovating, and keep pouring our hearts into every design.
          </motion.p>
        </motion.div>
      </section>

      {/* Values Section */}
      <section className="bg-pink-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12 md:mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
          >
            <motion.h2 className="text-3xl sm:text-4xl font-serif text-charcoal mb-4" variants={fadeInUp}>
              What We Stand For
            </motion.h2>
            <motion.div className="w-16 h-0.5 bg-pink-300 mx-auto" variants={fadeInUp} />
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
          >
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <motion.div
                  key={value.title}
                  className="bg-bg-surface rounded-2xl p-8 text-center shadow-pink hover:shadow-pink-lg transition-shadow duration-300"
                  variants={fadeInUp}
                  custom={index}
                >
                  <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-6">
                    <IconComponent size={28} className="text-pink-400" />
                  </div>
                  <h3 className="text-xl font-serif text-charcoal mb-3">{value.title}</h3>
                  <p className="text-silver-600 leading-relaxed font-sans text-sm sm:text-base">
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12 md:mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
          >
            <motion.h2 className="text-3xl sm:text-4xl font-serif text-charcoal mb-4" variants={fadeInUp}>
              Meet the Team
            </motion.h2>
            <motion.div className="w-16 h-0.5 bg-pink-300 mx-auto mb-4" variants={fadeInUp} />
            <motion.p className="text-silver-600 font-sans max-w-lg mx-auto" variants={fadeInUp}>
              The passionate people who bring Sterling Cart to life every day.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
          >
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                className="text-center group"
                variants={fadeInUp}
                custom={index}
              >
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-pink-200 to-pink-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform duration-300 shadow-pink">
                  <span className="text-2xl sm:text-3xl font-serif text-white font-bold">
                    {member.initials}
                  </span>
                </div>
                <h4 className="font-serif text-charcoal text-base sm:text-lg">{member.name}</h4>
                <p className="text-silver-500 text-sm font-sans mt-1">{member.role}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-charcoal py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={staggerContainer}
          >
            <motion.h2 className="text-3xl sm:text-4xl font-serif text-white mb-4" variants={fadeInUp}>
              Stay in the Loop
            </motion.h2>
            <motion.p className="text-silver-400 font-sans mb-8 max-w-md mx-auto" variants={fadeInUp}>
              Subscribe to our newsletter for exclusive offers, new arrivals, and styling tips delivered straight to your inbox.
            </motion.p>
            <motion.form
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              onSubmit={handleNewsletter}
              variants={fadeInUp}
            >
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-5 py-3 rounded-full bg-bg-surface/10 border border-silver-500/30 text-white placeholder-silver-500 focus:outline-none focus:border-pink-300 focus:ring-1 focus:ring-pink-300 transition-colors font-sans text-sm"
              />
              <button
                type="submit"
                className="btn-primary whitespace-nowrap"
              >
                <Send size={16} />
                Subscribe
              </button>
            </motion.form>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

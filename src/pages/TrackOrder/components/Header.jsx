import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ChevronRight, Sparkles } from 'lucide-react';
import { fadeInUp } from '../motion';

/**
 * Sticky breadcrumb with proper <nav>/<ol> semantics.
 * Uses `aria-current="page"` so screen readers announce
 * the current location correctly.
 */
function Breadcrumb() {
  return (
    <nav
      aria-label="Breadcrumb"
      className="bg-white/50 backdrop-blur-md border-b border-white/40
                 py-3 px-4 md:px-8 lg:px-16 text-sm text-charcoal
                 mb-8 sm:mb-10 
                 shadow-sm shadow-pink-900/5"
    >
      <ol className="max-w-5xl mx-auto flex items-center gap-2">
        <li>
          <Link
            to="/"
            className="flex items-center gap-1.5 hover:text-[#D4527A] transition-colors
                       font-medium rounded-md px-1 py-0.5
                       focus-visible:outline-none focus-visible:ring-2
                       focus-visible:ring-pink-300"
          >
            <Home size={16} aria-hidden />
            <span>Home</span>
          </Link>
        </li>
        <li aria-hidden className="text-silver-400">
          <ChevronRight size={14} />
        </li>
        <li aria-current="page" className="text-[#D4527A] font-bold">
          Track Order
        </li>
      </ol>
    </nav>
  );
}

/**
 * Page title + subtitle. Small "Live Tracking" badge gives
 * the page a sense of "now-ness" that matches the feature.
 */
function PageTitle() {
  return (
    <motion.header
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="text-center mb-10 sm:mb-12"
    >
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full
                   bg-pink-50 text-[#D4527A] text-[11px] font-bold
                   uppercase tracking-widest mb-4"
      >
        <Sparkles size={12} aria-hidden />
        Live Tracking
      </span>
      <h1
        className="font-serif text-4xl md:text-5xl font-bold text-charcoal
                   mb-3 sm:mb-4 tracking-tight drop-shadow-sm"
      >
        Order Tracking
      </h1>
      <p
        className="text-silver-500 text-sm md:text-base max-w-2xl mx-auto
                   leading-relaxed px-2"
      >
        Monitor the progress and location of your Sterling Kart purchases
        in real-time.
      </p>
    </motion.header>
  );
}

/** Composed: sticky breadcrumb on top, hero title below. */
export default function Header() {
  return (
    <>
      <Breadcrumb />
      <PageTitle />
    </>
  );
}

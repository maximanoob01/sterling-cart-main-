import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[80vh] bg-pink-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-lg"
      >
        {/* Silver Ring Illustration */}
        <div className="relative mx-auto w-48 h-48 mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          >
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <circle cx="100" cy="100" r="70" fill="none" stroke="#C0C0C0" strokeWidth="8" />
              <circle cx="100" cy="100" r="55" fill="none" stroke="#D0D0D0" strokeWidth="3" strokeDasharray="8 4" />
              <circle cx="100" cy="30" r="8" fill="#F4A0B0" />
            </svg>
          </motion.div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-serif text-5xl font-bold text-silver-400">404</span>
          </div>
        </div>

        <h1 className="font-serif text-3xl md:text-4xl font-bold text-charcoal mb-4">
          Oops, looks like this page went missing
        </h1>
        <p className="text-silver-500 text-lg mb-8">
          Like a dropped earring, this page seems to have disappeared. Let's get you back to our beautiful collection.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/" className="btn-primary px-8 py-3">
            <Home size={18} /> Back to Home
          </Link>
          <Link to="/shop" className="btn-secondary px-8 py-3">
            <ArrowLeft size={18} /> Browse Shop
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

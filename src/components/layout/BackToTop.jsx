import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={scrollToTop}
          className="fixed bottom-[calc(env(safe-area-inset-bottom)+96px)] right-4 z-[55] flex h-11 w-11 items-center justify-center rounded-full bg-[#F4A0B0] text-white shadow-[0_8px_24px_rgba(212,82,122,0.28)] transition-all duration-300 hover:-translate-y-[3px] hover:bg-[#D4527A] hover:shadow-[0_8px_24px_rgba(212,82,122,0.4)] md:bottom-[32px] md:right-[32px] md:h-[52px] md:w-[52px]"
          aria-label="Back to top"
        >
          <ArrowUp size={22} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

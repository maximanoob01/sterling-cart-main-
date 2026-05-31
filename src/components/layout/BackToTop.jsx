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
          className="fixed bottom-[32px] right-[32px] z-50 w-[52px] h-[52px] rounded-full bg-[#F4A0B0] text-white flex items-center justify-center hover:bg-[#D4527A] hover:-translate-y-[3px] hover:shadow-[0_8px_24px_rgba(212,82,122,0.4)] transition-all duration-300 cursor-pointer"
          aria-label="Back to top"
        >
          <ArrowUp size={22} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

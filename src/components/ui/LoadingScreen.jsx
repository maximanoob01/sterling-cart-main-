import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0A0A0A] overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
    >
      <div className="flex flex-col items-center z-10 p-4">
        <motion.h1
          className="brand-wordmark text-[28px] sm:text-[36px] md:text-[44px] text-white/90 tracking-widest text-center whitespace-nowrap"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          STERLING KART
        </motion.h1>
        
        {/* Subtle sleek loading line */}
        <div className="mt-8 mb-6 h-[1px] w-[120px] bg-white/10 relative overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full bg-white/60"
            initial={{ left: "-100%", width: "50%" }}
            animate={{ left: "200%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        
        <motion.p
          className="brand-submark text-[11px] md:text-[12px] text-white/40 tracking-[0.3em]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          925 SILVER JEWELS
        </motion.p>
      </div>
    </motion.div>
  );
}

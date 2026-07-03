import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0A0A0A] overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
    >
      {/* Subtle Breathing Background Glow */}
      <motion.div 
        className="absolute w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full blur-[100px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0) 70%)' }}
        animate={{ 
          scale: [1, 1.15, 1],
          opacity: [0.6, 1, 0.6]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="flex flex-col items-center z-10 p-4">
        {/* Silver Shimmering Wordmark */}
        <motion.h1
          className="brand-wordmark text-[28px] sm:text-[36px] md:text-[44px] tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#888] via-[#FFF] to-[#888] bg-[length:200%_auto] text-center whitespace-nowrap"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0, backgroundPosition: ['200% center', '-200% center'] }}
          transition={{ 
            opacity: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
            y: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
            backgroundPosition: { duration: 5, repeat: Infinity, ease: "linear" }
          }}
        >
          STERLING KART
        </motion.h1>
        
        {/* Symmetrical glowing loader line */}
        <div className="mt-8 mb-6 relative flex justify-center items-center h-[1px] w-[150px]">
          <div className="absolute inset-0 bg-white/10 rounded-full" />
          <motion.div
            className="absolute h-[2px] bg-gradient-to-r from-transparent via-white/80 to-transparent rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
            initial={{ width: "0%", opacity: 0 }}
            animate={{ width: ["0%", "100%", "0%"], opacity: [0, 1, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        
        <motion.p
          className="brand-submark text-[11px] md:text-[12px] text-white/40 tracking-[0.3em]"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          925 SILVER JEWELS
        </motion.p>
      </div>
    </motion.div>
  );
}

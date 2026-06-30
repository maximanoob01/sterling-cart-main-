import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0A0A0A] overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } }}
    >
      {/* Ambient animated background blur */}
      <motion.div 
        className="absolute w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-gradient-to-tr from-[#1A1A1A] to-[#111111] rounded-full blur-[80px] pointer-events-none"
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <div className="relative flex w-full max-w-[100vw] flex-col items-center z-10 p-4 sm:p-10">
        
        {/* Luxury Morphing Liquid Ring (UI UX Pro Max - Liquid Glass style) */}
        <motion.div
          className="absolute inset-0 -m-10 blur-[15px] opacity-40 mix-blend-screen pointer-events-none"
          style={{ background: 'conic-gradient(from 0deg at 50% 50%, rgba(212,82,122,0.4), rgba(212,82,122,0.1), rgba(255,255,255,0.2), rgba(212,82,122,0.4))' }}
          animate={{
            rotate: 360,
            borderRadius: ["40% 60% 70% 30%", "60% 40% 50% 50%", "50% 50% 40% 60%", "40% 60% 70% 30%"],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        
        <motion.div 
          className="relative glass-dark px-6 py-10 sm:px-14 sm:py-12 rounded-3xl flex flex-col items-center border border-white/10 shadow-2xl backdrop-blur-2xl w-[90%] sm:w-auto"
          initial={{ y: 20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.h1
            className="brand-wordmark text-[24px] sm:text-[32px] md:text-[42px] text-white/90 drop-shadow-lg text-center whitespace-nowrap"
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
          >
            STERLING KART
          </motion.h1>
          
          <motion.div
            className="mt-6 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "140px", opacity: 1 }}
            transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.6 }}
          />
          
          <motion.p
            className="brand-submark mt-6 text-[11px] md:text-[12px] text-white/50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
          >
            925 SILVER JEWELS
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
}

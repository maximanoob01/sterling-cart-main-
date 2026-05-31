import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-bg-primary"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: 'easeInOut' } }}
    >
      <div className="flex flex-col items-center">
        <motion.h1
          className="font-serif text-[32px] md:text-[42px] uppercase tracking-[0.2em] text-text-main"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          Sterling Cart
        </motion.h1>
        
        <motion.div
          className="mt-6 h-[1px] bg-[#D4527A]"
          initial={{ width: 0 }}
          animate={{ width: "80px" }}
          transition={{ duration: 1, ease: 'easeInOut', delay: 0.4 }}
        />
        
        <motion.p
          className="mt-6 text-[10px] md:text-[11px] font-semibold uppercase tracking-[3px] text-[#B94B68]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          925 Silver Jewels
        </motion.p>
      </div>
    </motion.div>
  );
}

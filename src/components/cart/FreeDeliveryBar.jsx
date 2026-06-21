import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Sparkles, PartyPopper } from 'lucide-react';
import { formatPrice } from '../../utils/formatPrice';

/**
 * FreeDeliveryBar
 * Props:
 *   subtotal  – current cart subtotal
 *   threshold – free-delivery threshold (default 2499)
 *   compact   – boolean: compact mode for checkout sidebar
 */
export default function FreeDeliveryBar({ subtotal, threshold = 2499, compact = false }) {
  const remaining = Math.max(0, threshold - subtotal);
  const pct = Math.min(100, (subtotal / threshold) * 100);
  const isUnlocked = remaining === 0;

  // Progress gradient stops based on fill
  const barColor = isUnlocked
    ? 'from-[#22C55E] to-[#16A34A]'
    : pct > 60
    ? 'from-[#F4A0B0] to-[#D4527A]'
    : 'from-[#FBBF24] to-[#F59E0B]';

  return (
    <div className={`relative overflow-hidden rounded-[20px] ${compact ? 'p-[14px]' : 'p-[18px]'} ${
      isUnlocked
        ? 'bg-gradient-to-r from-[#F0FDF4] to-[#DCFCE7] border border-[#86EFAC]/60'
        : 'bg-gradient-to-r from-[#FFF0F5] to-[#FDF5F8] border border-[#F4A0B0]/30'
    }`}>

      {/* Ambient glow blob */}
      <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full blur-[32px] pointer-events-none ${
        isUnlocked ? 'bg-[#22C55E]/25' : 'bg-[#F4A0B0]/30'
      }`} />

      {/* Top row */}
      <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <AnimatePresence mode="wait">
            {isUnlocked ? (
              <motion.div
                key="unlocked"
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#22C55E] text-white shadow-[0_2px_10px_rgba(34,197,94,0.4)]"
              >
                <PartyPopper size={14} />
              </motion.div>
            ) : (
              <motion.div
                key="truck"
                initial={{ x: -6, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 6, opacity: 0 }}
                className={`flex h-7 w-7 items-center justify-center rounded-full ${
                  pct > 60 ? 'bg-[#D4527A] text-white' : 'bg-[#FEF3C7] text-[#D97706]'
                } shadow-sm`}
              >
                <Truck size={14} />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {isUnlocked ? (
              <motion.p
                key="msg-unlocked"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className={`font-sans font-bold ${compact ? 'text-[12px]' : 'text-[13px]'} text-[#16A34A] leading-tight`}
              >
                🎉 FREE delivery unlocked!
              </motion.p>
            ) : (
              <motion.p
                key="msg-pending"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className={`font-sans font-medium ${compact ? 'text-[11.5px]' : 'text-[12.5px]'} text-text-main leading-tight`}
              >
                Add{' '}
                <span className="font-bold text-[#D4527A]">{formatPrice(remaining)}</span>
                {' '}more for{' '}
                <span className="font-bold text-text-main">FREE delivery</span>
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Right-side label */}
        <span className={`shrink-0 font-sans font-bold ${compact ? 'text-[10px]' : 'text-[11px]'} ${
          isUnlocked ? 'text-[#16A34A]' : 'text-text-muted'
        } tabular-nums`}>
          {isUnlocked ? 'Saved ₹69' : `₹${Math.round(subtotal).toLocaleString('en-IN')} / ₹2,499`}
        </span>
      </div>

      {/* Progress track */}
      <div className="relative h-[8px] w-full rounded-full bg-white/80 shadow-inner overflow-hidden">
        {/* Shimmer on incomplete bar */}
        {!isUnlocked && (
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <motion.div
              className="absolute top-0 h-full w-[60px] bg-gradient-to-r from-transparent via-white/60 to-transparent"
              animate={{ x: ['-60px', '100%'] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'linear', repeatDelay: 0.4 }}
            />
          </div>
        )}

        {/* Fill bar */}
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${barColor} shadow-sm relative overflow-hidden`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
        >
          {/* Pulse on unlock */}
          {isUnlocked && (
            <motion.div
              className="absolute inset-0 bg-white/30"
              animate={{ opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            />
          )}
        </motion.div>

        {/* Truck milestone marker */}
        {!isUnlocked && (
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center"
            style={{ left: '100%' }}
          >
            <div className="w-[18px] h-[18px] -mt-[5px] rounded-full bg-white border-2 border-[#F4A0B0]/60 flex items-center justify-center shadow-sm">
              <Truck size={9} className="text-[#D4527A]" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Milestone chips (only on non-compact) */}
      {!compact && !isUnlocked && (
        <div className="flex justify-between mt-2 relative z-10">
          <span className="text-[9px] font-bold text-text-muted/60 uppercase tracking-[0.8px]">₹0</span>
          <span className="text-[9px] font-bold text-[#D4527A]/70 uppercase tracking-[0.8px] flex items-center gap-0.5">
            <Sparkles size={8} />₹2,499 Free
          </span>
        </div>
      )}

      {/* Unlock sparkle burst (only plays once on unlock) */}
      <AnimatePresence>
        {isUnlocked && (
          <motion.div
            key="sparkles"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none overflow-hidden rounded-[20px]"
          >
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-[#22C55E]"
                style={{
                  left: `${15 + i * 14}%`,
                  top: '50%',
                }}
                initial={{ y: 0, scale: 0, opacity: 1 }}
                animate={{
                  y: [-2, -18, -28],
                  scale: [0, 1.2, 0],
                  opacity: [1, 0.8, 0],
                }}
                transition={{
                  duration: 0.7,
                  delay: i * 0.07,
                  ease: 'easeOut',
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

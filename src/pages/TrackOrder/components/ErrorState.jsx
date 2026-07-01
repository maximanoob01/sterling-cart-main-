import { motion } from 'framer-motion';
import { Package, LifeBuoy, RefreshCcw } from 'lucide-react';

import { collapse } from '../motion';

/**
 * Friendly error card shown when the order can't be found.
 * Always offers an exit ramp (try again / contact support)
 * so the user never feels stuck.
 */
export default function ErrorState({ message, onRetry }) {
  return (
    <motion.div
      variants={collapse}
      initial="hidden"
      animate="visible"
      exit="exit"
      role="alert"
      className="bg-red-50/90 backdrop-blur-md text-red-600
                 p-6 sm:p-8 rounded-2xl text-center
                 mb-10 overflow-hidden border border-red-100
                 max-w-3xl mx-auto shadow-lg shadow-red-900/5"
    >
      <Package size={28} className="mx-auto mb-2 opacity-60" aria-hidden />
      <h3 className="font-bold text-sm mb-1">Order Not Found</h3>
      <p className="text-xs font-medium mb-5 max-w-md mx-auto leading-relaxed">
        {message}
      </p>

      <div className="flex items-center justify-center gap-2 sm:gap-4 text-xs font-bold">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 text-red-500
                       hover:text-red-700 transition-colors
                       focus-visible:outline-none focus-visible:ring-2
                       focus-visible:ring-red-200 rounded-full px-2 py-1"
          >
            <RefreshCcw size={14} aria-hidden />
            Try again
          </button>
        )}
        <a
          href="/contact"
          className="inline-flex items-center gap-1.5 text-red-500
                     hover:text-red-700 transition-colors
                     focus-visible:outline-none focus-visible:ring-2
                     focus-visible:ring-red-200 rounded-full px-2 py-1"
        >
          <LifeBuoy size={14} aria-hidden />
          Contact support
        </a>
      </div>
    </motion.div>
  );
}

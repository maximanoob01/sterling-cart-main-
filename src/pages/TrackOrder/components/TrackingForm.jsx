import { useId } from 'react';
import { motion } from 'framer-motion';
import { Search, ShieldCheck, Loader2 } from 'lucide-react';

import { scaleIn } from '../motion';
import { inputClass, labelClass, primaryButtonClass } from '../theme';

/**
 * The two-field lookup form.
 *
 *  • Single row on desktop, stacked on mobile
 *  • Strong focus rings for keyboard users
 *  • Loading spinner lives IN the button (not over the whole form)
 *  • Inputs are uncontrolled — the page receives values via
 *    FormData, so the form is trivially resettable
 */
export default function TrackingForm({ onTrack, isLoading }) {
  const orderIdId = useId();
  const contactId = useId();

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onTrack({
      orderId:    fd.get('orderId'),
      contactInfo: fd.get('contactInfo'),
    });
  };

  return (
    <motion.form
      key="track-form"
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      onSubmit={handleSubmit}
      noValidate
      aria-label="Track your order"
      className="max-w-3xl mx-auto bg-white/80 backdrop-blur-xl
                 border border-white/80 rounded-[2rem] p-6 md:p-8 mb-10
                 shadow-[0_20px_50px_rgb(212,82,122,0.08)]"
    >
      <div className="flex flex-col md:flex-row gap-5 items-end">
        <div className="flex-1 w-full">
          <label htmlFor={orderIdId} className={labelClass}>
            Order ID
          </label>
          <div className="relative">
            <Search
              size={18}
              aria-hidden
              className="absolute left-5 top-1/2 -translate-y-1/2 text-silver-400"
            />
            <input
              id={orderIdId}
              name="orderId"
              type="text"
              placeholder="e.g. SC-ORD-10001"
              autoComplete="off"
              spellCheck={false}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex-1 w-full">
          <label htmlFor={contactId} className={labelClass}>
            Email or Phone
          </label>
          <div className="relative">
            <ShieldCheck
              size={18}
              aria-hidden
              className="absolute left-5 top-1/2 -translate-y-1/2 text-silver-400"
            />
            <input
              id={contactId}
              name="contactInfo"
              type="text"
              placeholder="Used during checkout"
              autoComplete="email"
              className={inputClass}
            />
          </div>
        </div>

        <button type="submit" disabled={isLoading} className={primaryButtonClass}>
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" aria-hidden />
              <span className="sr-only">Tracking order…</span>
            </>
          ) : (
            'Track Order'
          )}
        </button>
      </div>
    </motion.form>
  );
}

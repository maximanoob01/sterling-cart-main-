import { motion } from 'framer-motion';
import { ShieldCheck, Truck, Tag } from 'lucide-react';

import { fadeInUp } from '../motion';
import { formatPrice } from '../../../utils/formatPrice';
import { cardClass } from '../theme';

/**
 * Order summary section.
 *
 * Two side-by-side cards on desktop (Charges + Totals), stacked
 * on mobile. The totals card is gradient-tinted to subtly
 * differentiate it as the "final" amount.
 */
export default function OrderSummary({
  order,
  discount = 0,
  deliveryFee = 0,
}) {
  return (
    <motion.section
      variants={fadeInUp}
      className="flex flex-col md:flex-row gap-4 md:gap-6"
      aria-label="Order summary"
    >
      {/* Charges */}
      <div
        className={`${cardClass} flex-1 flex flex-col justify-center gap-5`}
      >
        <SummaryRow
          icon={<Tag size={14} aria-hidden />}
          label="Discount"
          value={`-${formatPrice(discount)}`}
          valueClass="text-green-600 bg-green-50"
        />
        <SummaryRow
          icon={<Truck size={14} aria-hidden />}
          label="Delivery"
          value={formatPrice(deliveryFee)}
        />
      </div>

      {/* Totals */}
      <div
        className={`${cardClass} flex-1 bg-gradient-to-br
                    from-white/90 to-pink-50/50 border-pink-100`}
      >
        <SummaryRow
          icon={<ShieldCheck size={14} aria-hidden />}
          label="Subtotal"
          value={formatPrice(order.total)}
          valueClass="text-base"
        />
        <div
          className="flex justify-between items-center border-t
                     border-silver-200/60 pt-5"
        >
          <span className="font-bold text-charcoal text-base">Total</span>
          <span
            className="font-bold text-xl text-[#D4527A] drop-shadow-sm"
          >
            {formatPrice(order.total)}
          </span>
        </div>
      </div>
    </motion.section>
  );
}

/** A single label/value row. Used in both summary cards. */
function SummaryRow({ icon, label, value, valueClass = '' }) {
  return (
    <div className="flex justify-between items-center">
      <span
        className="text-sm font-bold text-silver-400 uppercase
                   tracking-widest inline-flex items-center gap-1.5"
      >
        {icon}
        {label}
      </span>
      <span
        className={`font-bold text-charcoal ${valueClass}
                    px-3 py-1 rounded-lg text-sm`}
      >
        {value}
      </span>
    </div>
  );
}

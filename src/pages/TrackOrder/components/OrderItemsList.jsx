import { motion } from 'framer-motion';
import { Package } from 'lucide-react';

import { fadeInUp } from '../motion';
import { formatPrice } from '../../../utils/formatPrice';
import { cardClass } from '../theme';

/**
 * Items-in-the-order section.
 *
 *  • Desktop: a clean 4-column table layout
 *  • Mobile: each item becomes a self-contained card with its
 *    own label/value rows
 */
export default function OrderItemsList({ items = [] }) {
  return (
    <motion.section
      variants={fadeInUp}
      className="flex flex-col gap-4"
      aria-label="Items in this order"
    >
      <h3 className="font-serif text-xl font-bold text-charcoal ml-2">
        Items Ordered
      </h3>

      <div className={`${cardClass} p-0 overflow-hidden`}>
        {/* Desktop table header */}
        <div
          className="hidden md:grid grid-cols-12 gap-6 bg-silver-50/50
                     py-4 px-8 border-b border-silver-100
                     text-[11px] uppercase tracking-widest font-bold
                     text-silver-400"
        >
          <div className="col-span-6">Product Details</div>
          <div className="col-span-2 text-center">Size</div>
          <div className="col-span-2 text-center">Quantity</div>
          <div className="col-span-2 text-right">Price</div>
        </div>

        <ul className="divide-y divide-silver-100/50">
          {items.length === 0 ? (
            <li className="p-8 text-center text-sm text-silver-400">
              No items found for this order.
            </li>
          ) : (
            items.map((item, idx) => (
              <ItemRow key={item.productId || idx} item={item} index={idx} />
            ))
          )}
        </ul>
      </div>
    </motion.section>
  );
}

/* ───────────── Sub-components ───────────── */

function ItemRow({ item, index }) {
  const qty   = item.qty ?? item.quantity ?? 1;
  const image = item.image || item.imageUrl;

  return (
    <li
      className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 md:px-8
                 items-center hover:bg-white/50 transition-colors"
    >
      {/* Product (image + name) */}
      <div className="md:col-span-6 flex gap-5 items-center">
        <div
          className="w-20 h-20 bg-silver-50 rounded-2xl overflow-hidden
                     flex-shrink-0 border border-silver-100 shadow-sm"
        >
          {image ? (
            <img
              src={image}
              alt={item.name}
              className="w-full h-full object-cover hover:scale-105
                         transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center
                         text-silver-300"
              aria-hidden
            >
              <Package size={24} />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p
            className="text-sm font-bold text-charcoal leading-snug
                       mb-1.5 line-clamp-2"
          >
            {item.name}
          </p>
          <p
            className="text-[11px] font-medium text-silver-400 uppercase
                       tracking-wide"
          >
            Product ID: {item.productId || `SK-${index + 100}`}
          </p>
        </div>
      </div>

      {/* Size / Qty / Price — cards on mobile, table cells on desktop */}
      <div className="grid grid-cols-3 md:contents gap-4 mt-4 md:mt-0">
        <Cell label="Size" mdCenter>
          <span
            className="font-bold text-sm text-charcoal bg-silver-50
                       md:bg-transparent px-3 py-1 md:p-0 rounded-lg
                       inline-block"
          >
            {item.size || '—'}
          </span>
        </Cell>

        <Cell label="Qty" mdCenter>
          <div
            className="inline-flex items-center gap-4 bg-silver-50
                       md:bg-transparent px-3 py-1 md:p-0 rounded-lg"
          >
            <span className="text-silver-300 font-bold select-none" aria-hidden>
              –
            </span>
            <span className="font-bold text-sm text-charcoal">
              {String(qty).padStart(2, '0')}
            </span>
            <span className="text-silver-300 font-bold select-none" aria-hidden>
              +
            </span>
          </div>
        </Cell>

        <Cell label="Price" mdRight>
          <span
            className="font-bold text-[15px] text-charcoal
                       px-3 py-1 md:p-0 rounded-lg inline-block"
          >
            {formatPrice(item.price)}
          </span>
        </Cell>
      </div>
    </li>
  );
}

/** Generic label/value cell. Renders inline on desktop, stacked on mobile. */
function Cell({ label, children, mdCenter, mdRight }) {
  const align = mdRight
    ? 'md:text-right'
    : mdCenter
    ? 'md:text-center'
    : '';
  return (
    <div
      className={`md:col-span-2 ${align} flex flex-col md:block`}
    >
      <span
        className="md:hidden text-[10px] text-silver-400 uppercase
                   font-bold mb-1 tracking-widest"
      >
        {label}
      </span>
      {children}
    </div>
  );
}

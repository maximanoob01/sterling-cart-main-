import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Copy, Check, ExternalLink } from 'lucide-react';

import { fadeInUp } from '../motion';
import { formatDate } from '../format';
import { cardClass } from '../theme';
import { generateInvoice } from '../../../utils/generateInvoice';

/**
 * Top-of-results card: invoice download + a clean 5-up meta grid.
 * If the order has been pushed to ShipRocket (awbCode present),
 * a "Live Tracking" button links to the courier tracker.
 */
export default function OrderDetailsCard({ order, currentStatus }) {
  const handleDownloadInvoice = () => {
    generateInvoice(order, null);
  };

  const trackingHref = order.trackingUrl || (order.awbCode ? `https://shiprocket.co/tracking/${order.awbCode}` : null);

  return (
    <motion.section
      variants={fadeInUp}
      className={cardClass}
      aria-label="Order details"
    >
      <header
        className="flex flex-col sm:flex-row justify-between items-start
                   sm:items-center mb-8 sm:mb-10 pb-6
                   border-b border-silver-100/50 gap-4"
      >
        <h3 className="font-serif text-xl font-bold text-charcoal">
          Order Details
        </h3>
        <div className="flex items-center gap-3 flex-wrap">
          {trackingHref && (
            <a
              href={trackingHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 bg-gradient-to-r
                         from-emerald-50 to-white border border-emerald-200
                         text-emerald-700 text-sm font-bold px-6 py-2.5 rounded-xl
                         hover:shadow-[0_4px_15px_rgb(16,185,129,0.2)]
                         hover:border-emerald-300 transition-all whitespace-nowrap
                         focus-visible:outline-none focus-visible:ring-4
                         focus-visible:ring-emerald-200"
            >
              <ExternalLink
                size={16}
                aria-hidden
                className="group-hover:translate-x-0.5 transition-transform"
              />
              Live Tracking
            </a>
          )}
          <button
            type="button"
            onClick={handleDownloadInvoice}
            disabled={order.orderStatus !== 'Delivered' && order.status !== 'Delivered'}
            title={order.orderStatus !== 'Delivered' && order.status !== 'Delivered' ? 'Invoice will be available after delivery' : ''}
            className={`group flex items-center gap-2 bg-gradient-to-r
                       from-pink-50 to-white border border-pink-100
                       text-[#D4527A] text-sm font-bold px-6 py-2.5 rounded-xl
                       hover:shadow-[0_4px_15px_rgb(212,82,122,0.15)]
                       hover:border-pink-200 transition-all whitespace-nowrap
                       focus-visible:outline-none focus-visible:ring-4
                       focus-visible:ring-pink-200
                       ${order.orderStatus !== 'Delivered' && order.status !== 'Delivered' ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
          >
            <Download
              size={16}
              aria-hidden
              className="group-hover:-translate-y-0.5 transition-transform"
            />
            Download Invoice
          </button>
        </div>
      </header>

      <dl className="grid grid-cols-2 md:grid-cols-5 gap-6 gap-y-8">
        <DetailCell
          label="Order Number"
          value={<OrderIdCell id={order.id} />}
        />
        <DetailCell label="Order Placed" value={formatDate(order.date)} />
        <DetailCell
          label="Total Items"
          value={`${order.items?.length || 0} items`}
        />
        <DetailCell
          label="Status"
          value={
            <span
              className="font-bold text-[13px] text-[#D4527A] capitalize
                         bg-pink-50 inline-block px-2 py-1 rounded-md"
            >
              {currentStatus}
            </span>
          }
        />
        <DetailCell
          label="Payment"
          value={order.paymentMethod || 'Paid Online'}
        />
      </dl>
    </motion.section>
  );
}

/** One label/value cell. Uses <dt>/<dd> for semantics. */
function DetailCell({ label, value }) {
  return (
    <div>
      <dt
        className="text-[11px] font-bold text-silver-400 uppercase
                   tracking-widest mb-2"
      >
        {label}
      </dt>
      <dd className="font-bold text-[13px] text-charcoal">{value}</dd>
    </div>
  );
}

/**
 * Order ID cell with a one-tap "copy" affordance.
 * Small detail, big quality-of-life win for support workflows.
 */
function OrderIdCell({ id }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(id));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — fail silently */
    }
  };

  return (
    <span className="inline-flex items-center gap-2">
      <span className="font-bold text-lg text-charcoal tracking-tight">
        #{id}
      </span>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? 'Copied' : 'Copy order ID'}
        className="text-silver-400 hover:text-[#D4527A] transition-colors
                   focus-visible:outline-none focus-visible:ring-2
                   focus-visible:ring-pink-200 rounded-md p-1"
      >
        {copied ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
      </button>
    </span>
  );
}

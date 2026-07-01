import {
  Package,
  CheckCircle2,
  Truck,
  Send,
  Clock,
} from 'lucide-react';

/**
 * Status metadata for the order timeline.
 *
 * The stepper, status pills, and any other place that needs to
 * render a friendly label, icon, or accent color for a known
 * order status pulls from this table.
 *
 * Icons are real component references (not strings) so we can
 * render them directly. Gradient strings are full class names
 * so Tailwind's JIT can detect them at build time.
 */
export const STATUS_META = {
  processing: {
    label: 'Order Placed',
    icon: Package,
    gradient: 'from-amber-400 to-orange-500',
  },
  confirmed: {
    label: 'Confirmed',
    icon: CheckCircle2,
    gradient: 'from-blue-400 to-indigo-500',
  },
  packed: {
    label: 'Packed',
    icon: Package,
    gradient: 'from-indigo-400 to-purple-500',
  },
  shipped: {
    label: 'Shipped',
    icon: Truck,
    gradient: 'from-purple-400 to-pink-500',
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    icon: Send,
    gradient: 'from-orange-400 to-pink-500',
  },
  delivered: {
    label: 'Delivered',
    icon: CheckCircle2,
    gradient: 'from-emerald-400 to-green-500',
  },
  default: {
    label: 'Processing',
    icon: Clock,
    gradient: 'from-[#D4527A] to-[#E87A9D]',
  },
};

/** Look up metadata for an order status, falling back to a sane default. */
export const getStatusMeta = (status) => {
  const key = String(status || '').toLowerCase().trim().replace(/\s+/g, '_');
  return STATUS_META[key] || STATUS_META.default;
};

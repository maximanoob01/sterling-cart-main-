import { motion } from 'framer-motion';

import { fadeInUp } from '../motion';
import { formatDate } from '../format';
import { getStatusMeta } from '../constants';
import { cardClass } from '../theme';

/**
 * Responsive order stepper.
 *
 *  • Desktop / tablet (md+): horizontal timeline with progress bar
 *  • Mobile: vertical timeline with progress fill
 *
 * The "current" step (last completed) gets a subtle ping animation
 * so users can see exactly where the order is right now.
 */
export default function OrderStepper({ order }) {
  const timeline = order.timeline || [];
  const lastIdx  = Math.max(timeline.length - 1, 0);
  const completedCount = timeline.filter((s) => s.completed).length;

  // 0 → 1, where 1 means "all steps complete".
  const progress = lastIdx > 0 ? (completedCount - 1) / lastIdx : 1;
  const progressPct = Math.max(0, Math.min(progress, 1)) * 100;

  // Index of the most recently completed step.
  const currentIdx = timeline.reduce(
    (acc, s, i) => (s.completed ? i : acc),
    -1
  );

  return (
    <motion.section
      variants={fadeInUp}
      className={`${cardClass} pb-16 md:pb-24`}
      aria-label="Tracking status"
    >
      <header
        className="flex flex-col sm:flex-row justify-between items-start
                   sm:items-center mb-12 md:mb-16 gap-2"
      >
        <h3 className="font-serif text-xl font-bold text-charcoal">
          Tracking Status
        </h3>
        <div className="bg-silver-50 px-4 py-2 rounded-xl border border-silver-100">
          <p className="text-sm text-silver-500 font-medium">
            Order ID:{' '}
            <span className="font-bold text-charcoal">#{order.id}</span>
          </p>
        </div>
      </header>

      {/* ───── Desktop horizontal stepper (md+) ───── */}
      <ol
        className="hidden md:flex relative justify-between w-full
                   max-w-4xl mx-auto px-10"
        aria-label="Order progress"
      >
        {/* Background track */}
        <div
          aria-hidden
          className="absolute top-5 left-10 right-10 h-1.5
                     bg-silver-100 rounded-full z-0"
        />
        {/* Active track — same width trick as the original
            (calc accounts for both side paddings) */}
        <div
          aria-hidden
          className="absolute top-5 left-10 h-1.5
                     bg-gradient-to-r from-[#D4527A] to-[#E87A9D]
                     rounded-full z-0 transition-all duration-1000 ease-out"
          style={{ width: `calc(${progressPct}% - ${progressPct * 0.8}px)` }}
        />

        {timeline.map((step, idx) => (
          <StepDot
            key={`${step.status}-${idx}`}
            step={step}
            index={idx}
            isCurrent={idx === currentIdx}
          />
        ))}
      </ol>

      {/* ───── Mobile vertical stepper (<md) ───── */}
      <ol
        className="md:hidden relative pl-6 space-y-8"
        aria-label="Order progress"
      >
        {/* Background track */}
        <div
          aria-hidden
          className="absolute left-[15px] top-3 bottom-3 w-1
                     bg-silver-100 rounded-full"
        />
        {/* Active track — fills the background as a child element */}
        <div
          aria-hidden
          className="absolute left-[15px] top-3 w-1
                     bg-gradient-to-b from-[#D4527A] to-[#E87A9D]
                     rounded-full transition-all duration-1000 ease-out"
          style={{ height: `${progressPct}%` }}
        />

        {timeline.map((step, idx) => (
          <StepRow
            key={`${step.status}-${idx}`}
            step={step}
            index={idx}
            isCurrent={idx === currentIdx}
          />
        ))}
      </ol>
    </motion.section>
  );
}

/* ───────────── Sub-components ───────────── */

/** A single dot + label, used in the horizontal stepper. */
function StepDot({ step, index, isCurrent }) {
  const meta = getStatusMeta(step.status);
  const Icon = meta.icon;

  return (
    <li className="relative z-10 flex flex-col items-center flex-1">
      <div className="relative">
        {/* Pulse halo for the CURRENT step */}
        {isCurrent && (
          <span
            aria-hidden
            className="absolute inset-0 rounded-full bg-pink-300
                       animate-ping opacity-60"
          />
        )}
        <div
          className={`relative w-11 h-11 rounded-full flex items-center
                      justify-center text-sm font-bold border-[3px] shadow-sm
                      transition-all duration-500 delay-100 ${
                        step.completed
                          ? `bg-gradient-to-br ${meta.gradient} text-white
                             border-white shadow-pink-200`
                          : 'bg-white text-silver-300 border-silver-100 shadow-none'
                      }`}
          aria-current={isCurrent ? 'step' : undefined}
        >
          {step.completed ? (
            <Icon strokeWidth={2.5} size={18} aria-hidden />
          ) : (
            index + 1
          )}
        </div>
      </div>

      <div className="text-center absolute top-14 w-28 md:w-36 mt-2">
        <p
          className={`text-sm font-bold ${
            step.completed ? 'text-charcoal' : 'text-silver-400'
          }`}
        >
          {step.status}
        </p>
        {step.date && (
          <p className="text-[11px] font-medium text-silver-400 mt-1">
            {formatDate(step.date)}
          </p>
        )}
      </div>
    </li>
  );
}

/** A single row, used in the vertical (mobile) stepper. */
function StepRow({ step, index, isCurrent }) {
  const meta = getStatusMeta(step.status);
  const Icon = meta.icon;

  return (
    <li className="relative flex items-start">
      <div className="relative -ml-6">
        {isCurrent && (
          <span
            aria-hidden
            className="absolute inset-0 rounded-full bg-pink-300
                       animate-ping opacity-60"
          />
        )}
        <div
          className={`relative w-8 h-8 rounded-full flex items-center
                      justify-center text-xs font-bold border-[3px] ${
                        step.completed
                          ? `bg-gradient-to-br ${meta.gradient} text-white
                             border-white shadow-pink-200`
                          : 'bg-white text-silver-300 border-silver-100'
                      }`}
          aria-current={isCurrent ? 'step' : undefined}
        >
          {step.completed ? (
            <Icon size={14} strokeWidth={2.5} aria-hidden />
          ) : (
            index + 1
          )}
        </div>
      </div>

      <div className="pl-4 pt-0.5">
        <p
          className={`text-sm font-bold ${
            step.completed ? 'text-charcoal' : 'text-silver-400'
          }`}
        >
          {step.status}
        </p>
        {step.date && (
          <p className="text-[11px] font-medium text-silver-400 mt-0.5">
            {formatDate(step.date)}
          </p>
        )}
      </div>
    </li>
  );
}

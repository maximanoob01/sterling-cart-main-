import { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

import BackgroundDecor     from './components/BackgroundDecor';
import Header              from './components/Header';
import TrackingForm        from './components/TrackingForm';
import ErrorState          from './components/ErrorState';
import OrderDetailsCard    from './components/OrderDetailsCard';
import OrderStepper        from './components/OrderStepper';
import OrderItemsList      from './components/OrderItemsList';
import OrderSummary        from './components/OrderSummary';

import { useOrderTracking } from './hooks/useOrderTracking';
import { fadeInUp, stagger } from './motion';

const containerVariants = stagger(0.12);

/**
 * TrackOrderPage
 * ─────────────────────────────────────────────────────────────
 * Customer-facing page that lets a user look up the live status
 * of an order by ID + contact info.
 *
 * The page is a thin orchestrator:
 *   • state lives in `useOrderTracking`
 *   • presentation is split across focused sub-components
 *   • motion is described by shared variants in `./motion`
 *
 * State machine (very small):
 *   1. initial       → show the form
 *   2. searching     → form is disabled, results are hidden
 *   3. has order     → hide form, show results
 *   4. has error     → keep form visible so the user can retry,
 *                      and surface a helpful error card
 *   5. user resets   → back to (1)
 */
export default function TrackOrderPage() {
  const { order, error, isLoading, track, reset } = useOrderTracking();
  const [hasSearched, setHasSearched] = useState(false);

  const handleTrack = useCallback(
    ({ orderId }) => {
      setHasSearched(true);
      track(orderId);
    },
    [track]
  );

  const handleReset = useCallback(() => {
    setHasSearched(false);
    reset();
  }, [reset]);

  // The "current" status is whichever step the user is sitting on
  // right now — i.e. the last completed step in the timeline.
  const currentStatus =
    order?.timeline?.filter((s) => s.completed).pop()?.status || 'Processing';

  return (
    <div className="min-h-screen bg-[#FFF5F8] relative pb-20 sm:pb-16 overflow-hidden">
      <BackgroundDecor />

      <Header />

      <main className="max-w-5xl mx-auto px-4 md:px-8 relative z-10">
        {/* ───── Lookup form (visible when no order yet) ───── */}
        <AnimatePresence>
          {!order && (
            <TrackingForm
              key="form"
              onTrack={handleTrack}
              isLoading={isLoading}
            />
          )}
        </AnimatePresence>

        {/* ───── Error state ───── */}
        <AnimatePresence>
          {hasSearched && error && !order && (
            <ErrorState
              key="error"
              message={error}
              onRetry={handleReset}
            />
          )}
        </AnimatePresence>

        {/* ───── Results ───── */}
        <AnimatePresence>
          {order && (
            <motion.section
              key="results"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
              className="flex flex-col gap-6 md:gap-8 pb-12"
              aria-label="Order details"
            >
              <motion.div variants={fadeInUp}>
                <OrderDetailsCard
                  order={order}
                  currentStatus={currentStatus}
                />
              </motion.div>

              <motion.div variants={fadeInUp}>
                <OrderStepper order={order} />
              </motion.div>

              <motion.div variants={fadeInUp}>
                <OrderItemsList items={order.items || []} />
              </motion.div>

              <motion.div variants={fadeInUp}>
                <OrderSummary order={order} />
              </motion.div>

              <motion.div variants={fadeInUp} className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 text-sm font-bold
                             text-[#D4527A] hover:underline underline-offset-4
                             focus-visible:outline-none focus-visible:ring-4
                             focus-visible:ring-pink-200 rounded-full
                             px-4 py-2"
                >
                  <ArrowLeft size={14} aria-hidden />
                  Track another order
                </button>
              </motion.div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

/**
 * Centralized Framer Motion variants.
 * Keeping these in one place keeps component files focused on
 * layout & structure, and makes global motion tuning trivial.
 *
 * All easings are intentional: we use a soft "ease-out-expo"
 * curve for entrances so content feels like it settles into
 * place rather than just appearing.
 */

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];

/** Subtle rise + fade. The default for content sections. */
export const fadeInUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT_EXPO } },
  exit:    { opacity: 0, y: -10, transition: { duration: 0.3, ease: 'easeIn' } },
};

/** Drop-in for the page header. */
export const fadeInDown = {
  hidden:  { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT_EXPO } },
};

/** Pure fade. */
export const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

/** Slight zoom-in. Used for floating cards. */
export const scaleIn = {
  hidden:  { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: EASE_OUT_EXPO } },
  exit:    { opacity: 0, scale: 0.98, transition: { duration: 0.25, ease: 'easeIn' } },
};

/** Vertical expand/collapse for the error state. */
export const collapse = {
  hidden:  { opacity: 0, height: 0 },
  visible: { opacity: 1, height: 'auto', transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, height: 0, transition: { duration: 0.25, ease: 'easeIn' } },
};

/** Container that staggers its children's enter animations. */
export const stagger = (delayChildren = 0.08) => ({
  visible: { transition: { staggerChildren: delayChildren } },
});

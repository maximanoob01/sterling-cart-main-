/**
 * Shared class-name "primitives" for the TrackOrder feature.
 *
 * These are intentionally split out so we have ONE place to
 * tune the look of every "floating card" or "rounded input"
 * in this module. Anything you change here propagates to all
 * sections that use it.
 *
 * The colour palette stays consistent with the rest of the
 * app (#D4527A primary, pink-50 surface, charcoal text, etc).
 */

// The signature glass card used by all "panel" sections.
export const cardClass =
  'bg-white/80 backdrop-blur-2xl rounded-2xl ' +
  'shadow-[0_24px_60px_rgb(212,82,122,0.06)] ' +
  'border border-white/60 p-5 md:p-6';

// Input used in the lookup form. Strong focus ring for keyboard users.
export const inputClass =
  'w-full pl-12 pr-4 py-3.5 text-sm bg-white/90 rounded-2xl ' +
  'border border-silver-100 outline-none ' +
  'focus:border-[#D4527A] focus:ring-4 focus:ring-pink-100/50 ' +
  'transition-all font-medium text-charcoal placeholder:text-silver-300';

// Small uppercase label above form fields.
export const labelClass =
  'block text-[11px] font-bold text-pink-400 uppercase ' +
  'tracking-widest mb-2 ml-1';

// Pill used for the primary CTA / status.
export const primaryButtonClass =
  'w-full md:w-auto h-[50px] bg-gradient-to-r from-[#D4527A] to-[#E87A9D] ' +
  'text-white text-sm font-bold rounded-2xl px-10 ' +
  'hover:shadow-[0_8px_25px_rgb(212,82,122,0.4)] hover:-translate-y-0.5 ' +
  'transition-all flex items-center justify-center gap-2 ' +
  'disabled:opacity-70 disabled:cursor-not-allowed ' +
  'disabled:hover:translate-y-0 disabled:hover:shadow-none ' +
  'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-pink-200';

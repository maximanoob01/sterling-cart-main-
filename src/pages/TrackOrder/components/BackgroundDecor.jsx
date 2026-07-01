/**
 * Decorative background layer.
 *
 *  • Subtle dot pattern (low opacity, brand-tinted)
 *  • Two large soft glow orbs for depth
 *  • A vertical fade so the pattern doesn't compete with content
 *
 * Pure presentation, no state, no interaction. All elements are
 * `aria-hidden` because they are pure decoration.
 */
export default function BackgroundDecor() {
  return (
    <>
      {/* Subtle dot grid */}
      <div
        aria-hidden
        className="absolute inset-0 z-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(rgba(212, 82, 122, 0.2) 2px, transparent 2px)',
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0',
        }}
      />

      {/* Soft glow orbs */}
      <div
        aria-hidden
        className="absolute top-0 right-0 w-[600px] h-[600px] bg-pink-200/30
                   rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3
                   pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute bottom-40 left-0 w-[500px] h-[500px] bg-white/60
                   rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2
                   pointer-events-none"
      />

      {/* Vertical fade so the pattern never fights the content */}
      <div
        aria-hidden
        className="absolute inset-0 z-0 bg-gradient-to-b
                   from-transparent via-[#FFF5F8]/50 to-[#FFF5F8]
                   pointer-events-none"
      />
    </>
  );
}

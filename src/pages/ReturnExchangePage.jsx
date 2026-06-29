import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield, RefreshCw, PackageCheck, AlertCircle,
  CheckCircle2, Clock, PhoneCall, ChevronRight, Home,
  ArrowRight, Sparkles, BadgeCheck, HeartHandshake
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, ease: [0.25, 1, 0.5, 1], delay: i * 0.08 },
  }),
};

export default function ReturnExchangePage() {
  return (
    <div className="relative min-h-screen bg-bg-surface overflow-hidden">
      {/* Background blobs */}
      <div className="pointer-events-none absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-[#D4527A]/8 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[600px] w-[600px] rounded-full bg-[#F4A0B0]/6 blur-[140px]" />

      {/* Breadcrumb */}
      <div className="relative z-10 py-5 px-5 md:px-10 lg:px-20">
        <div className="mx-auto flex max-w-[1100px] items-center gap-2 text-[12px] font-semibold uppercase tracking-[1px] text-text-muted">
          <Link to="/" className="flex items-center gap-1.5 transition-colors hover:text-[#D4527A]">
            <Home size={13} /> Home
          </Link>
          <ChevronRight size={12} className="text-[#C0C0C0]" />
          <span className="text-[#D4527A]">Exchange &amp; Return Policy</span>
        </div>
      </div>

      {/* Hero banner */}
      <motion.div
        variants={fadeUp} initial="hidden" animate="visible"
        className="relative z-10 mx-auto mt-2 mb-16 max-w-[1100px] px-5 md:px-10 lg:px-0"
      >
        <div
          className="relative overflow-hidden rounded-[28px] px-8 py-12 md:px-16 md:py-16 text-white shadow-xl"
          style={{ background: "linear-gradient(135deg, #1E0912 0%, #2A0D1A 55%, #1A0810 100%)" }}
        >
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4527A]/60 to-transparent" />
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#D4527A]/15 blur-[80px]" />

          <p className="text-[11px] font-black uppercase tracking-[2.5px] text-[#F4A0B0]">Sterling Kart</p>
          <h1 className="mt-3 font-serif text-[36px] leading-[1.15] md:text-[48px]">
            Exchange &amp; Return Policy
          </h1>
          <p className="mt-4 max-w-[580px] text-[15px] leading-relaxed text-white/75">
            We are committed to delivering genuine, high-quality 925 sterling silver jewellery. While we don't have a return policy, you can easily exchange your product within 15 days if you change your mind.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[12px] font-semibold text-white/90 backdrop-blur-sm shadow-sm">
              <RefreshCw size={15} className="text-[#F4A0B0]" /> Easy 15-day exchange
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[12px] font-semibold text-white/90 backdrop-blur-sm shadow-sm">
              <BadgeCheck size={15} className="text-[#F4A0B0]" /> Strict quality checks on every order
            </div>
          </div>
        </div>
      </motion.div>

      <div className="relative z-10 mx-auto max-w-[1100px] px-5 md:px-10 lg:px-0 pb-24 space-y-12">

        {/* ── EXCHANGE POLICY (Now Section 1) ─────────────────────────── */}
        <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <div className="overflow-hidden rounded-[24px] border border-[#F4A0B0]/20 bg-gradient-to-br from-[#FFF4F6] to-[#FFF9FB] shadow-[0_8px_40px_rgba(212,82,122,0.08)]">
            <div className="flex items-center gap-4 border-b border-[#F4A0B0]/20 px-8 py-6 md:px-10 bg-white/40 backdrop-blur-sm">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#D4527A] shadow-[0_4px_16px_rgba(212,82,122,0.35)]">
                <RefreshCw size={22} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[2px] text-[#B94B68]">Section 1</p>
                <h2 className="font-serif text-[26px] text-text-main">Exchange Policy</h2>
              </div>
            </div>

            <div className="px-8 py-8 md:px-10 space-y-8">
              <div className="flex gap-5 rounded-2xl border border-[#D4527A]/20 bg-white p-6 sm:p-8 shadow-sm">
                <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D4527A] to-[#B94B68] shadow-[0_4px_16px_rgba(212,82,122,0.4)]">
                  <Clock size={24} className="text-white" />
                </div>
                <div>
                  <div className="sm:hidden mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D4527A] to-[#B94B68] shadow-[0_4px_16px_rgba(212,82,122,0.4)]">
                    <Clock size={20} className="text-white" />
                  </div>
                  <p className="font-serif text-[28px] font-medium text-text-main leading-none">15-Day Exchange Window</p>
                  <p className="mt-3 font-sans text-[14px] text-text-muted leading-relaxed max-w-[700px]">
                    We want you to absolutely love your Sterling Kart jewellery! If the piece you received isn't quite what you were looking for, you can request a hassle-free exchange within <strong>15 days from the date of delivery</strong>.
                  </p>
                </div>
              </div>

              <div>
                <p className="font-sans text-[13px] font-bold uppercase tracking-[1.2px] text-[#B94B68] mb-4">
                  Eligibility conditions for exchange
                </p>
                <div className="space-y-3">
                  {[
                    "The product must be unused, unworn, and in its original pristine condition.",
                    "All original tags, stickers, and authenticity certificates must be intact.",
                    "The product must be returned in its original Sterling Kart packaging.",
                    "The exchange request must be raised within 15 days of the delivery date.",
                    "Products purchased during a sale or at a discounted price are eligible for exchange only — not for store credit.",
                    "Custom-made or specially personalised jewellery cannot be exchanged.",
                    "Items showing signs of wear, damage, alteration, or tampering will not be accepted.",
                  ].map((condition, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl bg-white border border-[#F4A0B0]/15 px-5 py-4 shadow-[0_2px_10px_rgba(212,82,122,0.03)] hover:border-[#F4A0B0]/40 transition-colors">
                      <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-[#D4527A]" />
                      <p className="font-sans text-[14px] leading-relaxed text-text-main">{condition}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-sans text-[13px] font-bold uppercase tracking-[1.2px] text-[#B94B68] mb-4">
                  How to easily request an exchange
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    {
                      step: "01",
                      title: "Contact Us",
                      desc: "Reach out to our support team via WhatsApp or email within 15 days of delivery. Share your order number and let us know what you'd like to exchange it for.",
                    },
                    {
                      step: "02",
                      title: "Share Photos",
                      desc: "Send clear photographs of the product along with its original packaging to help us quickly verify its condition.",
                    },
                    {
                      step: "03",
                      title: "Approval & Shipping",
                      desc: "Once approved, we'll provide simple instructions on how to ship the product back to us. (Return shipping costs are borne by the customer).",
                    },
                    {
                      step: "04",
                      title: "Inspection & Dispatch",
                      desc: "Upon receiving the item, our team inspects it. Once verified, your beautiful new exchange product will be dispatched within 5–7 business days.",
                    },
                  ].map(({ step, title, desc }) => (
                    <div key={step} className="flex flex-col rounded-2xl bg-white border border-[#F4A0B0]/20 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-5 font-serif text-6xl font-black text-[#D4527A] pointer-events-none group-hover:scale-110 transition-transform duration-500">
                        {step}
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#D4527A]/15 to-[#D4527A]/5 border border-[#D4527A]/20 mb-4">
                        <span className="font-serif text-[16px] font-black text-[#D4527A]">{step}</span>
                      </div>
                      <div>
                        <p className="font-sans text-[15px] font-bold text-text-main mb-2">{title}</p>
                        <p className="font-sans text-[13px] leading-relaxed text-text-muted">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── RETURN POLICY (Now Section 2) ───────────────────────────── */}
        <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <div className="overflow-hidden rounded-[24px] border border-[#F4A0B0]/20 bg-gradient-to-br from-[#FFF4F6] to-[#FFF9FB] shadow-[0_8px_40px_rgba(212,82,122,0.08)]">
            <div className="flex items-center gap-4 border-b border-[#F4A0B0]/20 px-8 py-6 md:px-10 bg-white/40 backdrop-blur-sm">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#D4527A] shadow-[0_4px_16px_rgba(212,82,122,0.35)]">
                <Shield size={22} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[2px] text-[#B94B68]">Section 2</p>
                <h2 className="font-serif text-[26px] text-text-main">Return Policy</h2>
              </div>
            </div>

            <div className="px-8 py-8 md:px-10 space-y-8">
              <div className="flex gap-5 rounded-2xl border border-[#D4527A]/20 bg-white/80 p-6 sm:p-8">
                <AlertCircle size={24} className="shrink-0 mt-1 text-[#D4527A] hidden sm:block" />
                <div>
                  <div className="sm:hidden mb-3">
                    <AlertCircle size={20} className="text-[#D4527A]" />
                  </div>
                  <p className="font-sans text-[16px] font-bold text-text-main mb-2">
                    We currently do not offer returns on purchases.
                  </p>
                  <p className="font-sans text-[14px] leading-relaxed text-text-muted max-w-[700px]">
                    To maintain the highest standards of hygiene and authenticity, all sales are final. Once an order has been successfully placed and dispatched, we are unable to process a return or refund. However, our easy 15-day exchange policy ensures you're never stuck with a product that isn't perfect for you!
                  </p>
                </div>
              </div>

              <div>
                <p className="font-sans text-[13px] font-bold uppercase tracking-[1.2px] text-[#B94B68] mb-5 text-center sm:text-left">
                  Why we don't accept returns — Our Quality Promise
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    {
                      Icon: BadgeCheck,
                      title: "Rigorous Quality Inspection",
                      desc: "Every single piece undergoes a thorough multi-point quality check by our expert team before dispatch — verifying purity, craftsmanship, and finish.",
                    },
                    {
                      Icon: Sparkles,
                      title: "Genuine 925 Sterling Silver",
                      desc: "Each product is hallmarked and certified, ensuring you receive authentic 925 sterling silver as advertised — no compromises.",
                    },
                    {
                      Icon: PackageCheck,
                      title: "Careful, Secure Packaging",
                      desc: "Your jewellery is packed with love using premium materials to ensure it reaches you in perfect condition, completely free from damage.",
                    },
                    {
                      Icon: HeartHandshake,
                      title: "Hygiene & Trust First",
                      desc: "Jewellery is a personal item. By not accepting returns, we guarantee that the piece you receive has never been worn or used by anyone else.",
                    },
                  ].map(({ Icon, title, desc }, i) => (
                    <div key={title} className="flex gap-4 rounded-2xl bg-white border border-[#F4A0B0]/20 p-6 shadow-sm hover:-translate-y-0.5 transition-transform">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#D4527A]/10 text-[#D4527A]">
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="font-sans text-[14px] font-bold text-text-main mb-1.5">{title}</p>
                        <p className="font-sans text-[13px] leading-relaxed text-text-muted">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-[#1C1C2E] px-6 py-6 sm:px-8 sm:py-7 text-white shadow-lg relative overflow-hidden">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
                <p className="font-sans text-[14px] leading-relaxed text-white/80 relative z-10">
                  <span className="font-bold text-[#F4A0B0] text-[15px] block mb-2 tracking-wide">Our Assurance to You:</span>
                  You can shop with complete peace of mind knowing that every Sterling Kart piece has been strictly inspected, authenticated, and beautifully packaged before it reaches your doorstep. We proudly stand behind the craftsmanship and quality of every product we sell.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── Contact CTA ─────────────────────────────── */}
        <motion.section variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <div
            className="relative overflow-hidden rounded-[24px] px-8 py-12 md:px-12 text-white text-center shadow-xl"
            style={{ background: "linear-gradient(135deg, #1E0912 0%, #2A0D1A 55%, #1A0810 100%)" }}
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#D4527A]/20 blur-[60px]" />
            <div className="pointer-events-none absolute -left-20 -bottom-20 h-56 w-56 rounded-full bg-[#D4527A]/10 blur-[60px]" />
            <div className="relative z-10">
              <PhoneCall size={32} className="mx-auto mb-5 text-[#F4A0B0]" />
              <h2 className="font-serif text-[28px] md:text-[36px]">Need help with an exchange?</h2>
              <p className="mt-4 text-[15px] leading-relaxed text-white/70 max-w-[500px] mx-auto">
                Our friendly support team is always happy to assist you. Contact us via WhatsApp or email and we will get back to you promptly.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://wa.me/919911773307"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 h-[52px] px-8 rounded-full bg-[#D4527A] text-white text-[13px] font-bold uppercase tracking-[1px] hover:bg-[#B94B68] hover:shadow-[0_4px_25px_rgba(212,82,122,0.5)] transition-all duration-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                  </svg>
                  WhatsApp
                </a>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 h-[52px] px-8 rounded-full border-2 border-white/20 text-white/90 text-[13px] font-bold uppercase tracking-[1px] hover:bg-white/10 hover:text-white transition-all duration-300"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </motion.section>

      </div>
    </div>
  );
}

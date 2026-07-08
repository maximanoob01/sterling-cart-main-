import { Link } from 'react-router-dom';
import { Gift, Mail, ShieldCheck, Heart, ArrowRight, Diamond } from 'lucide-react';
import giftCardImg from '../../assets/images/gift_card_promo.webp';
import { motion } from 'framer-motion';

const benefits = [
  { icon: Mail, title: "Instant Delivery" },
  { icon: Gift, title: "Perfect Gift" },
  { icon: ShieldCheck, title: "Secure Payment" },
  { icon: Diamond, title: "Luxury Packaging" },
  { icon: Heart, title: "Let Them Choose" },
];

export default function GiftCardPromo() {
  return (
    <section className="px-3 py-6 md:px-8 md:py-12 bg-bg-surface bg-pattern-diamond-dark overflow-hidden">
      <div className="mx-auto max-w-[1000px]">
        {/* Main Card (Mobile Side-by-Side) */}
        <div className="relative w-full rounded-[22px] bg-gradient-to-br from-[#FFFDFB] to-[#FDFBF7] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#E8E2D9] mb-5 overflow-hidden">
          
          {/* Subtle sparkles/texture background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#F9F0E5] to-transparent opacity-60 rounded-full blur-3xl pointer-events-none" />

          {/* Gift Card Image (Absolute positioned on right for mobile, overlapping 35-40%) */}
          <motion.div 
            className="absolute right-[-8%] top-[15%] sm:top-1/2 sm:-translate-y-1/2 w-[48%] max-w-[200px] md:max-w-[300px] md:right-10 z-0 pointer-events-none"
            animate={{ 
              y: [-5, 5, -5],
              rotate: [-2, 0, -2]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 rounded-[12px] opacity-0 group-hover:opacity-100 animate-[shimmer_2s_infinite]" />
              <img 
                src={giftCardImg} 
                alt="Sterling Kart Gift Card" 
                className="w-full object-contain drop-shadow-[0_15px_25px_rgba(10,20,40,0.15)]"
              />
            </div>
          </motion.div>

          {/* Left Content */}
          <div className="relative z-10 w-[65%] sm:w-[55%] md:w-1/2 p-5 sm:p-8 md:p-10 flex flex-col justify-center min-h-[280px] md:min-h-[360px]">
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-1.5 mb-3"
            >
              <Gift size={12} className="text-[#B59A7A]" />
              <span className="font-sans text-[10px] md:text-[11px] font-bold uppercase tracking-[1.5px] text-[#8C7A6B]">
                Gift Cards
              </span>
            </motion.div>
            
            {/* Heading */}
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-serif text-[24px] sm:text-[32px] md:text-[40px] text-[#1A1A24] leading-[1.1] mb-2 sm:mb-4"
            >
              The Perfect Gift <br />
              <span className="text-[#C88A8A] font-medium italic">for every occasion</span>
            </motion.h2>
            
            {/* Description */}
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="font-sans text-[12px] sm:text-[14px] text-[#5C5C66] leading-relaxed mb-6 sm:mb-8 line-clamp-2 max-w-[220px] sm:max-w-[320px]"
            >
              Let them choose the jewellery they'll truly love.
            </motion.p>
            
            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Link 
                to="/gifting#gift-cards"
                className="group relative flex items-center justify-center gap-2 w-full max-w-[220px] sm:max-w-none sm:w-auto sm:inline-flex bg-gradient-to-r from-[#D9A098] to-[#C88A8A] text-white px-5 sm:px-8 py-3.5 sm:py-4 rounded-[14px] font-sans font-bold text-[13px] sm:text-[14px] tracking-wide shadow-[0_8px_20px_rgba(200,138,138,0.25)] hover:shadow-[0_10px_25px_rgba(200,138,138,0.4)] hover:-translate-y-0.5 transition-all"
              >
                {/* Button Glow */}
                <div className="absolute inset-0 rounded-[14px] bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
                <span className="relative z-10">Explore Gift Cards</span>
                <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Benefits Horizontal Scroll */}
        <div className="mb-5 -mx-3 px-3 md:mx-0 md:px-0">
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-4 pt-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  key={idx}
                  className="snap-start shrink-0 flex items-center gap-2.5 bg-white h-[44px] sm:h-[48px] px-4 rounded-[22px] shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-[#F3EFEA]"
                >
                  <div className="w-7 h-7 rounded-full bg-[#FAF5F0] flex items-center justify-center">
                    <Icon size={13} className="text-[#B59A7A]" />
                  </div>
                  <span className="font-sans text-[11px] sm:text-[12px] font-semibold text-[#333333] whitespace-nowrap">
                    {benefit.title}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Premium Bottom Strip */}
        <Link to="/gifting#gift-cards" className="block relative">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-[16px] bg-[#FAF7F2] border border-[#E8E2D9] p-4 flex items-center justify-center shadow-[0_4px_15px_rgba(0,0,0,0.02)] overflow-hidden group"
          >
            {/* Subtle line decoration */}
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#D4C3B3]/50 to-transparent pointer-events-none" />
            
            <div className="relative z-10 flex items-center gap-3 bg-[#FAF7F2] px-5">
              <span className="text-[14px]">✨</span>
              <p className="font-serif text-[14px] sm:text-[15px] text-[#1A1A24] font-medium tracking-wide">
                Give a gift they'll never forget
              </p>
              <div className="w-6 h-6 rounded-full bg-[#B59A7A] flex items-center justify-center ml-1 group-hover:bg-[#9C8263] transition-colors">
                <ArrowRight size={12} className="text-white group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </motion.div>
        </Link>

      </div>
    </section>
  );
}

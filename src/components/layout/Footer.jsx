import { Link, useLocation } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';

const InstagramIcon = ({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function Footer() {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) return null;

  return (
    <footer 
      className="pt-24 pb-10 text-white relative overflow-hidden border-t border-[#D4527A]/20"
      style={{ background: 'linear-gradient(135deg, #1E0912 0%, #2A0D1A 50%, #1A0810 100%)' }}
    >
      {/* 3D Floating Ring Background Element */}
      <div 
        className="absolute right-[-10%] md:right-[-5%] lg:right-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[450px] md:h-[450px] lg:w-[550px] lg:h-[550px] opacity-90 pointer-events-none z-0 select-none mix-blend-lighten"
        style={{ 
          maskImage: 'radial-gradient(circle at center, black 40%, transparent 70%)', 
          WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 70%)' 
        }}
      >
        <img src="/footer-ring.png" alt="" className="w-full h-full object-cover" />
      </div>

      {/* Decorative Blur */}
      <div className="absolute top-0 left-1/4 w-full max-w-[800px] h-[300px] bg-[#D4527A]/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0" />

      <div className="mx-auto max-w-[1320px] px-6 md:px-10 relative z-10">
        
        {/* Top Section: Brand & Newsletter */}
        <div className="grid gap-12 lg:grid-cols-12 mb-16 border-b border-[#D4527A]/20 pb-16">
          <div className="lg:col-span-5 flex flex-col pr-4">
            <Link to="/" className="inline-flex flex-col items-start leading-none mb-6">
              <span className="brand-wordmark whitespace-nowrap text-[28px] text-white">
                STERLING KART
              </span>
              <span className="brand-submark mt-1.5 whitespace-nowrap text-[9px] text-[#F4A0B0]">
                925 SILVER JEWELS
              </span>
            </Link>
            <p className="text-[14px] leading-relaxed text-white/70 max-w-[380px] font-serif italic">
              Elevating everyday elegance with bespoke 925 sterling silver jewelry. Crafted with passion, designed for luxury.
            </p>
            <div className="mt-8 mb-10 flex items-center gap-4">
              <a 
                href="https://www.instagram.com/sterling.kart/" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center justify-center w-11 h-11 rounded-full border border-[#D4527A]/40 text-[#F4A0B0] hover:bg-[#D4527A]/20 hover:text-white hover:border-[#D4527A] transition-all duration-500"
                aria-label="Instagram"
              >
                <InstagramIcon size={18} />
              </a>
              <a 
                href="mailto:contact@sterlingkart.com" 
                className="flex items-center justify-center w-11 h-11 rounded-full border border-[#D4527A]/40 text-[#F4A0B0] hover:bg-[#D4527A]/20 hover:text-white hover:border-[#D4527A] transition-all duration-500"
                aria-label="Email Us"
              >
                <Mail size={18} strokeWidth={1.5} />
              </a>
            </div>

            <div>
              <h4 className="mb-5 text-[10px] font-bold uppercase tracking-[2px] text-[#F4A0B0]">Visit Us</h4>
              <ul className="flex flex-col gap-3 text-[13px] text-white/60">
                <li className="flex items-start gap-3 group">
                  <MapPin size={16} className="text-[#D4527A] shrink-0 mt-0.5 group-hover:text-white transition-colors" />
                  <span className="leading-relaxed">B.T. Ganj | Civil Lines, Roorkee</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <Phone size={16} className="text-[#D4527A] shrink-0 mt-0.5 group-hover:text-white transition-colors" />
                  <span className="leading-relaxed">9911773307  |  7011028085</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-4 grid gap-8 sm:grid-cols-2 lg:pl-10">
            <FooterLinks title="Explore" links={[
              ['Shop All', '/shop'],
              ['New Arrivals', '/shop?sort=new'],
              ['Our Story', '/about'],
              ['Gifting', '/shop?occasion=gifting'],
            ]} />

            <FooterLinks title="Client Care" links={[
              ['Track Order', '/track-order'],
              ['Shipping Policy', '#'],
              ['Returns & Exchanges', '#'],
              ['Contact Us', '/contact'],
            ]} />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col gap-4 text-[11px] font-medium tracking-wide text-white/50 sm:flex-row sm:items-center sm:justify-between uppercase">
          <p>© {new Date().getFullYear()} Sterling Kart. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="#" className="hover:text-white hover:underline transition-colors">Privacy</Link>
            <Link to="#" className="hover:text-white hover:underline transition-colors">Terms</Link>
            <span className="flex items-center gap-1 ml-4 border-l border-[#D4527A]/30 pl-8">
              Designed by <a href="#" className="text-[#F4A0B0] hover:text-white transition-colors">hypenbloom</a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLinks({ title, links }) {
  return (
    <div>
      <h4 className="mb-6 text-[10px] font-semibold uppercase tracking-[2px] text-white/40">{title}</h4>
      <ul className="flex flex-col gap-3.5">
        {links.map(([name, path]) => (
          <li key={name}>
            <Link 
              to={path} 
              className="group flex items-center text-[13px] text-white/60 transition-colors hover:text-white"
            >
              <span className="relative overflow-hidden">
                <span className="block transition-transform duration-300 group-hover:-translate-y-full">{name}</span>
                <span className="absolute inset-0 block translate-y-full transition-transform duration-300 group-hover:translate-y-0">{name}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

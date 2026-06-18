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
    <footer className="bg-[#0A0A0A] pt-20 pb-10 text-white relative overflow-hidden border-t border-white/10">
      {/* Decorative Blur */}
      <div className="absolute top-0 left-1/2 w-full max-w-[1000px] h-[300px] bg-[#D4527A]/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <div className="mx-auto max-w-[1320px] px-6 md:px-10 relative z-10">
        
        {/* Top Section: Brand & Newsletter */}
        <div className="grid gap-12 lg:grid-cols-12 mb-16 border-b border-white/10 pb-16">
          <div className="lg:col-span-5">
            <Link to="/" className="inline-flex flex-col items-start leading-none mb-6">
              <span className="whitespace-nowrap font-[var(--font-logo)] text-[28px] font-semibold uppercase tracking-[1px] text-white">
                Sterling Kart
              </span>
              <span className="mt-1.5 whitespace-nowrap font-sans text-[9px] font-bold uppercase tracking-[3px] text-white/60">
                925 Silver Jewels
              </span>
            </Link>
            <p className="text-[14px] leading-relaxed text-white/60 max-w-[380px] font-serif italic">
              Elevating everyday elegance with bespoke 925 sterling silver jewelry. Crafted with passion, designed for luxury.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <a 
                href="https://www.instagram.com/sterling.kart/" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center justify-center w-11 h-11 rounded-full border border-white/20 text-white hover:bg-white hover:text-black transition-all duration-500"
                aria-label="Instagram"
              >
                <InstagramIcon size={18} />
              </a>
              <a 
                href="mailto:contact@sterlingkart.com" 
                className="flex items-center justify-center w-11 h-11 rounded-full border border-white/20 text-white hover:bg-white hover:text-black transition-all duration-500"
                aria-label="Email Us"
              >
                <Mail size={18} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          <div className="lg:col-span-7 grid gap-8 sm:grid-cols-3">
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

            <div>
              <h4 className="mb-6 text-[10px] font-semibold uppercase tracking-[2px] text-white/40">Visit Us</h4>
              <ul className="flex flex-col gap-4 text-[13px] text-white/60">
                <li className="flex items-start gap-3 group">
                  <MapPin size={16} className="text-white/40 shrink-0 mt-0.5 group-hover:text-white transition-colors" />
                  <span className="leading-relaxed">B.T. Ganj | Civil Lines<br/>Roorkee</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <Phone size={16} className="text-white/40 shrink-0 mt-0.5 group-hover:text-white transition-colors" />
                  <span className="leading-relaxed">9911773307<br/>7011028085</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col gap-4 text-[11px] font-medium tracking-wide text-white/40 sm:flex-row sm:items-center sm:justify-between uppercase">
          <p>© {new Date().getFullYear()} Sterling Kart. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="#" className="hover:text-white transition-colors">Terms</Link>
            <span className="flex items-center gap-1 ml-4 border-l border-white/10 pl-8">
              Designed by <a href="#" className="text-white/70 hover:text-white transition-colors">hypenbloom</a>
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

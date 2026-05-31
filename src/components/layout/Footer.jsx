import { Link, useLocation } from 'react-router-dom';
import { MapPin, Phone } from 'lucide-react';

const InstagramIcon = ({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
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
    <footer className="bg-[radial-gradient(circle_at_center,_#1a3682_0%,_#0d1e4b_100%)] px-6 py-14 text-white md:px-10">
      <div className="mx-auto max-w-[1320px]">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Brand Info */}
          <div>
            <Link to="/" className="flex flex-col items-start leading-none mb-5">
              <span className="whitespace-nowrap font-[var(--font-logo)] text-[24px] font-semibold uppercase tracking-[0.7px] text-white">
                Sterling Kart
              </span>
              <span className="mt-1.5 whitespace-nowrap font-sans text-[8px] font-bold uppercase tracking-[2.2px] text-white/80">
                925 Silver Jewels
              </span>
            </Link>
            <div className="space-y-3 text-[13px] leading-relaxed text-white/65">
              <p className="font-semibold text-white/90">Jewelry / Watches</p>
              <p className="text-[12px] font-bold tracking-widest text-[#F4A0B0] uppercase">A Unit of @palgems</p>
              <ul className="space-y-1.5 mt-2">
                <li>• Your LUXURY 925 Sterling Silver Shop!</li>
                <li>• Bespoke & specially created Silver Jewels</li>
                <li>• Shop Online</li>
              </ul>
            </div>
          </div>

          {/* Explore Links */}
          <FooterLinks title="Explore" links={[
            ['Shop all', '/shop'],
            ['New arrivals', '/shop?sort=new'],
            ['About us', '/about'],
            ['Contact', '/contact'],
          ]} />

          {/* Help Links */}
          <FooterLinks title="Help" links={[
            ['Track order', '/track-order'],
            ['Shipping and returns', '#'],
            ['Privacy policy', '#'],
            ['Terms of service', '#'],
          ]} />

          {/* Contact Details */}
          <div>
            <h4 className="mb-5 text-[11px] font-semibold uppercase tracking-[1.5px] text-white/45">Reach Us</h4>
            <ul className="flex flex-col gap-4 text-[13px] text-white/65">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-[#F4A0B0] shrink-0 mt-0.5" />
                <span>B.T. Ganj | Civil Lines, Roorkee</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={16} className="text-[#F4A0B0] shrink-0 mt-0.5" />
                <span>9911773307 | 7011028085</span>
              </li>
              <li className="pt-2">
                <a 
                  href="https://www.instagram.com/sterling.kart/" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-bg-surface/5 hover:bg-bg-surface/10 border border-white/10 rounded-lg text-white/90 hover:text-white transition-all duration-300 group"
                >
                  <InstagramIcon size={16} className="group-hover:scale-110 transition-transform" />
                  <span className="font-medium tracking-wide text-[12px]">@sterling.kart</span>
                </a>
              </li>
            </ul>
          </div>

        </div>
        
        {/* Bottom Bar */}
        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-[12px] text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright © {new Date().getFullYear()} Sterling Kart. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Built by <a href="#" className="font-semibold text-white/70 hover:text-white transition-colors">hypenbloom</a>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLinks({ title, links }) {
  return (
    <div>
      <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[1.5px] text-white/45">{title}</h4>
      <ul className="flex flex-col gap-3">
        {links.map(([name, path]) => <li key={name}><Link to={path} className="text-[13px] text-white/65 transition-colors hover:text-white">{name}</Link></li>)}
      </ul>
    </div>
  );
}

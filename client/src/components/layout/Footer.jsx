import { Link } from 'react-router-dom';
import { Music2, Instagram, Youtube, Mail, Phone } from 'lucide-react';

const APP_NAME = import.meta.env.VITE_APP_NAME || 'Dance Academy';
const INSTAGRAM_URL = import.meta.env.VITE_INSTAGRAM_URL || '#';
const YOUTUBE_URL = import.meta.env.VITE_YOUTUBE_URL || '#';

const links = [
  { label: 'Courses',  to: '/courses' },
  { label: 'Events',   to: '/events' },
  { label: 'Packages', to: '/packages' },
  { label: 'About',    to: '/about' },
  { label: 'Contact',  to: '/contact' },
];

const legal = [
  { label: 'Privacy Policy',    to: '/privacy' },
  { label: 'Terms & Conditions', to: '/terms' },
  { label: 'Refund Policy',     to: '/refund' },
];

export default function Footer() {
  return (
    <footer className="bg-dark-950 border-t border-dark-800">
      <div className="page-container py-10">

        {/* Top row: brand + nav links + socials */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

          {/* Brand */}
          <Link to="/" className="inline-flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 bg-orange-gradient rounded-lg flex items-center justify-center">
              <Music2 size={18} className="text-white" />
            </div>
            <span className="text-lg font-heading font-bold text-white group-hover:text-primary-400 transition-colors">
              {APP_NAME}
            </span>
          </Link>

          {/* Nav links */}
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-dark-400 hover:text-primary-400 text-sm transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Socials + contact */}
          <div className="flex items-center gap-3">
            <a
              href={`mailto:support@danceacademy.com`}
              aria-label="Email"
              className="w-9 h-9 rounded-lg bg-dark-800 border border-dark-700 hover:border-primary-500/50 hover:text-primary-400 flex items-center justify-center text-dark-400 transition-all"
            >
              <Mail size={15} />
            </a>
            <a
              href={`tel:+910000000000`}
              aria-label="Phone"
              className="w-9 h-9 rounded-lg bg-dark-800 border border-dark-700 hover:border-primary-500/50 hover:text-primary-400 flex items-center justify-center text-dark-400 transition-all"
            >
              <Phone size={15} />
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-9 h-9 rounded-lg bg-dark-800 border border-dark-700 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 hover:border-transparent flex items-center justify-center text-dark-400 hover:text-white transition-all"
            >
              <Instagram size={15} />
            </a>
            <a
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="w-9 h-9 rounded-lg bg-dark-800 border border-dark-700 hover:bg-red-600 hover:border-transparent flex items-center justify-center text-dark-400 hover:text-white transition-all"
            >
              <Youtube size={15} />
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="my-6 h-px bg-dark-800" />

        {/* Bottom row: copyright + legal links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-dark-500 text-xs text-center sm:text-left">
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            {legal.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-dark-500 hover:text-dark-300 text-xs transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}

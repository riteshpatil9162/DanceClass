import { Link } from 'react-router-dom';
import { Music2, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const APP_NAME = import.meta.env.VITE_APP_NAME || 'Dance Academy';
const INSTAGRAM_URL = import.meta.env.VITE_INSTAGRAM_URL || '#';
const YOUTUBE_URL = import.meta.env.VITE_YOUTUBE_URL || '#';

const legal = [
  { label: 'Privacy Policy',     to: '/privacy' },
  { label: 'Terms & Conditions', to: '/terms' },
  { label: 'Refund Policy',      to: '/refund' },
];

const quickLinks = [
  [
    { label: 'All Courses',      to: '/courses' },
    { label: 'Course Packages',  to: '/packages' },
    { label: 'Free Courses',     to: '/courses?filter=free' },
  ],
  [
    { label: 'Upcoming Events',  to: '/events' },
    { label: 'Book an Event',    to: '/events' },
    { label: 'About Us',         to: '/about' },
  ],
  [
    { label: 'Contact',          to: '/contact' },
    { label: 'Privacy Policy',   to: '/privacy' },
    { label: 'Refund Policy',    to: '/refund' },
  ],
];

export default function Footer() {
  return (
    <footer className="bg-dark-950 border-t border-dark-800">
      <div className="page-container py-10">

        {/* ── Row 1: Brand · Tagline · Socials ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          {/* Brand + tagline */}
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5 group mb-2">
              <div className="w-9 h-9 bg-orange-gradient rounded-lg flex items-center justify-center">
                <Music2 size={18} className="text-white" />
              </div>
              <span className="text-lg font-heading font-bold text-white group-hover:text-primary-400 transition-colors">
                {APP_NAME}
              </span>
            </Link>
            <p className="text-dark-500 text-xs max-w-xs">
              Expert-led dance courses &amp; live events — Bollywood, Hip-Hop, Classical and more.
            </p>
          </div>

          {/* Social icons */}
          <div className="flex items-center gap-2.5">
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
              className="w-9 h-9 rounded-lg bg-dark-800 border border-dark-700 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 hover:border-transparent flex items-center justify-center text-dark-400 hover:text-white transition-all">
              <Instagram size={15} />
            </a>
            <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" aria-label="YouTube"
              className="w-9 h-9 rounded-lg bg-dark-800 border border-dark-700 hover:bg-red-600 hover:border-transparent flex items-center justify-center text-dark-400 hover:text-white transition-all">
              <Youtube size={15} />
            </a>
          </div>
        </div>

        <div className="my-6 h-px bg-dark-800" />

        {/* ── Row 2: Quick links (3 cols) + Contact ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {quickLinks.map((col, i) => (
            <ul key={i} className="space-y-2">
              {col.map((l) => (
                <li key={l.to + l.label}>
                  <Link to={l.to} className="text-dark-400 hover:text-primary-400 text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          ))}

          {/* Contact column */}
          <ul className="space-y-2.5">
            <li className="flex items-center gap-2 text-dark-400 text-sm">
              <Mail size={13} className="text-primary-500 shrink-0" />
              <a href="mailto:support@danceacademy.com" className="hover:text-primary-400 transition-colors truncate">
                support@danceacademy.com
              </a>
            </li>
            <li className="flex items-center gap-2 text-dark-400 text-sm">
              <Phone size={13} className="text-primary-500 shrink-0" />
              <a href="tel:+910000000000" className="hover:text-primary-400 transition-colors">
                +91 00000 00000
              </a>
            </li>
            <li className="flex items-center gap-2 text-dark-400 text-sm">
              <MapPin size={13} className="text-primary-500 shrink-0" />
              <span>Mumbai, India</span>
            </li>
          </ul>
        </div>

        <div className="my-6 h-px bg-dark-800" />

        {/* ── Row 3: Copyright · Legal ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-dark-500 text-xs text-center sm:text-left">
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            {legal.map((l) => (
              <Link key={l.to} to={l.to} className="text-dark-500 hover:text-dark-300 text-xs transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}

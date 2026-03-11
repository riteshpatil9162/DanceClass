import { Link } from 'react-router-dom';
import { Music2, Instagram, Youtube, Mail, Phone, MapPin, ChevronRight, Heart } from 'lucide-react';

const APP_NAME = import.meta.env.VITE_APP_NAME || 'Dance Academy';
const INSTAGRAM_URL = import.meta.env.VITE_INSTAGRAM_URL || '#';
const YOUTUBE_URL = import.meta.env.VITE_YOUTUBE_URL || '#';

const footerLinks = {
  learn: [
    { label: 'All Courses', to: '/courses' },
    { label: 'Course Packages', to: '/packages' },
    { label: 'Free Courses', to: '/courses?filter=free' },
    { label: 'Popular Courses', to: '/courses?sort=popular' },
  ],
  events: [
    { label: 'Upcoming Events', to: '/events' },
    { label: 'Book an Event', to: '/events' },
    { label: 'Past Events', to: '/events?filter=past' },
  ],
  company: [
    { label: 'About Us', to: '/about' },
    { label: 'Contact', to: '/contact' },
    { label: 'Privacy Policy', to: '/privacy' },
    { label: 'Terms & Conditions', to: '/terms' },
    { label: 'Refund Policy', to: '/refund' },
  ],
};

function FooterLinkList({ links }) {
  return (
    <ul className="space-y-2.5">
      {links.map((link) => (
        <li key={link.to + link.label}>
          <Link
            to={link.to}
            className="flex items-center gap-1.5 text-dark-400 hover:text-primary-400 text-sm transition-colors duration-200 group"
          >
            <ChevronRight
              size={13}
              className="shrink-0 text-dark-600 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all duration-200"
            />
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function Footer() {
  return (
    <footer className="bg-dark-950 border-t border-dark-800/60">
      {/* Top accent line */}
      <div className="h-px bg-orange-gradient opacity-60" />

      {/* Main grid */}
      <div className="page-container py-14 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">

          {/* ── Brand column ── */}
          <div className="sm:col-span-2 lg:col-span-4">
            {/* Logo */}
            <Link to="/" className="inline-flex items-center gap-2.5 mb-5 group">
              <div className="w-10 h-10 bg-orange-gradient rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform duration-200">
                <Music2 size={20} className="text-white" />
              </div>
              <span className="text-xl font-heading font-bold text-white group-hover:text-primary-400 transition-colors duration-200">
                {APP_NAME}
              </span>
            </Link>

            <p className="text-dark-400 text-sm leading-relaxed mb-6 max-w-xs">
              Learn dance from the comfort of your home. Expert-led courses, live
              workshops and exciting events — for every style, every level.
            </p>

            {/* Social */}
            <div className="flex items-center gap-3 mb-8">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-xl bg-dark-800 border border-dark-700 hover:border-pink-500/60 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 flex items-center justify-center text-dark-300 hover:text-white transition-all duration-300"
              >
                <Instagram size={17} />
              </a>
              <a
                href={YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-10 h-10 rounded-xl bg-dark-800 border border-dark-700 hover:border-red-500/60 hover:bg-red-600 flex items-center justify-center text-dark-300 hover:text-white transition-all duration-300"
              >
                <Youtube size={17} />
              </a>
            </div>

            {/* Contact info */}
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-dark-400 text-sm">
                <span className="w-7 h-7 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center shrink-0">
                  <Mail size={13} className="text-primary-400" />
                </span>
                <a href="mailto:support@danceacademy.com" className="hover:text-primary-400 transition-colors duration-200">
                  support@danceacademy.com
                </a>
              </li>
              <li className="flex items-center gap-3 text-dark-400 text-sm">
                <span className="w-7 h-7 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center shrink-0">
                  <Phone size={13} className="text-primary-400" />
                </span>
                <a href="tel:+910000000000" className="hover:text-primary-400 transition-colors duration-200">
                  +91 00000 00000
                </a>
              </li>
              <li className="flex items-start gap-3 text-dark-400 text-sm">
                <span className="w-7 h-7 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={13} className="text-primary-400" />
                </span>
                <span>Mumbai, Maharashtra, India</span>
              </li>
            </ul>
          </div>

          {/* ── Learn column ── */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h4 className="text-white font-semibold text-xs uppercase tracking-widest mb-5 flex items-center gap-2">
              <span className="w-4 h-px bg-primary-500" />
              Learn
            </h4>
            <FooterLinkList links={footerLinks.learn} />
          </div>

          {/* ── Events column ── */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold text-xs uppercase tracking-widest mb-5 flex items-center gap-2">
              <span className="w-4 h-px bg-primary-500" />
              Events
            </h4>
            <FooterLinkList links={footerLinks.events} />
          </div>

          {/* ── Company column ── */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold text-xs uppercase tracking-widest mb-5 flex items-center gap-2">
              <span className="w-4 h-px bg-primary-500" />
              Company
            </h4>
            <FooterLinkList links={footerLinks.company} />
          </div>

          {/* ── Newsletter column ── */}
          <div className="sm:col-span-2 lg:col-span-2">
            <h4 className="text-white font-semibold text-xs uppercase tracking-widest mb-5 flex items-center gap-2">
              <span className="w-4 h-px bg-primary-500" />
              Stay Updated
            </h4>
            <p className="text-dark-400 text-sm leading-relaxed mb-4">
              Get the latest classes, events and offers straight to your inbox.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col gap-2"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="input-field text-sm py-2.5"
                aria-label="Email for newsletter"
              />
              <button type="submit" className="btn-primary py-2.5 text-sm w-full">
                Subscribe
              </button>
            </form>

            {/* Dance styles pill tags */}
            <div className="mt-6">
              <p className="text-dark-500 text-xs uppercase tracking-wider mb-3">Styles we teach</p>
              <div className="flex flex-wrap gap-1.5">
                {['Bollywood', 'Hip-Hop', 'Classical', 'Freestyle', 'Salsa'].map((style) => (
                  <span
                    key={style}
                    className="px-2.5 py-1 bg-dark-800 border border-dark-700 rounded-full text-xs text-dark-300 hover:border-primary-500/40 hover:text-primary-400 transition-colors duration-200 cursor-default"
                  >
                    {style}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-dark-800/60">
        <div className="page-container py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-dark-500 text-xs text-center sm:text-left">
              &copy; {new Date().getFullYear()}{' '}
              <span className="text-dark-400 font-medium">{APP_NAME}</span>. All rights reserved.
            </p>

            <p className="text-dark-600 text-xs flex items-center gap-1.5">
              Made with <Heart size={11} className="text-red-500 fill-red-500" /> in India
            </p>

            <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-end">
              <Link to="/privacy" className="text-dark-500 hover:text-dark-300 text-xs transition-colors duration-200">
                Privacy
              </Link>
              <Link to="/terms" className="text-dark-500 hover:text-dark-300 text-xs transition-colors duration-200">
                Terms
              </Link>
              <Link to="/refund" className="text-dark-500 hover:text-dark-300 text-xs transition-colors duration-200">
                Refund
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

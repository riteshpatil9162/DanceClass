import { Link } from 'react-router-dom';
import { BookOpen, Instagram, Youtube, Mail, Phone, MapPin, ChevronRight } from 'lucide-react';

const APP_NAME = import.meta.env.VITE_APP_NAME || 'Course';
const INSTAGRAM_URL = import.meta.env.VITE_INSTAGRAM_URL || '#';
const YOUTUBE_URL = import.meta.env.VITE_YOUTUBE_URL || '#';

const footerLinks = {
  courses: [
    { label: 'All Courses', to: '/courses' },
    { label: 'Course Packages', to: '/packages' },
    { label: 'Free Courses', to: '/courses?filter=free' },
    { label: 'Featured Courses', to: '/courses?sort=popular' },
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

export default function Footer() {
  return (
    <footer className="bg-dark-950 border-t border-dark-800">
      {/* Main Footer */}
      <div className="page-container py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-5 group">
              <div className="w-10 h-10 bg-orange-gradient rounded-lg flex items-center justify-center">
                <BookOpen size={22} className="text-white" />
              </div>
              <span className="text-xl font-heading font-bold text-white">{APP_NAME}</span>
            </Link>
            <p className="text-dark-400 text-sm leading-relaxed mb-6">
              Empowering learners with world-class online education. Start your journey today with expert-led courses and live events.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-dark-800 hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 flex items-center justify-center text-dark-300 hover:text-white transition-all duration-300 group"
                aria-label="Follow us on Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href={YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-dark-800 hover:bg-red-600 flex items-center justify-center text-dark-300 hover:text-white transition-all duration-300"
                aria-label="Subscribe on YouTube"
              >
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Courses */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Courses</h4>
            <ul className="space-y-2.5">
              {footerLinks.courses.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="flex items-center gap-1.5 text-dark-400 hover:text-primary-400 text-sm transition-colors group"
                  >
                    <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Events */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Events</h4>
            <ul className="space-y-2.5 mb-6">
              {footerLinks.events.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="flex items-center gap-1.5 text-dark-400 hover:text-primary-400 text-sm transition-colors group"
                  >
                    <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="flex items-center gap-1.5 text-dark-400 hover:text-primary-400 text-sm transition-colors group"
                  >
                    <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-dark-400 text-sm">
                <Mail size={16} className="text-primary-500 mt-0.5 shrink-0" />
                <span>support@course.com</span>
              </li>
              <li className="flex items-start gap-3 text-dark-400 text-sm">
                <Phone size={16} className="text-primary-500 mt-0.5 shrink-0" />
                <span>+91 00000 00000</span>
              </li>
              <li className="flex items-start gap-3 text-dark-400 text-sm">
                <MapPin size={16} className="text-primary-500 mt-0.5 shrink-0" />
                <span>India</span>
              </li>
            </ul>

            {/* Newsletter */}
            <div className="mt-6">
              <p className="text-white text-sm font-medium mb-2">Stay Updated</p>
              <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                <input
                  type="email"
                  placeholder="Your email"
                  className="input-field text-sm py-2 flex-1 min-w-0"
                />
                <button className="btn-primary btn-sm px-4 py-2 shrink-0">
                  Go
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-dark-800">
        <div className="page-container py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-dark-500 text-sm">
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="text-dark-500 hover:text-dark-300 text-xs transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-dark-500 hover:text-dark-300 text-xs transition-colors">
              Terms of Service
            </Link>
            <Link to="/refund" className="text-dark-500 hover:text-dark-300 text-xs transition-colors">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

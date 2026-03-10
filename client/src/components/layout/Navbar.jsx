import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, BookOpen, User, LogOut, ChevronDown, LayoutDashboard } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const APP_NAME = import.meta.env.VITE_APP_NAME || 'Course';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Courses', to: '/courses' },
  { label: 'Events', to: '/events' },
  { label: 'Packages', to: '/packages' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-dark-950/95 backdrop-blur-md border-b border-dark-700 shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="page-container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-orange-gradient rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen size={20} className="text-white" />
            </div>
            <span className="text-xl font-heading font-bold text-white">
              {APP_NAME}
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-primary-400 bg-primary-500/10'
                      : 'text-dark-300 hover:text-white hover:bg-dark-700'
                  }`
                }
                end={link.to === '/'}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors text-sm font-medium"
                >
                  <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[120px] truncate">{user?.name}</span>
                  <ChevronDown size={14} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-dark-800 border border-dark-700 rounded-xl shadow-xl overflow-hidden z-50">
                    <Link
                      to="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-dark-300 hover:text-white hover:bg-dark-700 transition-colors"
                    >
                      <LayoutDashboard size={15} /> My Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-dark-300 hover:text-white hover:bg-dark-700 transition-colors"
                    >
                      <User size={15} /> Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-dark-700 transition-colors"
                    >
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-dark btn-sm">
                  Login
                </Link>
                <Link to="/register" className="btn-primary btn-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-dark-950/98 backdrop-blur-md border-t border-dark-700">
          <div className="page-container py-4 space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-primary-400 bg-primary-500/10'
                      : 'text-dark-300 hover:text-white hover:bg-dark-700'
                  }`
                }
                end={link.to === '/'}
              >
                {link.label}
              </NavLink>
            ))}
            <div className="pt-3 border-t border-dark-700 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="btn-dark text-center py-2.5 text-sm rounded-lg"
                  >
                    My Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="btn-dark text-center py-2.5 text-sm rounded-lg"
                  >
                    Profile
                  </Link>
                  <button onClick={handleLogout} className="btn-danger text-sm py-2.5 rounded-lg w-full">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)} className="btn-dark text-center py-2.5 text-sm rounded-lg">
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setIsOpen(false)} className="btn-primary text-center py-2.5 text-sm rounded-lg">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close user menu */}
      {userMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </nav>
  );
}

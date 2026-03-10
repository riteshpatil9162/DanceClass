import { Link, NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, BookOpen, Calendar, Package, Users, ShoppingBag,
  Shield, Settings, LogOut, Menu, X, ChevronRight, BookMarked
} from 'lucide-react';
import useAdminStore from '../../store/adminStore';

const APP_NAME = import.meta.env.VITE_APP_NAME || 'Course';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', permission: null },
  { to: '/admin/courses', icon: BookOpen, label: 'Courses', permission: 'manage_courses' },
  { to: '/admin/events', icon: Calendar, label: 'Events', permission: 'manage_events' },
  { to: '/admin/packages', icon: Package, label: 'Packages', permission: 'manage_packages' },
  { to: '/admin/users', icon: Users, label: 'Users', permission: 'manage_users' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Orders', permission: 'manage_orders' },
  { to: '/admin/admins', icon: Shield, label: 'Admins', permission: 'manage_admins' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { admin, adminLogout, hasPermission } = useAdminStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    adminLogout();
    navigate('/login');
  };

  const visibleItems = navItems.filter(
    (item) => !item.permission || (admin?.isSuperAdmin || hasPermission(item.permission))
  );

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-dark-900 border-r border-dark-700 transform transition-transform duration-300 flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-2 px-5 border-b border-dark-700 shrink-0">
          <div className="w-8 h-8 bg-orange-gradient rounded-lg flex items-center justify-center">
            <BookMarked size={16} className="text-white" />
          </div>
          <span className="font-heading font-bold text-white">{APP_NAME}</span>
          <span className="text-xs bg-primary-500/20 text-primary-400 px-1.5 py-0.5 rounded ml-auto">Admin</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {visibleItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `admin-sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={17} />
              <span className="text-sm font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom - Admin info + logout */}
        <div className="p-3 border-t border-dark-700">
          <div className="flex items-center gap-3 px-4 py-3 bg-dark-800 rounded-lg mb-2">
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {admin?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{admin?.name}</p>
              <p className="text-dark-400 text-xs capitalize">{admin?.role}</p>
            </div>
          </div>
          <Link
            to="/"
            target="_blank"
            className="admin-sidebar-link text-xs py-2"
          >
            <ChevronRight size={14} /> View Website
          </Link>
          <button onClick={handleLogout} className="admin-sidebar-link text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full text-xs py-2">
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-dark-900 border-b border-dark-700 flex items-center px-4 gap-4 shrink-0 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-white"
          >
            <Menu size={18} />
          </button>
          <h1 className="text-white font-semibold text-sm hidden sm:block">Admin Dashboard</h1>
          <div className="ml-auto flex items-center gap-2 text-xs text-dark-400">
            {admin?.isSuperAdmin && <span className="badge-primary">Super Admin</span>}
            <span>{admin?.email}</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

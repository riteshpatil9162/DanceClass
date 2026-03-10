import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Users, BookOpen, Calendar, Package, ShoppingBag, TrendingUp, DollarSign, Star } from 'lucide-react';
import { getDashboardStats } from '../../api';
import Spinner from '../../components/common/Spinner';
import useAdminStore from '../../store/adminStore';
import { Link } from 'react-router-dom';

const APP_NAME = import.meta.env.VITE_APP_NAME || 'Course';

export default function AdminDashboardPage() {
  const { admin } = useAdminStore();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => getDashboardStats().then((r) => r.data.data),
  });

  const statCards = stats ? [
    { icon: Users, label: 'Total Users', value: stats.totalUsers?.toLocaleString(), color: 'text-blue-400', bg: 'bg-blue-400/10', link: '/admin/users' },
    { icon: BookOpen, label: 'Active Courses', value: stats.totalCourses?.toLocaleString(), color: 'text-primary-400', bg: 'bg-primary-400/10', link: '/admin/courses' },
    { icon: Calendar, label: 'Active Events', value: stats.totalEvents?.toLocaleString(), color: 'text-purple-400', bg: 'bg-purple-400/10', link: '/admin/events' },
    { icon: Package, label: 'Packages', value: stats.totalPackages?.toLocaleString(), color: 'text-green-400', bg: 'bg-green-400/10', link: '/admin/packages' },
    { icon: ShoppingBag, label: 'Total Orders', value: stats.totalOrders?.toLocaleString(), color: 'text-yellow-400', bg: 'bg-yellow-400/10', link: '/admin/orders' },
    { icon: DollarSign, label: 'Total Revenue', value: `₹${stats.totalRevenue?.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: 'text-emerald-400', bg: 'bg-emerald-400/10', link: '/admin/orders' },
  ] : [];

  const quickActions = [
    { label: 'Add Course', to: '/admin/courses', icon: BookOpen, desc: 'Create a new course' },
    { label: 'Add Event', to: '/admin/events', icon: Calendar, desc: 'Schedule an event' },
    { label: 'Add Package', to: '/admin/packages', icon: Package, desc: 'Create a combo package' },
    { label: 'Manage Admins', to: '/admin/admins', icon: Users, desc: 'Admin permissions' },
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard - {APP_NAME} Admin</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-white">
          Welcome back, {admin?.name}!
        </h1>
        <p className="text-dark-400 text-sm mt-1">Here's what's happening on your platform today.</p>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <Spinner size="lg" className="py-12" />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {statCards.map(({ icon: Icon, label, value, color, bg, link }) => (
            <Link key={label} to={link} className="card p-5 hover:border-dark-600 block">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={20} className={color} />
              </div>
              <div className={`text-2xl font-bold ${color} font-heading`}>{value}</div>
              <div className="text-dark-400 text-xs mt-1">{label}</div>
            </Link>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-heading font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map(({ label, to, icon: Icon, desc }) => (
            <Link key={to} to={to} className="glass-card p-4 hover:border-primary-500/30 transition-all duration-300 group">
              <Icon size={22} className="text-primary-500 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-white text-sm font-medium">{label}</p>
              <p className="text-dark-400 text-xs mt-0.5">{desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Admin Info */}
      <div className="glass-card p-5">
        <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
          <Star size={16} className="text-primary-500" /> Your Admin Info
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-dark-400 text-xs mb-1">Role</p>
            <p className="text-white capitalize">{admin?.role}</p>
          </div>
          <div>
            <p className="text-dark-400 text-xs mb-1">Account Type</p>
            <p className="text-white">{admin?.isSuperAdmin ? 'Super Admin' : 'Admin'}</p>
          </div>
          <div>
            <p className="text-dark-400 text-xs mb-1">Permissions</p>
            <p className="text-white">{admin?.isSuperAdmin ? 'All Access' : `${admin?.permissions?.length || 0} permissions`}</p>
          </div>
          <div>
            <p className="text-dark-400 text-xs mb-1">Email</p>
            <p className="text-white truncate">{admin?.email}</p>
          </div>
        </div>
      </div>
    </>
  );
}

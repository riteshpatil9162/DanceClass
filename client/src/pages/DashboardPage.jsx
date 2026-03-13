import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  BookOpen, Calendar, ShoppingBag, User, Clock,
  CheckCircle, XCircle, Play,
} from 'lucide-react';
import { getUserProfile, getUserOrders } from '../api';
import useAuthStore from '../store/authStore';
import Spinner from '../components/common/Spinner';
import { format } from 'date-fns';

const APP_NAME = import.meta.env.VITE_APP_NAME || 'Course';
const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

export default function DashboardPage() {
  const { user, setUser } = useAuthStore();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => getUserProfile().then((r) => r.data.data),
    onSuccess: (data) => {
      // Keep zustand store in sync so hasCourseAccess() is always fresh
      if (data) setUser(data);
    },
  });

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['user-orders'],
    queryFn: () => getUserOrders().then((r) => r.data.data),
  });

  const currentUser = profile || user;
  const orders = ordersData || [];

  const activeCourses = currentUser?.purchasedCourses?.filter((p) => {
    if (!p.expiresAt) return true;
    return new Date(p.expiresAt) > new Date();
  }) || [];

  const bookedEvents = currentUser?.bookedEvents || [];

  return (
    <>
      <Helmet>
        <title>My Dashboard - {APP_NAME}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="page-container py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10 flex-wrap">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary-500 flex items-center justify-center text-white text-xl sm:text-2xl font-bold font-heading shrink-0">
            {currentUser?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-heading font-bold text-white truncate">
              Welcome, {currentUser?.name}!
            </h1>
            <p className="text-dark-400 text-sm truncate">{currentUser?.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: BookOpen, label: 'Active Courses', value: activeCourses.length, color: 'text-primary-500' },
            { icon: Calendar, label: 'Events Booked', value: bookedEvents.length, color: 'text-blue-500' },
            { icon: ShoppingBag, label: 'Total Orders', value: orders.length, color: 'text-green-500' },
            {
              icon: User,
              label: 'Member Since',
              value: format(new Date(currentUser?.createdAt || Date.now()), 'MMM yyyy'),
              color: 'text-purple-500',
            },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="card p-5">
              <Icon size={20} className={`${color} mb-3`} />
              <div className="text-xl sm:text-2xl font-bold text-white font-heading">{value}</div>
              <div className="text-dark-400 text-xs mt-1">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ── My Courses ── */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-heading font-semibold text-white">My Courses</h2>
              <Link to="/courses" className="text-primary-400 text-sm hover:text-primary-300">
                Browse More
              </Link>
            </div>

            {profileLoading ? (
              <Spinner size="md" className="py-8" />
            ) : activeCourses.length === 0 ? (
              <div className="card p-8 text-center">
                <BookOpen size={40} className="text-dark-600 mx-auto mb-3" />
                <p className="text-dark-400 text-sm mb-4">No courses purchased yet</p>
                <Link to="/courses" className="btn-primary btn-sm">
                  Explore Courses
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {activeCourses.slice(0, 5).map((item, idx) => {
                  const course = item.course;
                  if (!course) return null;
                  const thumbnail = course.thumbnail
                    ? course.thumbnail.startsWith('http')
                      ? course.thumbnail
                      : `${API_URL}${course.thumbnail}`
                    : null;
                  const expired = item.expiresAt && new Date(item.expiresAt) <= new Date();
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 bg-dark-800 border border-dark-700 rounded-xl p-3 hover:border-dark-600 transition-colors"
                    >
                      {/* Thumbnail */}
                      <div className="w-14 h-14 rounded-lg bg-dark-700 overflow-hidden shrink-0">
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl">
                            📚
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{course.title}</p>
                        <p className="text-dark-400 text-xs mt-0.5 flex items-center gap-1">
                          <Clock size={10} />
                          {item.expiresAt
                            ? expired
                              ? 'Expired'
                              : `Expires ${format(new Date(item.expiresAt), 'dd MMM yyyy')}`
                            : 'Lifetime Access'}
                        </p>
                      </div>

                      {/* CTA — links directly to the course player */}
                      {expired ? (
                        <span className="text-xs text-red-400 font-medium shrink-0">Expired</span>
                      ) : (
                        <Link
                          to={`/courses/${course.slug}/learn`}
                          className="btn-primary btn-sm px-3 py-1.5 text-xs shrink-0 flex items-center gap-1.5"
                        >
                          <Play size={12} /> Watch
                        </Link>
                      )}
                    </div>
                  );
                })}

                {activeCourses.length > 5 && (
                  <p className="text-dark-400 text-xs text-center pt-1">
                    +{activeCourses.length - 5} more course{activeCourses.length - 5 > 1 ? 's' : ''} in your library
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ── Recent Orders ── */}
          <div>
            <h2 className="text-xl font-heading font-semibold text-white mb-5">Recent Orders</h2>
            {ordersLoading ? (
              <Spinner size="md" className="py-8" />
            ) : orders.length === 0 ? (
              <div className="card p-8 text-center">
                <ShoppingBag size={40} className="text-dark-600 mx-auto mb-3" />
                <p className="text-dark-400 text-sm">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 6).map((order) => (
                  <div
                    key={order._id}
                    className="flex items-center gap-3 bg-dark-800 border border-dark-700 rounded-xl p-3"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        order.status === 'paid' || order.status === 'free'
                          ? 'bg-green-500/20'
                          : 'bg-red-500/20'
                      }`}
                    >
                      {order.status === 'paid' || order.status === 'free' ? (
                        <CheckCircle size={16} className="text-green-400" />
                      ) : (
                        <XCircle size={16} className="text-red-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">
                        {order.course?.title ||
                          order.event?.title ||
                          order.package?.title ||
                          'Order'}
                      </p>
                      <p className="text-dark-400 text-xs capitalize">
                        {order.orderType} • {order.status}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-white text-sm font-medium">
                        {order.isFree || order.amount === 0
                          ? 'FREE'
                          : `₹${(order.amount / 100).toLocaleString()}`}
                      </p>
                      <p className="text-dark-500 text-xs">
                        {format(new Date(order.createdAt), 'dd MMM')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Helmet } from 'react-helmet-async';

import { useAuthStore } from './store/authStore';
import { useAdminStore } from './store/adminStore';

import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/admin/AdminLayout';
import PageLoader from './components/common/PageLoader';

// ─── Public Pages ──────────────────────────────────────────────────────────────
const HomePage = lazy(() => import('./pages/HomePage'));
const CoursesPage = lazy(() => import('./pages/CoursesPage'));
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage'));
const EventBookingPortalPage = lazy(() => import('./pages/EventBookingPortalPage'));
const PackagesPage = lazy(() => import('./pages/PackagesPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const RefundPage = lazy(() => import('./pages/RefundPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// ─── Admin Pages ───────────────────────────────────────────────────────────────
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminCoursesPage = lazy(() => import('./pages/admin/AdminCoursesPage'));
const AdminEventsPage = lazy(() => import('./pages/admin/AdminEventsPage'));
const AdminPackagesPage = lazy(() => import('./pages/admin/AdminPackagesPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminAdminsPage = lazy(() => import('./pages/admin/AdminAdminsPage'));

// ─── Protected Route Guards ────────────────────────────────────────────────────

/** Requires a logged-in user — redirects to /login if not authenticated */
function RequireUser() {
  const { user, loading } = useAuthStore();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

/** Redirects already-logged-in users away from login/register */
function RedirectIfUser() {
  const { user } = useAuthStore();
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

/** Requires a logged-in admin — redirects to /login if not authenticated */
function RequireAdmin() {
  const { admin, loading } = useAdminStore();
  if (loading) return <PageLoader />;
  if (!admin) return <Navigate to="/login" replace />;
  return <Outlet />;
}

// ─── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <Helmet
        defaultTitle={import.meta.env.VITE_APP_NAME}
        titleTemplate={`%s — ${import.meta.env.VITE_APP_NAME}`}
      />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── Public routes (with Navbar + Footer) ── */}
          <Route element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="courses/:slug" element={<CourseDetailPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="events/:slug" element={<EventDetailPage />} />
            <Route path="packages" element={<PackagesPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="terms" element={<TermsPage />} />
            <Route path="refund" element={<RefundPage />} />

            {/* Auth pages — redirect away if already logged in */}
            <Route element={<RedirectIfUser />}>
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
            </Route>

            {/* Protected user routes */}
            <Route element={<RequireUser />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* ── Event booking portal (standalone, no main layout) ── */}
          <Route path="/book/:bookingSlug" element={<EventBookingPortalPage />} />

          {/* ── Admin section ── */}
          <Route path="/admin">
            {/* Protected admin routes */}
            <Route element={<RequireAdmin />}>
              <Route element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="courses" element={<AdminCoursesPage />} />
                <Route path="events" element={<AdminEventsPage />} />
                <Route path="packages" element={<AdminPackagesPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="admins" element={<AdminAdminsPage />} />
              </Route>
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

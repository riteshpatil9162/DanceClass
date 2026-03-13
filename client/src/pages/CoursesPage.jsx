import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Search, Filter, X, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCourses, getCategories } from '../api';
import CourseCard from '../components/courses/CourseCard';
import Spinner from '../components/common/Spinner';
import useAuthStore from '../store/authStore';

const APP_NAME = import.meta.env.VITE_APP_NAME || 'Course';

export default function CoursesPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');
  const [page, setPage] = useState(1);
  const [showPurchased, setShowPurchased] = useState(false);

  const { isAuthenticated, hasCourseAccess } = useAuthStore();

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories().then((r) => r.data.data),
  });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['courses', search, category, sort, page],
    queryFn: () => getCourses({ search, category, sort, page, limit: 12 }).then((r) => r.data),
    keepPreviousData: true,
  });

  const allCourses = data?.data || [];
  // Filter out purchased courses from the main listing unless user wants to see them
  const courses = showPurchased
    ? allCourses
    : allCourses.filter((c) => !hasCourseAccess(c._id));
  const meta = data?.meta;
  const purchasedCount = isAuthenticated ? allCourses.filter((c) => hasCourseAccess(c._id)).length : 0;

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setSort('');
    setPage(1);
  };

  const hasFilters = search || category || sort;

  return (
    <>
      <Helmet>
        <title>All Courses - {APP_NAME}</title>
        <meta name="description" content="Browse our comprehensive collection of expert-led online courses. Find the perfect course for your learning goals." />
        <meta name="keywords" content="online courses, e-learning, skill development, professional training" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      {/* Header */}
      <div className="bg-dark-900/80 border-b border-dark-700 py-12">
        <div className="page-container text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-white mb-2">All Courses</h1>
          <p className="text-dark-400">
            {meta?.total || 0} courses available to start your journey
          </p>
        </div>
      </div>

      {/* My Purchased Courses Banner */}
      {isAuthenticated && purchasedCount > 0 && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/20">
          <div className="page-container py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-emerald-400 text-sm">
              <BookOpen size={16} />
              <span>You have <strong>{purchasedCount}</strong> purchased course{purchasedCount > 1 ? 's' : ''} {showPurchased ? 'shown below' : 'hidden from this list'}.</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPurchased((v) => !v)}
                className="text-xs text-emerald-400 underline underline-offset-2 hover:text-emerald-300"
              >
                {showPurchased ? 'Hide purchased' : 'Show purchased'}
              </button>
              <Link to="/dashboard" className="btn-sm bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30 text-xs px-3 py-1.5 rounded-lg">
                My Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="page-container py-10">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-8">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input-field pl-10 py-2.5 w-full"
            />
          </div>

          {/* Category */}
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="input-field w-full sm:w-auto py-2.5"
          >
            <option value="">All Categories</option>
            {(categoriesData || []).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="input-field w-full sm:w-auto py-2.5"
          >
            <option value="">Newest First</option>
            <option value="popular">Most Popular</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>

          {hasFilters && (
            <button onClick={clearFilters} className="btn-dark btn-sm flex items-center gap-1.5 py-2.5 w-full sm:w-auto justify-center">
              <X size={14} /> Clear
            </button>
          )}
        </div>

        {/* Course Grid */}
        {isLoading ? (
          <Spinner size="lg" className="py-24" />
        ) : courses.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-6xl mb-4">📚</p>
            {!showPurchased && purchasedCount > 0 && !hasFilters ? (
              <>
                <h3 className="text-white font-semibold text-xl mb-2">You've purchased all available courses!</h3>
                <p className="text-dark-400 mb-6">All courses here are already in your library.</p>
                <Link to="/dashboard" className="btn-primary">Go to My Dashboard</Link>
              </>
            ) : (
              <>
                <h3 className="text-white font-semibold text-xl mb-2">No Courses Found</h3>
                <p className="text-dark-400 mb-6">Try adjusting your filters or search term</p>
                <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
              </>
            )}
          </div>
        ) : (
          <>
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity ${isFetching ? 'opacity-60' : 'opacity-100'}`}>
              {courses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>

            {/* Pagination */}
            {meta && meta.pages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-dark btn-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: meta.pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      p === page ? 'bg-primary-500 text-white' : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
                  disabled={page === meta.pages}
                  className="btn-dark btn-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

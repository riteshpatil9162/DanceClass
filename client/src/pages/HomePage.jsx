import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Play, Users, BookOpen, Star, Award, Zap, TrendingUp } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { getFeaturedCourses, getUpcomingEvents, getPackages } from '../api';
import CourseCard from '../components/courses/CourseCard';
import EventCard from '../components/events/EventCard';
import Spinner from '../components/common/Spinner';

const APP_NAME = import.meta.env.VITE_APP_NAME || 'Course';

const stats = [
  { icon: Users, value: '10,000+', label: 'Happy Students' },
  { icon: BookOpen, value: '100+', label: 'Courses Available' },
  { icon: Star, value: '4.9/5', label: 'Average Rating' },
  { icon: Award, value: '50+', label: 'Expert Instructors' },
];

const features = [
  { icon: Zap, title: 'Learn at Your Pace', desc: 'Access courses anytime, on any device, at your convenience.' },
  { icon: Award, title: 'Expert Instructors', desc: 'Learn from industry professionals with real-world experience.' },
  { icon: TrendingUp, title: 'Career Growth', desc: 'Courses designed to accelerate your professional journey.' },
  { icon: Star, title: 'Lifetime Access', desc: 'Get lifetime access to purchased courses, learn forever.' },
];

export default function HomePage() {
  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ['featured-courses'],
    queryFn: () => getFeaturedCourses().then((r) => r.data.data),
  });

  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['upcoming-events'],
    queryFn: () => getUpcomingEvents().then((r) => r.data.data),
  });

  const { data: packagesData } = useQuery({
    queryKey: ['packages'],
    queryFn: () => getPackages().then((r) => r.data.data),
  });

  return (
    <>
      <Helmet>
        <title>{APP_NAME} - Learn. Grow. Succeed.</title>
        <meta name="description" content="Join thousands of learners on Course. Access expert-led online courses, live events, and course packages. Start learning today!" />
        <meta name="keywords" content="online courses, e-learning, events, skill development, professional courses" />
        <meta property="og:title" content={`${APP_NAME} - Learn. Grow. Succeed.`} />
        <meta property="og:description" content="Join thousands of learners. Access expert-led online courses, live events, and course packages." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-hero-pattern">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary-700/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-10 w-48 h-48 bg-primary-500/5 rounded-full blur-2xl" />
        </div>

        <div className="page-container relative z-10 py-20 w-full">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/30 rounded-full text-primary-400 text-sm font-medium mb-8">
              <Zap size={14} />
              <span>Start your learning journey today</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-black text-white leading-tight mb-6">
              Learn Skills That
              <br />
              <span className="text-gradient">Matter Most</span>
            </h1>

            <p className="text-dark-300 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
              Access world-class online courses, attend transformative live events, and join a community of passionate learners. Your success story starts here.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-12 sm:mb-16">
              <Link to="/courses" className="btn-primary text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4">
                Explore Courses <ArrowRight size={18} />
              </Link>
              <Link to="/events" className="btn-secondary text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4">
                <Play size={18} /> Upcoming Events
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {stats.map(({ icon: Icon, value, label }) => (
                <div key={label} className="glass-card p-4 text-center">
                  <Icon size={20} className="text-primary-500 mx-auto mb-2" />
                  <div className="text-white font-bold text-xl font-heading">{value}</div>
                  <div className="text-dark-400 text-xs mt-0.5">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="section-padding bg-dark-900/50">
        <div className="page-container">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-primary-500 font-medium text-sm uppercase tracking-wider mb-2">Top Picks</p>
              <h2 className="section-title">Featured Courses</h2>
              <p className="section-subtitle">Handpicked courses to accelerate your growth</p>
            </div>
            <Link to="/courses" className="btn-secondary btn-sm hidden md:flex">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {coursesLoading ? (
            <Spinner size="lg" className="py-20" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(coursesData || []).slice(0, 6).map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          )}

          <div className="flex justify-center mt-10 md:hidden">
            <Link to="/courses" className="btn-secondary">
              View All Courses <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding">
        <div className="page-container">
          <div className="text-center mb-14">
            <p className="text-primary-500 font-medium text-sm uppercase tracking-wider mb-2">Why Choose Us</p>
            <h2 className="section-title">Everything You Need to Succeed</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass-card p-6 text-center group hover:border-primary-500/30 transition-all duration-300">
                <div className="w-14 h-14 bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-500/20 transition-colors">
                  <Icon size={26} className="text-primary-500" />
                </div>
                <h3 className="text-white font-semibold mb-2">{title}</h3>
                <p className="text-dark-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      {eventsData && eventsData.length > 0 && (
        <section className="section-padding bg-dark-900/50">
          <div className="page-container">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
              <div>
                <p className="text-primary-500 font-medium text-sm uppercase tracking-wider mb-2">Don't Miss Out</p>
                <h2 className="section-title">Upcoming Events</h2>
                <p className="section-subtitle">Live sessions, workshops and seminars</p>
              </div>
              <Link to="/events" className="btn-secondary btn-sm hidden md:flex">
                All Events <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventsData.slice(0, 3).map((event) => (
                <EventCard key={event._id} event={event} showCountdown />
              ))}
            </div>
            <div className="flex justify-center mt-8 md:hidden">
              <Link to="/events" className="btn-secondary">
                View All Events <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Packages / Combos */}
      {packagesData && packagesData.length > 0 && (
        <section className="section-padding">
          <div className="page-container">
            <div className="text-center mb-12">
              <p className="text-primary-500 font-medium text-sm uppercase tracking-wider mb-2">Best Value</p>
              <h2 className="section-title">Course Packages & Combos</h2>
              <p className="section-subtitle">Buy a bundle and save more</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packagesData.slice(0, 3).map((pkg) => (
                <Link key={pkg._id} to={`/packages/${pkg.slug}`} className="card p-6 group block">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="badge-primary text-xs mb-2 block w-fit">Package Deal</span>
                      <h3 className="text-white font-bold text-lg group-hover:text-primary-400 transition-colors">{pkg.title}</h3>
                    </div>
                    {pkg.discount > 0 && (
                      <span className="badge-danger text-xs">{pkg.discount}% OFF</span>
                    )}
                  </div>
                  <p className="text-dark-400 text-sm mb-4 line-clamp-2">{pkg.description}</p>
                  <div className="flex items-center gap-2 mb-4 text-xs text-dark-400">
                    <BookOpen size={12} className="text-primary-500" />
                    <span>{pkg.courses?.length} courses included</span>
                    {pkg.bonusCourses?.length > 0 && (
                      <span className="text-emerald-400">+ {pkg.bonusCourses.length} FREE bonus</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-dark-700">
                    <div>
                      {pkg.isFree ? (
                        <span className="text-emerald-400 font-bold text-xl">FREE</span>
                      ) : (
                        <div className="flex items-baseline gap-2">
                          <span className="text-white font-bold text-xl">₹{(pkg.discountedPrice || pkg.price)?.toLocaleString()}</span>
                          {pkg.discountedPrice && (
                            <span className="text-dark-500 text-sm line-through">₹{pkg.price?.toLocaleString()}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <span className="text-primary-400 text-sm font-medium flex items-center gap-1">
                      Get Package <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            <div className="flex justify-center mt-8">
              <Link to="/packages" className="btn-secondary">
                View All Packages <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-black/10 rounded-full blur-3xl" />
        </div>
        <div className="page-container text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-black text-white mb-5">
            Ready to Start Learning?
          </h2>
          <p className="text-primary-100 text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of learners who have already transformed their careers. Get started for free today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="bg-white text-primary-600 hover:bg-primary-50 font-bold py-3 sm:py-4 px-7 sm:px-10 rounded-xl transition-all duration-200 transform hover:scale-105">
              Start for Free
            </Link>
            <Link to="/courses" className="border-2 border-white/50 text-white hover:bg-white/10 font-semibold py-3 sm:py-4 px-7 sm:px-10 rounded-xl transition-all duration-200">
              Browse Courses
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

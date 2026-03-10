import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import {
  Star, Users, Clock, Globe, Infinity, CheckCircle, Lock,
  ChevronDown, ChevronUp, Play, ShoppingCart, BookOpen
} from 'lucide-react';
import { getCourseBySlug, createCourseOrder, verifyCoursePayment } from '../api';
import useAuthStore from '../store/authStore';
import Spinner from '../components/common/Spinner';
import { loadRazorpay } from '../utils/razorpay';

const APP_NAME = import.meta.env.VITE_APP_NAME || 'Course';
const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function CourseDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, setAuth } = useAuthStore();
  const [expandedSection, setExpandedSection] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: course, isLoading, error } = useQuery({
    queryKey: ['course', slug],
    queryFn: () => getCourseBySlug(slug).then((r) => r.data.data),
  });

  const hasAccess = isAuthenticated && user && course
    ? user.purchasedCourses?.some((p) => {
        const id = p.course?._id || p.course;
        if (id !== course._id) return false;
        if (!p.expiresAt) return true;
        return new Date(p.expiresAt) > new Date();
      })
    : false;

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to purchase this course');
      navigate('/login', { state: { redirect: `/courses/${slug}` } });
      return;
    }

    if (course.isFree || course.price === 0) {
      // Free enrollment
      setIsProcessing(true);
      try {
        const res = await createCourseOrder({ courseId: course._id });
        if (res.data.isFree) {
          toast.success('Free course access granted!');
          window.location.reload();
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Enrollment failed');
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    setIsProcessing(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error('Payment gateway failed to load. Please try again.');
        setIsProcessing(false);
        return;
      }

      const orderRes = await createCourseOrder({ courseId: course._id });
      const { orderId, amount, currency, keyId, courseName } = orderRes.data.data;

      const options = {
        key: keyId,
        amount,
        currency,
        name: APP_NAME,
        description: courseName,
        order_id: orderId,
        handler: async (response) => {
          try {
            await verifyCoursePayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              courseId: course._id,
            });
            toast.success('Payment successful! Course access granted.');
            setTimeout(() => window.location.reload(), 1500);
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: '#f97316' },
        modal: { ondismiss: () => setIsProcessing(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not initiate payment');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return <Spinner size="lg" className="min-h-screen" />;
  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">😕</p>
          <h2 className="text-white text-2xl font-bold mb-2">Course Not Found</h2>
          <Link to="/courses" className="btn-primary mt-4">Browse Courses</Link>
        </div>
      </div>
    );
  }

  const thumbnail = course.thumbnail
    ? course.thumbnail.startsWith('http') ? course.thumbnail : `${API_URL}${course.thumbnail}`
    : null;

  const price = course.discountedPrice || course.price;
  const isFree = course.isFree || course.price === 0;
  const totalLectures = course.curriculum?.reduce((s, sec) => s + (sec.lectures?.length || 0), 0) || 0;

  return (
    <>
      <Helmet>
        <title>{course.metaTitle || course.title} - {APP_NAME}</title>
        <meta name="description" content={course.metaDescription || course.shortDescription || course.description?.slice(0, 160)} />
        <meta name="keywords" content={course.metaKeywords?.join(', ') || course.tags?.join(', ')} />
        <meta property="og:title" content={course.title} />
        <meta property="og:description" content={course.shortDescription || course.description?.slice(0, 200)} />
        {thumbnail && <meta property="og:image" content={thumbnail} />}
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      {/* Hero */}
      <div className="bg-dark-900 border-b border-dark-700">
        <div className="page-container py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left - Info */}
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="badge-primary">{course.category}</span>
                {isFree && <span className="badge-free">FREE</span>}
                {course.accessType === 'lifetime' && !isFree && (
                  <span className="badge bg-dark-700 text-dark-300 border-dark-600 flex items-center gap-1">
                    <Infinity size={10} /> Lifetime Access
                  </span>
                )}
                {course.accessType === 'fixed_period' && (
                  <span className="badge-warning">{course.accessDurationDays} Days Access</span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-white mb-4">{course.title}</h1>
              <p className="text-dark-300 text-lg mb-6">{course.shortDescription || course.description?.slice(0, 200)}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-dark-400 mb-6">
                {course.rating > 0 && (
                  <span className="flex items-center gap-1.5 text-yellow-400">
                    <Star size={14} className="fill-yellow-400" />
                    <span className="font-semibold">{course.rating.toFixed(1)}</span>
                    <span className="text-dark-400">({course.totalRatings} ratings)</span>
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Users size={14} className="text-primary-500" /> {course.totalStudents || 0} students
                </span>
                <span className="flex items-center gap-1.5">
                  <Globe size={14} className="text-primary-500" /> {course.language}
                </span>
                {totalLectures > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Play size={14} className="text-primary-500" /> {totalLectures} lectures
                  </span>
                )}
              </div>

              <p className="text-dark-400 text-sm">
                By <span className="text-white font-medium">{course.instructor}</span>
              </p>
            </div>

            {/* Right - Purchase Card (Desktop) */}
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <PurchaseCard
                  course={course}
                  thumbnail={thumbnail}
                  isFree={isFree}
                  price={price}
                  hasAccess={hasAccess}
                  isProcessing={isProcessing}
                  onPurchase={handlePurchase}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Purchase Bar */}
      <div className="lg:hidden sticky top-14 z-30 bg-dark-900/95 backdrop-blur-md border-b border-dark-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            {isFree ? (
              <span className="text-emerald-400 font-bold text-xl">FREE</span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-xl">₹{price?.toLocaleString()}</span>
                {course.discountedPrice && (
                  <span className="text-dark-500 text-sm line-through">₹{course.price?.toLocaleString()}</span>
                )}
              </div>
            )}
          </div>
          {hasAccess ? (
            <button className="btn-primary btn-sm">Access Course</button>
          ) : (
            <button onClick={handlePurchase} disabled={isProcessing} className="btn-primary btn-sm">
              {isProcessing ? <Spinner size="sm" /> : isFree ? 'Enroll Free' : 'Buy Now'}
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="page-container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {/* Description */}
            <section>
              <h2 className="text-xl font-heading font-bold text-white mb-4">About This Course</h2>
              <p className="text-dark-300 leading-relaxed whitespace-pre-line">{course.description}</p>
            </section>

            {/* Tags */}
            {course.tags?.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wider mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {course.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-dark-800 border border-dark-700 rounded-full text-xs text-dark-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Curriculum */}
            {course.curriculum?.length > 0 && (
              <section>
                <h2 className="text-xl font-heading font-bold text-white mb-2">Course Curriculum</h2>
                <p className="text-dark-400 text-sm mb-4">{totalLectures} lectures in {course.curriculum.length} sections</p>
                <div className="space-y-3">
                  {course.curriculum.map((section, idx) => (
                    <div key={idx} className="border border-dark-700 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedSection(expandedSection === idx ? -1 : idx)}
                        className="w-full flex items-center justify-between px-5 py-4 bg-dark-800 hover:bg-dark-700 transition-colors text-left"
                      >
                        <div>
                          <span className="text-white font-medium">{section.sectionTitle}</span>
                          <span className="text-dark-400 text-xs ml-2">({section.lectures?.length || 0} lectures)</span>
                        </div>
                        {expandedSection === idx ? <ChevronUp size={16} className="text-dark-400" /> : <ChevronDown size={16} className="text-dark-400" />}
                      </button>
                      {expandedSection === idx && (
                        <div className="divide-y divide-dark-800">
                          {(section.lectures || []).map((lecture, lIdx) => (
                            <div key={lIdx} className="flex items-center gap-3 px-5 py-3 bg-dark-900">
                              {lecture.isFree || hasAccess ? (
                                <Play size={14} className="text-primary-500 shrink-0" />
                              ) : (
                                <Lock size={14} className="text-dark-500 shrink-0" />
                              )}
                              <span className={`text-sm flex-1 ${lecture.isFree || hasAccess ? 'text-dark-200' : 'text-dark-500'}`}>
                                {lecture.title}
                              </span>
                              {lecture.duration && (
                                <span className="text-xs text-dark-500">{lecture.duration}</span>
                              )}
                              {lecture.isFree && !hasAccess && (
                                <span className="badge-free text-xs">Preview</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right - Purchase Card (Mobile/Tablet hidden on lg) */}
          <div className="lg:block hidden">
            {/* Already rendered in sticky above */}
          </div>
        </div>
      </div>
    </>
  );
}

function PurchaseCard({ course, thumbnail, isFree, price, hasAccess, isProcessing, onPurchase }) {
  return (
    <div className="card overflow-hidden">
      {thumbnail && (
        <img src={thumbnail} alt={course.title} className="w-full aspect-video object-cover" />
      )}
      <div className="p-6">
        {isFree ? (
          <div className="text-emerald-400 font-bold text-3xl mb-1">FREE</div>
        ) : (
          <div className="mb-1">
            <span className="text-white font-bold text-3xl">₹{price?.toLocaleString()}</span>
            {course.discountedPrice && (
              <span className="text-dark-500 text-lg line-through ml-2">₹{course.price?.toLocaleString()}</span>
            )}
            {course.discountedPrice && (
              <span className="text-emerald-400 text-sm ml-2 font-medium">
                Save ₹{(course.price - course.discountedPrice)?.toLocaleString()}
              </span>
            )}
          </div>
        )}

        {hasAccess ? (
          <button className="btn-primary w-full mt-4">
            <BookOpen size={18} /> Access Course
          </button>
        ) : (
          <button onClick={onPurchase} disabled={isProcessing} className="btn-primary w-full mt-4 disabled:opacity-60">
            {isProcessing ? <Spinner size="sm" /> : (
              <>
                <ShoppingCart size={18} /> {isFree ? 'Enroll for Free' : 'Buy Now'}
              </>
            )}
          </button>
        )}

        <div className="mt-5 space-y-2.5 text-sm">
          <p className="text-dark-400 font-medium text-xs uppercase tracking-wider mb-2">This course includes:</p>
          {[
            course.accessType === 'lifetime' ? 'Lifetime access' : `${course.accessDurationDays || '?'} days access`,
            'Access on all devices',
            course.curriculum?.reduce((s, sec) => s + (sec.lectures?.length || 0), 0) + ' lectures',
            'Certificate of completion',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-dark-300">
              <CheckCircle size={14} className="text-emerald-500 shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

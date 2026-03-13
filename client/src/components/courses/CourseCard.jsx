import { Link } from 'react-router-dom';
import { Users, Star, Tag, Infinity, CheckCircle } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

export default function CourseCard({ course }) {
  const { hasCourseAccess } = useAuthStore();
  const isPurchased = hasCourseAccess(course._id);
  const price = course.discountedPrice || course.price;
  const isFree = course.isFree || course.price === 0;

  const getAccessLabel = () => {
    if (isFree) return { text: 'Free', class: 'badge-free' };
    if (course.accessType === 'lifetime') return null;
    if (course.accessType === 'fixed_period') return { text: `${course.accessDurationDays}d Access`, class: 'badge-warning' };
    if (course.accessType === 'registration_based') return { text: 'Special Offer', class: 'badge-primary' };
    return null;
  };

  const accessLabel = getAccessLabel();
  const thumbnail = course.thumbnail
    ? course.thumbnail.startsWith('http') ? course.thumbnail : `${API_URL}${course.thumbnail}`
    : null;

  return (
    <div className="card group flex flex-col h-full">
      {/* Thumbnail */}
      <div className="relative overflow-hidden aspect-video bg-dark-800">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-dark-800 to-dark-900">
            <span className="text-4xl">📚</span>
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {isFree && <span className="badge-free text-xs px-2 py-1">FREE</span>}
          {!isFree && course.discountedPrice && (
            <span className="badge-danger text-xs px-2 py-1">
              {Math.round(((course.price - course.discountedPrice) / course.price) * 100)}% OFF
            </span>
          )}
        </div>
        {course.accessType === 'lifetime' && !isFree && (
          <div className="absolute top-3 right-3">
            <span className="badge bg-dark-900/80 backdrop-blur-sm text-dark-300 border-dark-600 text-xs px-2 py-1 flex items-center gap-1">
              <Infinity size={10} /> Lifetime
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Category */}
        <div className="flex items-center justify-between mb-2">
          <span className="badge-primary text-xs">{course.category}</span>
          {accessLabel && !isFree && (
            <span className={`${accessLabel.class} text-xs`}>{accessLabel.text}</span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-white font-semibold text-base mb-1 line-clamp-2 group-hover:text-primary-400 transition-colors">
          {course.title}
        </h3>

        <p className="text-dark-400 text-sm line-clamp-2 mb-4 flex-1">
          {course.shortDescription || course.description}
        </p>

        {/* Instructor */}
        <p className="text-dark-400 text-xs mb-3">
          By <span className="text-dark-200">{course.instructor}</span>
        </p>

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-dark-400 mb-4">
          {course.rating > 0 && (
            <span className="flex items-center gap-1">
              <Star size={11} className="text-yellow-400 fill-yellow-400" />
              {course.rating.toFixed(1)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users size={11} />
            {course.totalStudents || 0} students
          </span>
          {course.language && (
            <span className="flex items-center gap-1">
              <Tag size={11} />
              {course.language}
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-auto pt-3 border-t border-dark-700">
          <div>
            {isPurchased ? (
              <span className="flex items-center gap-1 text-emerald-400 font-semibold text-sm">
                <CheckCircle size={14} className="shrink-0" /> Purchased
              </span>
            ) : isFree ? (
              <span className="text-emerald-400 font-bold text-lg">FREE</span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-lg">₹{price?.toLocaleString()}</span>
                {course.discountedPrice && (
                  <span className="text-dark-500 text-sm line-through">₹{course.price?.toLocaleString()}</span>
                )}
              </div>
            )}
          </div>
          <Link
            to={isPurchased ? `/courses/${course.slug}/learn` : `/courses/${course.slug}`}
            className={`btn-sm text-xs px-4 py-2 ${isPurchased ? 'btn-outline border-emerald-500 text-emerald-400 hover:bg-emerald-500/10' : 'btn-primary'}`}
          >
            {isPurchased ? 'Watch Now' : isFree ? 'Enroll Free' : 'Buy Now'}
          </Link>
        </div>
      </div>
    </div>
  );
}

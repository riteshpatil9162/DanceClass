import { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import {
  ChevronDown, ChevronUp, Play, Lock, CheckCircle, BookOpen,
  ArrowLeft, Menu, X, Clock, Users, Globe, Infinity,
} from 'lucide-react';
import { getCourseContent } from '../api';
import useAuthStore from '../store/authStore';
import Spinner from '../components/common/Spinner';

const APP_NAME = import.meta.env.VITE_APP_NAME || 'Course';

// ─── Video Player Component ──────────────────────────────────────────────────
function VideoPlayer({ videoUrl, title }) {
  const videoRef = useRef(null);

  if (!videoUrl) {
    return (
      <div className="w-full aspect-video bg-dark-900 flex flex-col items-center justify-center rounded-xl">
        <BookOpen size={48} className="text-dark-600 mb-3" />
        <p className="text-dark-400 text-sm">No video available for this lecture</p>
      </div>
    );
  }

  // Detect embed type
  const youtubeMatch = videoUrl.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  const vimeoMatch = videoUrl.match(/vimeo\.com\/(\d+)/);

  if (youtubeMatch) {
    return (
      <div className="w-full aspect-video rounded-xl overflow-hidden bg-black">
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (vimeoMatch) {
    return (
      <div className="w-full aspect-video rounded-xl overflow-hidden bg-black">
        <iframe
          className="w-full h-full"
          src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // Raw video file
  return (
    <div className="w-full aspect-video rounded-xl overflow-hidden bg-black">
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        controlsList="nodownload"
        onContextMenu={(e) => e.preventDefault()}
        src={videoUrl}
        title={title}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function CoursePlayerPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, hasCourseAccess } = useAuthStore();

  const [activeLecture, setActiveLecture] = useState(null); // { sectionIdx, lectureIdx }
  const [expandedSection, setExpandedSection] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { data: course, isLoading, error } = useQuery({
    queryKey: ['course-content', slug],
    queryFn: () => getCourseContent(slug).then((r) => r.data.data),
  });

  // Handle fetch errors — React Query v5 dropped onError from useQuery options
  useEffect(() => {
    if (!error) return;
    if (error?.response?.status === 403) {
      toast.error('Please purchase this course to access content.');
      navigate(`/courses/${slug}`, { replace: true });
    } else if (error?.response?.status === 401) {
      toast.error('Please login to access course content.');
      navigate('/login', { state: { redirect: `/courses/${slug}/learn` }, replace: true });
    }
  }, [error, slug, navigate]);

  // Set first lecture as active when course loads
  useEffect(() => {
    if (course?.curriculum?.length > 0) {
      const firstSection = course.curriculum[0];
      if (firstSection?.lectures?.length > 0) {
        setActiveLecture({ sectionIdx: 0, lectureIdx: 0 });
      }
    }
  }, [course]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-4">🔒</p>
          <h2 className="text-white text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-dark-400 mb-6">You don't have access to this course content.</p>
          <Link to={`/courses/${slug}`} className="btn-primary">View Course Details</Link>
        </div>
      </div>
    );
  }

  const totalLectures = course.curriculum?.reduce((s, sec) => s + (sec.lectures?.length || 0), 0) || 0;

  // Get current lecture
  const currentSection = activeLecture != null ? course.curriculum?.[activeLecture.sectionIdx] : null;
  const currentLecture = currentSection?.lectures?.[activeLecture?.lectureIdx] ?? null;

  const goToLecture = (sectionIdx, lectureIdx) => {
    setActiveLecture({ sectionIdx, lectureIdx });
    setExpandedSection(sectionIdx);
    // On mobile, close sidebar after selection
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  return (
    <>
      <Helmet>
        <title>{currentLecture ? `${currentLecture.title} — ` : ''}{course.title} - {APP_NAME}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-dark-950 flex flex-col">
        {/* ── Top Bar ── */}
        <header className="bg-dark-900 border-b border-dark-700 px-4 h-14 flex items-center justify-between shrink-0 z-40">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to={`/courses/${slug}`}
              className="text-dark-400 hover:text-white transition-colors shrink-0"
              title="Back to course details"
            >
              <ArrowLeft size={18} />
            </Link>
            <div className="w-px h-5 bg-dark-700 shrink-0" />
            <p className="text-white text-sm font-medium truncate">{course.title}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-dark-400 text-xs hidden sm:block">
              {totalLectures} lectures
            </span>
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="p-2 rounded-lg bg-dark-800 hover:bg-dark-700 text-dark-300 hover:text-white transition-colors lg:hidden"
            >
              {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </header>

        {/* ── Body ── */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* ── Main Content ── */}
          <div className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarOpen ? 'lg:mr-0' : ''}`}>
            <div className="max-w-4xl mx-auto px-4 py-6 lg:px-8">
              {/* Video Player */}
              <VideoPlayer
                videoUrl={currentLecture?.videoUrl}
                title={currentLecture?.title || course.title}
              />

              {/* Lecture Info */}
              {currentLecture && (
                <div className="mt-5">
                  <h1 className="text-xl sm:text-2xl font-heading font-bold text-white mb-2">
                    {currentLecture.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-dark-400">
                    {currentLecture.duration && (
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} className="text-primary-500" />
                        {currentLecture.duration}
                      </span>
                    )}
                    {currentSection && (
                      <span className="text-dark-500">
                        Section: <span className="text-dark-300">{currentSection.sectionTitle}</span>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-6 pt-5 border-t border-dark-800">
                <button
                  onClick={() => {
                    if (!activeLecture) return;
                    let { sectionIdx, lectureIdx } = activeLecture;
                    if (lectureIdx > 0) {
                      goToLecture(sectionIdx, lectureIdx - 1);
                    } else if (sectionIdx > 0) {
                      const prevSection = course.curriculum[sectionIdx - 1];
                      goToLecture(sectionIdx - 1, prevSection.lectures.length - 1);
                    }
                  }}
                  disabled={activeLecture?.sectionIdx === 0 && activeLecture?.lectureIdx === 0}
                  className="btn-dark btn-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => {
                    if (!activeLecture) return;
                    let { sectionIdx, lectureIdx } = activeLecture;
                    const section = course.curriculum[sectionIdx];
                    if (lectureIdx < section.lectures.length - 1) {
                      goToLecture(sectionIdx, lectureIdx + 1);
                    } else if (sectionIdx < course.curriculum.length - 1) {
                      goToLecture(sectionIdx + 1, 0);
                    }
                  }}
                  disabled={
                    activeLecture &&
                    activeLecture.sectionIdx === course.curriculum.length - 1 &&
                    activeLecture.lectureIdx === course.curriculum[activeLecture.sectionIdx]?.lectures?.length - 1
                  }
                  className="btn-primary btn-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>

              {/* Course Info Strip */}
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Instructor', value: course.instructor, icon: Users },
                  { label: 'Language', value: course.language, icon: Globe },
                  { label: 'Lectures', value: totalLectures, icon: Play },
                  {
                    label: 'Access',
                    value: course.accessType === 'lifetime' ? 'Lifetime' : `${course.accessDurationDays}d`,
                    icon: Infinity,
                  },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="bg-dark-800/50 border border-dark-700 rounded-xl p-4">
                    <Icon size={16} className="text-primary-500 mb-2" />
                    <p className="text-white text-sm font-medium">{value}</p>
                    <p className="text-dark-500 text-xs mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Curriculum Sidebar ── */}
          <aside
            className={`
              bg-dark-900 border-l border-dark-700 overflow-y-auto
              w-full lg:w-80 xl:w-96 shrink-0
              absolute inset-y-0 right-0 z-30
              lg:relative lg:translate-x-0
              transition-transform duration-300
              ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0 lg:hidden'}
            `}
          >
            <div className="p-4 border-b border-dark-700 sticky top-0 bg-dark-900 z-10">
              <h2 className="text-white font-semibold text-sm">Course Content</h2>
              <p className="text-dark-400 text-xs mt-0.5">
                {course.curriculum?.length || 0} sections • {totalLectures} lectures
              </p>
            </div>

            <div className="p-2">
              {(course.curriculum || []).map((section, sIdx) => (
                <div key={sIdx} className="mb-1">
                  {/* Section Header */}
                  <button
                    onClick={() => setExpandedSection(expandedSection === sIdx ? -1 : sIdx)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-dark-800 text-left transition-colors"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-white text-xs font-semibold truncate">{section.sectionTitle}</p>
                      <p className="text-dark-500 text-xs mt-0.5">{section.lectures?.length || 0} lectures</p>
                    </div>
                    {expandedSection === sIdx
                      ? <ChevronUp size={14} className="text-dark-400 shrink-0" />
                      : <ChevronDown size={14} className="text-dark-400 shrink-0" />
                    }
                  </button>

                  {/* Lectures */}
                  {expandedSection === sIdx && (
                    <div className="ml-1 space-y-0.5">
                      {(section.lectures || []).map((lecture, lIdx) => {
                        const isActive = activeLecture?.sectionIdx === sIdx && activeLecture?.lectureIdx === lIdx;
                        return (
                          <button
                            key={lIdx}
                            onClick={() => goToLecture(sIdx, lIdx)}
                            className={`w-full flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors ${
                              isActive
                                ? 'bg-primary-500/20 border border-primary-500/30'
                                : 'hover:bg-dark-800'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                              isActive ? 'bg-primary-500' : 'bg-dark-700'
                            }`}>
                              <Play size={10} className={isActive ? 'text-white' : 'text-dark-400'} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-medium truncate ${isActive ? 'text-primary-400' : 'text-dark-200'}`}>
                                {lecture.title}
                              </p>
                              {lecture.duration && (
                                <p className="text-dark-500 text-xs mt-0.5">{lecture.duration}</p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

              {(!course.curriculum || course.curriculum.length === 0) && (
                <div className="text-center py-10">
                  <BookOpen size={32} className="text-dark-600 mx-auto mb-2" />
                  <p className="text-dark-400 text-xs">No curriculum available yet.</p>
                </div>
              )}
            </div>
          </aside>

          {/* Mobile overlay backdrop */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-20 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </div>
      </div>
    </>
  );
}

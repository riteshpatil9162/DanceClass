import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import {
  Plus, Edit, Trash2, Eye, EyeOff, Search, X,
  ChevronDown, ChevronUp, Video, BookOpen, GripVertical,
} from 'lucide-react';
import { adminGetCourses, createCourse, updateCourse, deleteCourse, toggleCoursePublish } from '../../api';
import Spinner from '../../components/common/Spinner';

const APP_NAME = import.meta.env.VITE_APP_NAME || 'Course';
const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

const CATEGORIES = [
  'Bollywood Dance',
  'Classical Dance',
  'Hip Hop',
  'Contemporary',
  'Folk Dance',
  'Kathak',
  'Bharatanatyam',
  'Salsa & Latin',
  'Freestyle',
  'Kids Dance',
  'Wedding Choreography',
  'Fitness Dance',
  'Other',
];

const defaultLecture = () => ({ title: '', videoUrl: '', duration: '', isFree: false });
const defaultSection = () => ({ sectionTitle: '', lectures: [defaultLecture()] });

const defaultForm = {
  title: '', description: '', shortDescription: '', instructor: '', category: '', language: 'English',
  price: 0, discountedPrice: '', isFree: false,
  accessType: 'lifetime', accessDurationDays: '', freeAfterDate: '', courseExpiry: '',
  tags: '', metaTitle: '', metaDescription: '', isPublished: false,
};

// ─── Lecture Row ──────────────────────────────────────────────────────────────
function LectureRow({ lecture, onChange, onRemove, canRemove }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-start bg-dark-800/50 rounded-lg p-3 border border-dark-700">
      {/* Title */}
      <div className="sm:col-span-4">
        <input
          type="text"
          placeholder="Lecture title *"
          value={lecture.title}
          onChange={(e) => onChange({ ...lecture, title: e.target.value })}
          className="input-field text-sm py-1.5"
        />
      </div>
      {/* Video URL */}
      <div className="sm:col-span-4">
        <input
          type="url"
          placeholder="Video URL (YouTube / Vimeo / direct)"
          value={lecture.videoUrl}
          onChange={(e) => onChange({ ...lecture, videoUrl: e.target.value })}
          className="input-field text-sm py-1.5"
        />
      </div>
      {/* Duration */}
      <div className="sm:col-span-2">
        <input
          type="text"
          placeholder="Duration e.g. 12:30"
          value={lecture.duration}
          onChange={(e) => onChange({ ...lecture, duration: e.target.value })}
          className="input-field text-sm py-1.5"
        />
      </div>
      {/* Free preview toggle + remove */}
      <div className="sm:col-span-2 flex items-center gap-2 justify-end">
        <label className="flex items-center gap-1.5 cursor-pointer shrink-0" title="Free preview lecture">
          <input
            type="checkbox"
            checked={lecture.isFree}
            onChange={(e) => onChange({ ...lecture, isFree: e.target.checked })}
            className="w-3.5 h-3.5 accent-primary-500"
          />
          <span className="text-xs text-dark-400">Preview</span>
        </label>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition-colors shrink-0"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Section Block ────────────────────────────────────────────────────────────
function SectionBlock({ section, sectionIdx, onChange, onRemove, canRemove }) {
  const [expanded, setExpanded] = useState(true);

  const updateLecture = (lIdx, updated) => {
    const lectures = section.lectures.map((l, i) => (i === lIdx ? updated : l));
    onChange({ ...section, lectures });
  };

  const addLecture = () => {
    onChange({ ...section, lectures: [...section.lectures, defaultLecture()] });
  };

  const removeLecture = (lIdx) => {
    onChange({ ...section, lectures: section.lectures.filter((_, i) => i !== lIdx) });
  };

  return (
    <div className="border border-dark-600 rounded-xl overflow-hidden">
      {/* Section header */}
      <div className="flex items-center gap-2 bg-dark-800 px-4 py-3">
        <div className="flex-1 min-w-0">
          <input
            type="text"
            placeholder={`Section ${sectionIdx + 1} title *`}
            value={section.sectionTitle}
            onChange={(e) => onChange({ ...section, sectionTitle: e.target.value })}
            className="input-field text-sm py-1.5 font-medium"
          />
        </div>
        <span className="text-xs text-dark-500 shrink-0 hidden sm:block">
          {section.lectures.length} lecture{section.lectures.length !== 1 ? 's' : ''}
        </span>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="p-1.5 rounded hover:bg-dark-700 text-dark-400 hover:text-white transition-colors shrink-0"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 rounded hover:bg-red-500/10 text-dark-400 hover:text-red-400 transition-colors shrink-0"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Lectures */}
      {expanded && (
        <div className="p-3 space-y-2 bg-dark-900/40">
          {section.lectures.map((lecture, lIdx) => (
            <LectureRow
              key={lIdx}
              lecture={lecture}
              onChange={(updated) => updateLecture(lIdx, updated)}
              onRemove={() => removeLecture(lIdx)}
              canRemove={section.lectures.length > 1}
            />
          ))}
          <button
            type="button"
            onClick={addLecture}
            className="w-full mt-1 py-2 rounded-lg border border-dashed border-dark-600 text-dark-400 hover:text-primary-400 hover:border-primary-500/50 text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus size={12} /> Add Lecture
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminCoursesPage() {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' | 'curriculum'
  const [editCourse, setEditCourse] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [curriculum, setCurriculum] = useState([defaultSection()]);
  const [thumbnail, setThumbnail] = useState(null);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: () => adminGetCourses().then((r) => r.data.data),
  });

  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor.toLowerCase().includes(search.toLowerCase()),
  );

  const createMutation = useMutation({
    mutationFn: (fd) => createCourse(fd),
    onSuccess: () => {
      toast.success('Course created!');
      queryClient.invalidateQueries(['admin-courses']);
      closeModal();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create course'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, fd }) => updateCourse(id, fd),
    onSuccess: () => {
      toast.success('Course updated!');
      queryClient.invalidateQueries(['admin-courses']);
      closeModal();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update course'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteCourse(id),
    onSuccess: () => {
      toast.success('Course removed');
      queryClient.invalidateQueries(['admin-courses']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => toggleCoursePublish(id),
    onSuccess: () => queryClient.invalidateQueries(['admin-courses']),
  });

  const openCreate = () => {
    setForm(defaultForm);
    setCurriculum([defaultSection()]);
    setEditCourse(null);
    setThumbnail(null);
    setActiveTab('basic');
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditCourse(c);
    setForm({
      title: c.title || '',
      description: c.description || '',
      shortDescription: c.shortDescription || '',
      instructor: c.instructor || '',
      category: c.category || '',
      language: c.language || 'English',
      price: c.price || 0,
      discountedPrice: c.discountedPrice || '',
      isFree: c.isFree || false,
      accessType: c.accessType || 'lifetime',
      accessDurationDays: c.accessDurationDays || '',
      freeAfterDate: c.freeAfterDate ? c.freeAfterDate.split('T')[0] : '',
      courseExpiry: c.courseExpiry ? c.courseExpiry.split('T')[0] : '',
      tags: c.tags?.join(', ') || '',
      metaTitle: c.metaTitle || '',
      metaDescription: c.metaDescription || '',
      isPublished: c.isPublished || false,
    });
    // Load existing curriculum or start fresh
    setCurriculum(
      c.curriculum?.length > 0
        ? c.curriculum.map((sec) => ({
            sectionTitle: sec.sectionTitle || '',
            lectures: (sec.lectures || []).map((l) => ({
              title: l.title || '',
              videoUrl: l.videoUrl || '',
              duration: l.duration || '',
              isFree: l.isFree || false,
            })),
          }))
        : [defaultSection()],
    );
    setThumbnail(null);
    setActiveTab('basic');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditCourse(null);
    setForm(defaultForm);
    setCurriculum([defaultSection()]);
    setThumbnail(null);
    setActiveTab('basic');
  };

  const addSection = () => setCurriculum((prev) => [...prev, defaultSection()]);

  const updateSection = (idx, updated) =>
    setCurriculum((prev) => prev.map((s, i) => (i === idx ? updated : s)));

  const removeSection = (idx) =>
    setCurriculum((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate curriculum
    const invalidSection = curriculum.find((s) => !s.sectionTitle.trim());
    if (invalidSection) {
      toast.error('All section titles are required');
      setActiveTab('curriculum');
      return;
    }
    const invalidLecture = curriculum.some((s) =>
      s.lectures.some((l) => !l.title.trim()),
    );
    if (invalidLecture) {
      toast.error('All lecture titles are required');
      setActiveTab('curriculum');
      return;
    }

    // Build the payload.
    // If a thumbnail file is selected we must use FormData (multipart).
    // Otherwise send plain JSON — this avoids all multipart/boundary issues
    // and lets express.json() parse curriculum as a real array on the server.
    const tagsArray = form.tags
      ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    if (thumbnail) {
      // ── FormData path (file upload) ──────────────────────────────────────
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'tags') return; // handled separately
        if (v !== '' && v !== null && v !== undefined) fd.append(k, v);
      });
      fd.append('tags', JSON.stringify(tagsArray));
      fd.append('curriculum', JSON.stringify(curriculum));
      fd.append('thumbnail', thumbnail);

      if (editCourse) {
        updateMutation.mutate({ id: editCourse._id, fd });
      } else {
        createMutation.mutate(fd);
      }
    } else {
      // ── JSON path (no file) ──────────────────────────────────────────────
      const payload = {
        ...form,
        tags: tagsArray,
        curriculum,
        isFree: Boolean(form.isFree),
        isPublished: Boolean(form.isPublished),
        price: Number(form.price) || 0,
        discountedPrice: form.discountedPrice !== '' ? Number(form.discountedPrice) : undefined,
        accessDurationDays: form.accessDurationDays !== '' ? Number(form.accessDurationDays) : undefined,
      };
      // Remove empty optional fields so server doesn't get empty strings
      ['freeAfterDate', 'courseExpiry', 'metaTitle', 'metaDescription', 'shortDescription'].forEach((k) => {
        if (payload[k] === '') delete payload[k];
      });

      if (editCourse) {
        updateMutation.mutate({ id: editCourse._id, fd: payload });
      } else {
        createMutation.mutate(payload);
      }
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Remove this course? It will be unpublished.')) deleteMutation.mutate(id);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const totalLectures = (curr) =>
    curr?.reduce((s, sec) => s + (sec.lectures?.length || 0), 0) || 0;

  return (
    <>
      <Helmet>
        <title>Courses - {APP_NAME} Admin</title>
      </Helmet>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-heading font-bold text-white">
          Courses ({courses.length})
        </h1>
        <button onClick={openCreate} className="btn-primary btn-sm">
          <Plus size={16} /> Add Course
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-xs">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-9 py-2 text-sm"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <Spinner size="lg" className="py-12" />
      ) : (
        <div className="table-wrapper">
          <table className="table-base">
            <thead>
              <tr>
                <th>Course</th>
                <th>Instructor</th>
                <th>Price</th>
                <th>Type</th>
                <th>Lectures</th>
                <th>Students</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="text-dark-200">
              {filtered.map((c) => {
                const thumb = c.thumbnail
                  ? c.thumbnail.startsWith('http')
                    ? c.thumbnail
                    : `${API_URL}${c.thumbnail}`
                  : null;
                const lectures = totalLectures(c.curriculum);
                return (
                  <tr key={c._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-dark-800 overflow-hidden shrink-0">
                          {thumb ? (
                            <img src={thumb} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg">📚</div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{c.title}</p>
                          <p className="text-xs text-dark-500">{c.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm">{c.instructor}</td>
                    <td className="text-sm">
                      {c.isFree ? (
                        <span className="badge-free">FREE</span>
                      ) : (
                        `₹${c.discountedPrice || c.price}`
                      )}
                    </td>
                    <td className="text-xs capitalize">{c.accessType?.replace('_', ' ')}</td>
                    <td className="text-sm">
                      <span className="flex items-center gap-1">
                        <Video size={12} className="text-primary-500" />
                        {lectures}
                      </span>
                    </td>
                    <td className="text-sm">{c.totalStudents || 0}</td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        {c.isPublished ? (
                          <span className="badge-success text-xs">Published</span>
                        ) : (
                          <span className="badge-warning text-xs">Draft</span>
                        )}
                        {!c.isActive && (
                          <span className="badge-danger text-xs">Removed</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleMutation.mutate(c._id)}
                          className="p-1.5 rounded hover:bg-dark-700 text-dark-400 hover:text-white transition-colors"
                          title={c.isPublished ? 'Unpublish' : 'Publish'}
                        >
                          {c.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 rounded hover:bg-dark-700 text-dark-400 hover:text-white transition-colors"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="p-1.5 rounded hover:bg-red-500/10 text-dark-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-dark-400">
                    No courses found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm px-4 py-8 overflow-y-auto">
          <div className="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-3xl my-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-dark-700">
              <h2 className="text-lg font-heading font-bold text-white">
                {editCourse ? 'Edit Course' : 'Add New Course'}
              </h2>
              <button onClick={closeModal} className="text-dark-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-dark-700 px-5 gap-1">
              {[
                { key: 'basic', label: 'Basic Info', icon: BookOpen },
                { key: 'curriculum', label: `Curriculum (${totalLectures(curriculum)} lectures)`, icon: Video },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                    activeTab === key
                      ? 'border-primary-500 text-primary-400'
                      : 'border-transparent text-dark-400 hover:text-dark-200'
                  }`}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              {/* ── Basic Info Tab ── */}
              {activeTab === 'basic' && (
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="label">Course Title *</label>
                      <input
                        required
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="input-field"
                        placeholder="e.g. Complete React Course"
                      />
                    </div>
                    <div>
                      <label className="label">Instructor *</label>
                      <input
                        required
                        value={form.instructor}
                        onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="label">Category *</label>
                      <select
                        required
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="input-field"
                      >
                        <option value="">Select Category</option>
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="label">Short Description</label>
                      <input
                        value={form.shortDescription}
                        onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                        className="input-field"
                        placeholder="One-line summary"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="label">Description *</label>
                      <textarea
                        required
                        rows={4}
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="input-field resize-none"
                      />
                    </div>
                    <div>
                      <label className="label">Language</label>
                      <select
                        value={form.language}
                        onChange={(e) => setForm({ ...form, language: e.target.value })}
                        className="input-field"
                      >
                        <option>English</option>
                        <option>Hindi</option>
                        <option>Hinglish</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Access Type</label>
                      <select
                        value={form.accessType}
                        onChange={(e) => setForm({ ...form, accessType: e.target.value })}
                        className="input-field"
                      >
                        <option value="lifetime">Lifetime</option>
                        <option value="fixed_period">Fixed Period</option>
                        <option value="registration_based">Registration Based (Free after date)</option>
                      </select>
                    </div>

                    {form.accessType === 'fixed_period' && (
                      <div>
                        <label className="label">Access Duration (Days)</label>
                        <input
                          type="number"
                          value={form.accessDurationDays}
                          onChange={(e) => setForm({ ...form, accessDurationDays: e.target.value })}
                          className="input-field"
                          placeholder="e.g. 30"
                        />
                      </div>
                    )}
                    {form.accessType === 'registration_based' && (
                      <div>
                        <label className="label">Free After Date</label>
                        <input
                          type="date"
                          value={form.freeAfterDate}
                          onChange={(e) => setForm({ ...form, freeAfterDate: e.target.value })}
                          className="input-field"
                        />
                      </div>
                    )}

                    <div>
                      <label className="label">Course Expiry Date (optional)</label>
                      <input
                        type="date"
                        value={form.courseExpiry}
                        onChange={(e) => setForm({ ...form, courseExpiry: e.target.value })}
                        className="input-field"
                      />
                    </div>

                    <div className="col-span-2 flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.isFree}
                          onChange={(e) => setForm({ ...form, isFree: e.target.checked })}
                          className="w-4 h-4 accent-primary-500"
                        />
                        <span className="text-dark-300 text-sm">Free Course</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.isPublished}
                          onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                          className="w-4 h-4 accent-primary-500"
                        />
                        <span className="text-dark-300 text-sm">Publish Immediately</span>
                      </label>
                    </div>

                    {!form.isFree && (
                      <>
                        <div>
                          <label className="label">Original Price (₹)</label>
                          <input
                            type="number"
                            value={form.price}
                            onChange={(e) => setForm({ ...form, price: e.target.value })}
                            className="input-field"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="label">Discounted Price (₹)</label>
                          <input
                            type="number"
                            value={form.discountedPrice}
                            onChange={(e) => setForm({ ...form, discountedPrice: e.target.value })}
                            className="input-field"
                            min="0"
                            placeholder="Leave blank if no discount"
                          />
                        </div>
                      </>
                    )}

                    <div className="col-span-2">
                      <label className="label">Tags (comma separated)</label>
                      <input
                        value={form.tags}
                        onChange={(e) => setForm({ ...form, tags: e.target.value })}
                        className="input-field"
                        placeholder="react, javascript, web development"
                      />
                    </div>

                    <div>
                      <label className="label">Meta Title (SEO)</label>
                      <input
                        value={form.metaTitle}
                        onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                        className="input-field"
                        placeholder="SEO title"
                      />
                    </div>
                    <div>
                      <label className="label">Meta Description (SEO)</label>
                      <input
                        value={form.metaDescription}
                        onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                        className="input-field"
                        placeholder="SEO description"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="label">Thumbnail Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setThumbnail(e.target.files[0] || null)}
                        className="input-field text-sm py-2"
                      />
                      {/* Preview newly selected file */}
                      {thumbnail && (
                        <div className="mt-2 flex items-center gap-2">
                          <img
                            src={URL.createObjectURL(thumbnail)}
                            alt="Selected thumbnail"
                            className="w-16 h-10 object-cover rounded-lg border border-dark-700"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-white truncate">{thumbnail.name}</p>
                            <p className="text-xs text-dark-400">Ready to upload</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setThumbnail(null)}
                            className="text-dark-500 hover:text-red-400 transition-colors shrink-0"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                      {/* Show existing thumbnail when editing and no new file chosen */}
                      {!thumbnail && editCourse?.thumbnail && (
                        <div className="mt-2 flex items-center gap-2">
                          <img
                            src={editCourse.thumbnail.startsWith('http') ? editCourse.thumbnail : `${API_URL}${editCourse.thumbnail}`}
                            alt="Current thumbnail"
                            className="w-16 h-10 object-cover rounded-lg border border-dark-700"
                          />
                          <p className="text-xs text-dark-400">Current thumbnail (upload a new one to replace)</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tab navigation hint */}
                  <div className="pt-2 border-t border-dark-800">
                    <button
                      type="button"
                      onClick={() => setActiveTab('curriculum')}
                      className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1.5"
                    >
                      <Video size={12} />
                      Next: Add course curriculum & videos →
                    </button>
                  </div>
                </div>
              )}

              {/* ── Curriculum Tab ── */}
              {activeTab === 'curriculum' && (
                <div className="p-5 space-y-4">
                  {/* Thumbnail confirmation strip */}
                  {thumbnail && (
                    <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                      <img
                        src={URL.createObjectURL(thumbnail)}
                        alt="Thumbnail"
                        className="w-10 h-7 object-cover rounded border border-dark-600 shrink-0"
                      />
                      <p className="text-xs text-emerald-400 flex-1 truncate">
                        Thumbnail ready: <span className="text-white">{thumbnail.name}</span>
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-white font-medium text-sm">Course Curriculum</h3>
                      <p className="text-dark-400 text-xs mt-0.5">
                        Add sections and lectures. Paste a YouTube, Vimeo, or direct video URL for each lecture.
                      </p>
                    </div>
                    <div className="text-xs text-dark-400 text-right shrink-0">
                      <span className="text-white font-medium">{curriculum.length}</span> section{curriculum.length !== 1 ? 's' : ''},{' '}
                      <span className="text-white font-medium">{totalLectures(curriculum)}</span> lecture{totalLectures(curriculum) !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Sections */}
                  <div className="space-y-3">
                    {curriculum.map((section, sIdx) => (
                      <SectionBlock
                        key={sIdx}
                        section={section}
                        sectionIdx={sIdx}
                        onChange={(updated) => updateSection(sIdx, updated)}
                        onRemove={() => removeSection(sIdx)}
                        canRemove={curriculum.length > 1}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addSection}
                    className="w-full py-3 rounded-xl border border-dashed border-dark-600 text-dark-400 hover:text-primary-400 hover:border-primary-500/50 text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <Plus size={14} /> Add Section
                  </button>

                  {/* Lecture column labels */}
                  <div className="bg-dark-800/40 rounded-lg p-3 border border-dark-700">
                    <p className="text-xs text-dark-400 font-medium mb-1">Lecture fields guide:</p>
                    <div className="grid grid-cols-4 gap-2 text-xs text-dark-500">
                      <span>Title *</span>
                      <span>Video URL (YouTube/Vimeo/MP4)</span>
                      <span>Duration (e.g. 12:30)</span>
                      <span>Free Preview?</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-between items-center gap-3 px-5 py-4 border-t border-dark-700">
                <div className="flex gap-2">
                  {activeTab === 'curriculum' && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('basic')}
                      className="btn-dark btn-sm"
                    >
                      ← Basic Info
                    </button>
                  )}
                  {activeTab === 'basic' && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('curriculum')}
                      className="btn-dark btn-sm"
                    >
                      Curriculum →
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={closeModal} className="btn-dark btn-sm">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="btn-primary btn-sm disabled:opacity-60"
                  >
                    {isPending ? (
                      <Spinner size="sm" />
                    ) : editCourse ? (
                      'Update Course'
                    ) : (
                      'Create Course'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

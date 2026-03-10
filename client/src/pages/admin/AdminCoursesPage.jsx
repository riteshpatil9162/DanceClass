import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Eye, EyeOff, Search, X } from 'lucide-react';
import { adminGetCourses, createCourse, updateCourse, deleteCourse, toggleCoursePublish } from '../../api';
import Spinner from '../../components/common/Spinner';

const APP_NAME = import.meta.env.VITE_APP_NAME || 'Course';
const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const CATEGORIES = ['Programming', 'Design', 'Marketing', 'Business', 'Finance', 'Photography', 'Music', 'Health', 'Fitness', 'Language', 'Other'];

const defaultForm = {
  title: '', description: '', shortDescription: '', instructor: '', category: '', language: 'English',
  price: 0, discountedPrice: '', isFree: false,
  accessType: 'lifetime', accessDurationDays: '', freeAfterDate: '', courseExpiry: '',
  tags: '', metaTitle: '', metaDescription: '', isPublished: false,
};

export default function AdminCoursesPage() {
  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [thumbnail, setThumbnail] = useState(null);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: () => adminGetCourses().then((r) => r.data.data),
  });

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.instructor.toLowerCase().includes(search.toLowerCase())
  );

  const createMutation = useMutation({
    mutationFn: (fd) => createCourse(fd),
    onSuccess: () => { toast.success('Course created!'); queryClient.invalidateQueries(['admin-courses']); closeModal(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create course'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, fd }) => updateCourse(id, fd),
    onSuccess: () => { toast.success('Course updated!'); queryClient.invalidateQueries(['admin-courses']); closeModal(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update course'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteCourse(id),
    onSuccess: () => { toast.success('Course removed'); queryClient.invalidateQueries(['admin-courses']); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => toggleCoursePublish(id),
    onSuccess: () => { queryClient.invalidateQueries(['admin-courses']); },
  });

  const openCreate = () => { setForm(defaultForm); setEditCourse(null); setThumbnail(null); setShowModal(true); };
  const openEdit = (c) => {
    setEditCourse(c);
    setForm({
      title: c.title || '', description: c.description || '', shortDescription: c.shortDescription || '',
      instructor: c.instructor || '', category: c.category || '', language: c.language || 'English',
      price: c.price || 0, discountedPrice: c.discountedPrice || '', isFree: c.isFree || false,
      accessType: c.accessType || 'lifetime', accessDurationDays: c.accessDurationDays || '',
      freeAfterDate: c.freeAfterDate ? c.freeAfterDate.split('T')[0] : '',
      courseExpiry: c.courseExpiry ? c.courseExpiry.split('T')[0] : '',
      tags: c.tags?.join(', ') || '',
      metaTitle: c.metaTitle || '', metaDescription: c.metaDescription || '',
      isPublished: c.isPublished || false,
    });
    setThumbnail(null);
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditCourse(null); setForm(defaultForm); setThumbnail(null); };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) fd.append(k, v);
    });
    if (form.tags) fd.set('tags', JSON.stringify(form.tags.split(',').map(t => t.trim()).filter(Boolean)));
    if (thumbnail) fd.append('thumbnail', thumbnail);
    if (editCourse) {
      updateMutation.mutate({ id: editCourse._id, fd });
    } else {
      createMutation.mutate(fd);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Remove this course? It will be unpublished.')) deleteMutation.mutate(id);
  };

  return (
    <>
      <Helmet><title>Courses - {APP_NAME} Admin</title></Helmet>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-heading font-bold text-white">Courses ({courses.length})</h1>
        <button onClick={openCreate} className="btn-primary btn-sm">
          <Plus size={16} /> Add Course
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-xs">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
        <input type="text" placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-9 py-2 text-sm" />
      </div>

      {isLoading ? <Spinner size="lg" className="py-12" /> : (
        <div className="table-wrapper">
          <table className="table-base">
            <thead>
              <tr>
                <th>Course</th>
                <th>Instructor</th>
                <th>Price</th>
                <th>Type</th>
                <th>Students</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="text-dark-200">
              {filtered.map((c) => {
                const thumb = c.thumbnail ? (c.thumbnail.startsWith('http') ? c.thumbnail : `${API_URL}${c.thumbnail}`) : null;
                return (
                  <tr key={c._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-dark-800 overflow-hidden shrink-0">
                          {thumb ? <img src={thumb} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-lg">📚</div>}
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{c.title}</p>
                          <p className="text-xs text-dark-500">{c.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm">{c.instructor}</td>
                    <td className="text-sm">
                      {c.isFree ? <span className="badge-free">FREE</span> : `₹${c.discountedPrice || c.price}`}
                    </td>
                    <td className="text-xs capitalize">{c.accessType?.replace('_', ' ')}</td>
                    <td className="text-sm">{c.totalStudents || 0}</td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        {c.isPublished ? <span className="badge-success text-xs">Published</span> : <span className="badge-warning text-xs">Draft</span>}
                        {!c.isActive && <span className="badge-danger text-xs">Removed</span>}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => toggleMutation.mutate(c._id)} className="p-1.5 rounded hover:bg-dark-700 text-dark-400 hover:text-white transition-colors" title={c.isPublished ? 'Unpublish' : 'Publish'}>
                          {c.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button onClick={() => openEdit(c)} className="p-1.5 rounded hover:bg-dark-700 text-dark-400 hover:text-white transition-colors">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDelete(c._id)} className="p-1.5 rounded hover:bg-red-500/10 text-dark-400 hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-dark-400">No courses found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm px-4 py-8 overflow-y-auto">
          <div className="bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-2xl my-auto">
            <div className="flex items-center justify-between p-5 border-b border-dark-700">
              <h2 className="text-lg font-heading font-bold text-white">{editCourse ? 'Edit Course' : 'Add New Course'}</h2>
              <button onClick={closeModal} className="text-dark-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Course Title *</label>
                  <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="e.g. Complete React Course" />
                </div>
                <div>
                  <label className="label">Instructor *</label>
                  <input required value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })} className="input-field" />
                </div>
                <div>
                  <label className="label">Category *</label>
                  <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
                    <option value="">Select Category</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label">Short Description</label>
                  <input value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} className="input-field" placeholder="One-line summary" />
                </div>
                <div className="col-span-2">
                  <label className="label">Description *</label>
                  <textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field resize-none" />
                </div>
                <div>
                  <label className="label">Language</label>
                  <select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className="input-field">
                    <option>English</option><option>Hindi</option><option>Hinglish</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="label">Access Type</label>
                  <select value={form.accessType} onChange={(e) => setForm({ ...form, accessType: e.target.value })} className="input-field">
                    <option value="lifetime">Lifetime</option>
                    <option value="fixed_period">Fixed Period</option>
                    <option value="registration_based">Registration Based (Free after date)</option>
                  </select>
                </div>

                {form.accessType === 'fixed_period' && (
                  <div>
                    <label className="label">Access Duration (Days)</label>
                    <input type="number" value={form.accessDurationDays} onChange={(e) => setForm({ ...form, accessDurationDays: e.target.value })} className="input-field" placeholder="e.g. 30" />
                  </div>
                )}
                {form.accessType === 'registration_based' && (
                  <div>
                    <label className="label">Free After Date</label>
                    <input type="date" value={form.freeAfterDate} onChange={(e) => setForm({ ...form, freeAfterDate: e.target.value })} className="input-field" />
                  </div>
                )}

                <div>
                  <label className="label">Course Expiry Date (optional)</label>
                  <input type="date" value={form.courseExpiry} onChange={(e) => setForm({ ...form, courseExpiry: e.target.value })} className="input-field" />
                </div>

                <div className="col-span-2 flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isFree} onChange={(e) => setForm({ ...form, isFree: e.target.checked })} className="w-4 h-4 accent-primary-500" />
                    <span className="text-dark-300 text-sm">Free Course</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} className="w-4 h-4 accent-primary-500" />
                    <span className="text-dark-300 text-sm">Publish Immediately</span>
                  </label>
                </div>

                {!form.isFree && (
                  <>
                    <div>
                      <label className="label">Original Price (₹)</label>
                      <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" min="0" />
                    </div>
                    <div>
                      <label className="label">Discounted Price (₹)</label>
                      <input type="number" value={form.discountedPrice} onChange={(e) => setForm({ ...form, discountedPrice: e.target.value })} className="input-field" min="0" placeholder="Leave blank if no discount" />
                    </div>
                  </>
                )}

                <div className="col-span-2">
                  <label className="label">Tags (comma separated)</label>
                  <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="input-field" placeholder="react, javascript, web development" />
                </div>

                <div>
                  <label className="label">Meta Title (SEO)</label>
                  <input value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} className="input-field" placeholder="SEO title" />
                </div>
                <div>
                  <label className="label">Meta Description (SEO)</label>
                  <input value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} className="input-field" placeholder="SEO description" />
                </div>

                <div className="col-span-2">
                  <label className="label">Thumbnail Image</label>
                  <input type="file" accept="image/*" onChange={(e) => setThumbnail(e.target.files[0])} className="input-field text-sm py-2" />
                  {editCourse?.thumbnail && !thumbnail && (
                    <p className="text-xs text-dark-400 mt-1">Current: {editCourse.thumbnail}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn-dark btn-sm">Cancel</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="btn-primary btn-sm disabled:opacity-60">
                  {(createMutation.isPending || updateMutation.isPending) ? <Spinner size="sm" /> : editCourse ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

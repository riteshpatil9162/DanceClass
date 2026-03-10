import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { getAdminPackages, createPackage, updatePackage, deletePackage, getAdminCourses } from '../../api';

const defaultValues = {
  title: '',
  description: '',
  price: '',
  originalPrice: '',
  courses: [],
  bonusCourses: [],
  isPublished: false,
};

export default function AdminPackagesPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const thumbnailInputRef = useRef(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-packages'],
    queryFn: () => getAdminPackages(),
  });

  const { data: coursesData } = useQuery({
    queryKey: ['admin-courses-list'],
    queryFn: () => getAdminCourses(),
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues });

  const createMutation = useMutation({
    mutationFn: (body) => createPackage(body),
    onSuccess: () => {
      qc.invalidateQueries(['admin-packages']);
      toast.success('Package created');
      closeModal();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => updatePackage(id, body),
    onSuccess: () => {
      qc.invalidateQueries(['admin-packages']);
      toast.success('Package updated');
      closeModal();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deletePackage(id),
    onSuccess: () => {
      qc.invalidateQueries(['admin-packages']);
      toast.success('Package deleted');
      setDeleteConfirm(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const allCourses = coursesData?.data?.data || [];

  function openCreate() {
    setEditingPkg(null);
    setThumbnailFile(null);
    setThumbnailPreview('');
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
    reset(defaultValues);
    setShowModal(true);
  }

  function openEdit(pkg) {
    setEditingPkg(pkg);
    setThumbnailFile(null);
    setThumbnailPreview(pkg.thumbnail || '');
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
    reset({
      title: pkg.title || '',
      description: pkg.description || '',
      price: pkg.price || '',
      originalPrice: pkg.originalPrice || '',
      courses: pkg.courses?.map((c) => c._id || c) || [],
      bonusCourses: pkg.bonusCourses?.map((c) => c._id || c) || [],
      isPublished: pkg.isPublished || false,
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingPkg(null);
    setThumbnailFile(null);
    setThumbnailPreview('');
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
    reset(defaultValues);
  }

  async function onSubmit(data) {
    const fd = new FormData();
    fd.append('title', data.title);
    fd.append('description', data.description);
    fd.append('price', Number(data.price));
    if (data.originalPrice) fd.append('originalPrice', Number(data.originalPrice));
    data.courses.forEach((id) => fd.append('courses', id));
    data.bonusCourses.forEach((id) => fd.append('bonusCourses', id));
    fd.append('isPublished', data.isPublished);
    if (thumbnailFile) fd.append('thumbnail', thumbnailFile);

    if (editingPkg) {
      updateMutation.mutate({ id: editingPkg._id, body: fd });
    } else {
      createMutation.mutate(fd);
    }
  }

  const packages = data?.data?.data || data?.data || [];

  // Multi-select helper
  function CourseMultiSelect({ name, label }) {
    const selected = watch(name) || [];
    return (
      <div>
        <label className="form-label">{label}</label>
        <div className="max-h-40 overflow-y-auto space-y-1 border border-gray-700 rounded-lg p-2 bg-gray-800">
          {allCourses.length === 0 && (
            <p className="text-xs text-gray-500">No courses available</p>
          )}
          {allCourses.map((course) => (
            <Controller
              key={course._id}
              control={control}
              name={name}
              render={({ field }) => (
                <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-700 rounded p-1">
                  <input
                    type="checkbox"
                    className="accent-orange-500"
                    value={course._id}
                    checked={field.value?.includes(course._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        field.onChange([...(field.value || []), course._id]);
                      } else {
                        field.onChange(field.value?.filter((id) => id !== course._id));
                      }
                    }}
                  />
                  <span className="text-sm text-gray-300">{course.title}</span>
                  <span className="ml-auto text-xs text-gray-500">
                    {course.isFree ? 'Free' : `₹${course.price}`}
                  </span>
                </label>
              )}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Packages</h1>
        <button onClick={openCreate} className="btn-primary">
          + New Package
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading packages...</div>
      ) : packages.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No packages yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {packages.map((pkg) => (
            <div
              key={pkg._id}
              className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden flex flex-col gap-0"
            >
              {pkg.thumbnail && (
                <img
                  src={pkg.thumbnail}
                  alt={pkg.title}
                  className="w-full h-36 object-cover"
                />
              )}
              <div className="p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-white font-semibold text-lg leading-tight">{pkg.title}</h3>
                <span
                  className={`shrink-0 px-2 py-0.5 rounded text-xs font-semibold ${
                    pkg.isPublished
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}
                >
                  {pkg.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
              <p className="text-gray-400 text-sm line-clamp-2">{pkg.description}</p>
              <div className="flex items-center gap-3">
                <span className="text-orange-400 font-bold text-xl">₹{pkg.price}</span>
                {pkg.originalPrice && (
                  <span className="text-gray-500 line-through text-sm">₹{pkg.originalPrice}</span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {pkg.courses?.length || 0} course(s)
                {pkg.bonusCourses?.length > 0 && ` + ${pkg.bonusCourses.length} bonus`}
              </div>
              <div className="flex gap-2 mt-auto pt-2">
                <button
                  onClick={() => openEdit(pkg)}
                  className="flex-1 text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteConfirm(pkg)}
                  className="flex-1 text-xs px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-white font-medium"
                >
                  Delete
                </button>
              </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingPkg ? 'Edit Package' : 'Create Package'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Thumbnail */}
              <div>
                <label className="form-label">Thumbnail Image</label>
                {thumbnailPreview && (
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="w-full h-40 object-cover rounded-lg mb-2 border border-gray-700"
                  />
                )}
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setThumbnailFile(file);
                    setThumbnailPreview(URL.createObjectURL(file));
                  }}
                  className="text-sm text-gray-400 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-gray-700 file:text-white hover:file:bg-gray-600 cursor-pointer w-full"
                />
              </div>

              <div>
                <label className="form-label">Title *</label>
                <input
                  {...register('title', { required: 'Title required' })}
                  className="form-input"
                  placeholder="e.g. Ultimate Starter Bundle"
                />
                {errors.title && <p className="form-error">{errors.title.message}</p>}
              </div>

              <div>
                <label className="form-label">Description</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="form-input"
                  placeholder="What's included in this package..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Package Price (₹) *</label>
                  <input
                    type="number"
                    {...register('price', { required: 'Price required', min: 0 })}
                    className="form-input"
                    placeholder="e.g. 1999"
                  />
                  {errors.price && <p className="form-error">{errors.price.message}</p>}
                </div>
                <div>
                  <label className="form-label">Original / Slashed Price (₹)</label>
                  <input
                    type="number"
                    {...register('originalPrice', { min: 0 })}
                    className="form-input"
                    placeholder="e.g. 3999"
                  />
                </div>
              </div>

              <CourseMultiSelect name="courses" label="Included Courses *" />
              <CourseMultiSelect name="bonusCourses" label="Bonus Courses (free add-ons)" />

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('isPublished')} className="w-4 h-4 accent-orange-500" />
                <span className="text-gray-300 text-sm">Publish Package</span>
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? 'Saving...' : editingPkg ? 'Update Package' : 'Create Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-white mb-2">Delete Package?</h3>
            <p className="text-gray-400 text-sm mb-6">
              Delete <span className="text-white font-medium">"{deleteConfirm.title}"</span>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirm._id)}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

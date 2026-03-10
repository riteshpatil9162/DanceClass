import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  getAdminEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  updateEventSponsors,
} from '../../api';

const PERMISSION = 'manage_events';

const defaultValues = {
  title: '',
  description: '',
  date: '',
  endDate: '',
  venue: '',
  totalSeats: '',
  price: '',
  isFree: false,
  isPublished: false,
  bookingSlug: '',
  bookingUrlExpiry: '',
  sponsors: [],
};

const partnerTypes = [
  'Title Sponsor',
  'Co-Sponsor',
  'Gaming Partner',
  'Travel Partner',
  'Food Partner',
  'Media Partner',
  'Tech Partner',
  'Other',
];

export default function AdminEventsPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // File state (outside react-hook-form for file inputs)
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState('');

  // Sponsor file state: array of { file, preview }
  const [sponsorFiles, setSponsorFiles] = useState([]);

  const thumbnailInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => getAdminEvents(),
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues });

  const { fields, append, remove } = useFieldArray({ control, name: 'sponsors' });

  const isFree = watch('isFree');

  const createMutation = useMutation({
    mutationFn: (fd) => createEvent(fd),
    onSuccess: () => {
      qc.invalidateQueries(['admin-events']);
      toast.success('Event created');
      closeModal();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error creating event'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, fd }) => updateEvent(id, fd),
    onSuccess: () => {
      qc.invalidateQueries(['admin-events']);
      toast.success('Event updated');
      closeModal();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error updating event'),
  });

  const sponsorMutation = useMutation({
    mutationFn: ({ id, fd }) => updateEventSponsors(id, fd),
    onError: (e) => toast.error(e.response?.data?.message || 'Error updating sponsors'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteEvent(id),
    onSuccess: () => {
      qc.invalidateQueries(['admin-events']);
      toast.success('Event deleted');
      setDeleteConfirm(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error deleting event'),
  });

  function openCreate() {
    setEditingEvent(null);
    resetFileState();
    reset(defaultValues);
    setShowModal(true);
  }

  function openEdit(ev) {
    setEditingEvent(ev);
    // Set existing image previews
    setThumbnailFile(null);
    setThumbnailPreview(ev.thumbnail || '');
    setBannerFile(null);
    setBannerPreview(ev.bannerImage || '');
    // Set sponsor previews from existing data
    setSponsorFiles(
      (ev.sponsors || []).map((s) => ({ file: null, preview: s.image || s.logo || '' }))
    );
    reset({
      title: ev.title || '',
      description: ev.description || '',
      date: ev.startDate ? ev.startDate.slice(0, 16) : '',
      endDate: ev.endDate ? ev.endDate.slice(0, 16) : '',
      venue: ev.venue || '',
      totalSeats: ev.totalSeats || '',
      price: ev.price || '',
      isFree: ev.isFree || false,
      isPublished: ev.isPublished || false,
      bookingSlug: ev.bookingSlug || '',
      bookingUrlExpiry: ev.bookingUrlExpiry ? ev.bookingUrlExpiry.slice(0, 16) : '',
      sponsors: (ev.sponsors || []).map((s) => ({ partnerType: s.partnerType })),
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingEvent(null);
    resetFileState();
    reset(defaultValues);
  }

  function resetFileState() {
    setThumbnailFile(null);
    setThumbnailPreview('');
    setBannerFile(null);
    setBannerPreview('');
    setSponsorFiles([]);
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
    if (bannerInputRef.current) bannerInputRef.current.value = '';
  }

  function handleThumbnailChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  }

  function handleBannerChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  }

  function handleSponsorFileChange(index, e) {
    const file = e.target.files[0];
    if (!file) return;
    setSponsorFiles((prev) => {
      const next = [...prev];
      next[index] = { file, preview: URL.createObjectURL(file) };
      return next;
    });
  }

  function addSponsor() {
    append({ partnerType: 'Co-Sponsor' });
    setSponsorFiles((prev) => [...prev, { file: null, preview: '' }]);
  }

  function removeSponsor(index) {
    remove(index);
    setSponsorFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(data) {
    // Build main event FormData
    const fd = new FormData();
    fd.append('title', data.title);
    fd.append('description', data.description);
    fd.append('date', data.date);
    if (data.endDate) fd.append('endDate', data.endDate);
    fd.append('venue', data.venue);
    fd.append('totalSeats', data.totalSeats);
    fd.append('isFree', data.isFree);
    if (!data.isFree) fd.append('price', data.price);
    fd.append('isPublished', data.isPublished);
    if (data.bookingSlug) fd.append('bookingSlug', data.bookingSlug);
    if (data.bookingUrlExpiry) fd.append('bookingUrlExpiry', data.bookingUrlExpiry);
    if (thumbnailFile) fd.append('thumbnail', thumbnailFile);
    if (bannerFile) fd.append('bannerImage', bannerFile);

    let savedEventId = editingEvent?._id;

    if (editingEvent) {
      await updateMutation.mutateAsync({ id: editingEvent._id, fd });
    } else {
      const res = await createMutation.mutateAsync(fd);
      savedEventId = res?.data?.event?._id || res?.data?._id;
    }

    // Submit sponsors as a separate call if there are any
    if (data.sponsors && data.sponsors.length > 0 && savedEventId) {
      const sfd = new FormData();
      sfd.append('sponsors', JSON.stringify(data.sponsors.map((s) => ({ partnerType: s.partnerType }))));
      sponsorFiles.forEach((sf) => {
        // Append file or empty string so index alignment is preserved server-side
        if (sf?.file) {
          sfd.append('sponsorLogos', sf.file);
        } else {
          // Send a placeholder so the server can align by index — backend should handle null/missing gracefully
          sfd.append('sponsorLogos', new Blob([]), '');
        }
      });
      await sponsorMutation.mutateAsync({ id: savedEventId, fd: sfd });
    }

    qc.invalidateQueries(['admin-events']);
    closeModal();
  }

  const events = data?.data?.data || data?.data || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Events</h1>
        <button onClick={openCreate} className="btn-primary">
          + New Event
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No events yet. Create your first event.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-700">
                <th className="pb-3 pr-4">Title</th>
                <th className="pb-3 pr-4">Date</th>
                <th className="pb-3 pr-4">Venue</th>
                <th className="pb-3 pr-4">Seats</th>
                <th className="pb-3 pr-4">Price</th>
                <th className="pb-3 pr-4">Booking Slug</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev._id} className="border-b border-gray-800 hover:bg-gray-800/40">
                  <td className="py-3 pr-4 font-medium text-white">{ev.title}</td>
                  <td className="py-3 pr-4 text-gray-300">
                    {ev.startDate ? new Date(ev.startDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="py-3 pr-4 text-gray-300">{ev.venue}</td>
                  <td className="py-3 pr-4 text-gray-300">
                    {ev.bookedSeats || 0}/{ev.totalSeats}
                  </td>
                  <td className="py-3 pr-4 text-gray-300">
                    {ev.isFree ? (
                      <span className="badge-success">Free</span>
                    ) : (
                      `₹${ev.price}`
                    )}
                  </td>
                  <td className="py-3 pr-4 text-gray-400 font-mono text-xs">
                    {ev.bookingSlug || '—'}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        ev.isPublished
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {ev.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="py-3 flex gap-2">
                    <button
                      onClick={() => openEdit(ev)}
                      className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(ev)}
                      className="text-xs px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingEvent ? 'Edit Event' : 'Create Event'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Title */}
              <div>
                <label className="form-label">Title *</label>
                <input
                  {...register('title', { required: 'Title is required' })}
                  className="form-input"
                  placeholder="Event title"
                />
                {errors.title && <p className="form-error">{errors.title.message}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="form-label">Description</label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="form-input"
                  placeholder="Event description..."
                />
              </div>

              {/* Thumbnail + Banner */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Thumbnail Image</label>
                  {thumbnailPreview && (
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-full h-28 object-cover rounded-lg mb-2 border border-gray-700"
                    />
                  )}
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="text-sm text-gray-400 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-gray-700 file:text-white hover:file:bg-gray-600 cursor-pointer w-full"
                  />
                </div>
                <div>
                  <label className="form-label">Banner Image</label>
                  {bannerPreview && (
                    <img
                      src={bannerPreview}
                      alt="Banner preview"
                      className="w-full h-28 object-cover rounded-lg mb-2 border border-gray-700"
                    />
                  )}
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBannerChange}
                    className="text-sm text-gray-400 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-gray-700 file:text-white hover:file:bg-gray-600 cursor-pointer w-full"
                  />
                </div>
              </div>

              {/* Date + End Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    {...register('date', { required: 'Date is required' })}
                    className="form-input"
                  />
                  {errors.date && <p className="form-error">{errors.date.message}</p>}
                </div>
                <div>
                  <label className="form-label">End Date & Time</label>
                  <input
                    type="datetime-local"
                    {...register('endDate')}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Venue + Seats */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Venue *</label>
                  <input
                    {...register('venue', { required: 'Venue is required' })}
                    className="form-input"
                    placeholder="City / Location"
                  />
                  {errors.venue && <p className="form-error">{errors.venue.message}</p>}
                </div>
                <div>
                  <label className="form-label">Total Seats *</label>
                  <input
                    type="number"
                    {...register('totalSeats', { required: 'Seats required', min: 1 })}
                    className="form-input"
                    placeholder="e.g. 200"
                  />
                  {errors.totalSeats && <p className="form-error">{errors.totalSeats.message}</p>}
                </div>
              </div>

              {/* Pricing */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" {...register('isFree')} className="w-4 h-4 accent-orange-500" />
                  <span className="text-gray-300 text-sm">Free Event</span>
                </label>
                {!isFree && (
                  <div className="flex-1">
                    <label className="form-label">Price (₹) *</label>
                    <input
                      type="number"
                      {...register('price', { required: !isFree && 'Price is required', min: 0 })}
                      className="form-input"
                      placeholder="e.g. 999"
                    />
                    {errors.price && <p className="form-error">{errors.price.message}</p>}
                  </div>
                )}
              </div>

              {/* Booking Slug & Expiry */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Booking Slug</label>
                  <input
                    {...register('bookingSlug')}
                    className="form-input font-mono"
                    placeholder="e.g. summit-2026"
                  />
                  <p className="text-xs text-gray-500 mt-1">Accessible at /book/[slug]</p>
                </div>
                <div>
                  <label className="form-label">Booking URL Expiry</label>
                  <input
                    type="datetime-local"
                    {...register('bookingUrlExpiry')}
                    className="form-input"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    After this time, shows "Visit Website" fallback
                  </p>
                </div>
              </div>

              {/* Published */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('isPublished')} className="w-4 h-4 accent-orange-500" />
                <span className="text-gray-300 text-sm">Publish Event</span>
              </label>

              {/* Sponsors */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="form-label mb-0">Sponsors</label>
                  <button
                    type="button"
                    onClick={addSponsor}
                    className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white"
                  >
                    + Add Sponsor
                  </button>
                </div>
                {fields.length === 0 && (
                  <p className="text-xs text-gray-500">No sponsors added.</p>
                )}
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex items-center gap-3 bg-gray-800 rounded-lg p-3"
                    >
                      {/* Preview */}
                      {sponsorFiles[index]?.preview && (
                        <img
                          src={sponsorFiles[index].preview}
                          alt="sponsor"
                          className="w-12 h-12 object-contain rounded bg-white shrink-0"
                        />
                      )}
                      {/* Partner Type */}
                      <select
                        {...register(`sponsors.${index}.partnerType`)}
                        className="form-input flex-1"
                      >
                        {partnerTypes.map((pt) => (
                          <option key={pt} value={pt}>{pt}</option>
                        ))}
                      </select>
                      {/* Logo Upload */}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleSponsorFileChange(index, e)}
                        className="text-xs text-gray-400 flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => removeSponsor(index)}
                        className="text-red-400 hover:text-red-300 text-lg leading-none shrink-0"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
                {fields.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Sponsor logos are uploaded separately after saving the event.
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn-secondary">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
                  className="btn-primary"
                >
                  {isSubmitting || createMutation.isPending || updateMutation.isPending
                    ? 'Saving...'
                    : editingEvent
                    ? 'Update Event'
                    : 'Create Event'}
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
            <h3 className="text-lg font-bold text-white mb-2">Delete Event?</h3>
            <p className="text-gray-400 text-sm mb-6">
              Are you sure you want to delete{' '}
              <span className="text-white font-medium">"{deleteConfirm.title}"</span>? This action
              cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
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

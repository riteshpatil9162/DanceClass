import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { getAdminAdmins, createAdmin, updateAdmin, deleteAdmin } from '../../api';
import { useAdminStore } from '../../store/adminStore';

const ALL_PERMISSIONS = [
  { key: 'manage_courses', label: 'Manage Courses' },
  { key: 'manage_events', label: 'Manage Events' },
  { key: 'manage_users', label: 'Manage Users' },
  { key: 'manage_orders', label: 'Manage Orders' },
  { key: 'manage_packages', label: 'Manage Packages' },
  { key: 'manage_admins', label: 'Manage Admins' },
  { key: 'view_analytics', label: 'View Analytics' },
  { key: 'manage_sponsors', label: 'Manage Sponsors' },
  { key: 'manage_settings', label: 'Manage Settings' },
];

const ROLES = ['superadmin', 'admin', 'editor', 'viewer'];

const defaultValues = {
  name: '',
  email: '',
  password: '',
  role: 'editor',
  permissions: [],
};

export default function AdminAdminsPage() {
  const qc = useQueryClient();
  const { admin: currentAdmin } = useAdminStore();
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-admins'],
    queryFn: () => getAdminAdmins(),
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
    mutationFn: (body) => createAdmin(body),
    onSuccess: () => {
      qc.invalidateQueries(['admin-admins']);
      toast.success('Admin created');
      closeModal();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }) => updateAdmin(id, body),
    onSuccess: () => {
      qc.invalidateQueries(['admin-admins']);
      toast.success('Admin updated');
      closeModal();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteAdmin(id),
    onSuccess: () => {
      qc.invalidateQueries(['admin-admins']);
      toast.success('Admin deleted');
      setDeleteConfirm(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error'),
  });

  function openCreate() {
    setEditingAdmin(null);
    reset(defaultValues);
    setShowModal(true);
  }

  function openEdit(adm) {
    setEditingAdmin(adm);
    reset({
      name: adm.name || '',
      email: adm.email || '',
      password: '',
      role: adm.role || 'editor',
      permissions: adm.permissions || [],
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingAdmin(null);
    reset(defaultValues);
  }

  async function onSubmit(data) {
    const body = {
      name: data.name,
      email: data.email,
      role: data.role,
      permissions: data.permissions,
    };
    if (data.password) body.password = data.password;

    if (editingAdmin) {
      updateMutation.mutate({ id: editingAdmin._id, body });
    } else {
      createMutation.mutate({ ...body, password: data.password });
    }
  }

  const admins = data?.data?.data || data?.data || [];
  const isSuperAdmin = currentAdmin?.role === 'superadmin';

  function roleColor(role) {
    if (role === 'superadmin') return 'bg-orange-500/20 text-orange-400';
    if (role === 'admin') return 'bg-blue-500/20 text-blue-400';
    if (role === 'editor') return 'bg-purple-500/20 text-purple-400';
    return 'bg-gray-700 text-gray-400';
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Admins</h1>
        {isSuperAdmin && (
          <button onClick={openCreate} className="btn-primary">
            + New Admin
          </button>
        )}
      </div>

      {!isSuperAdmin && (
        <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm">
          Only Super Admins can create or modify admin accounts.
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading admins...</div>
      ) : admins.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No admins found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-700">
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Role</th>
                <th className="pb-3 pr-4">Permissions</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((adm) => (
                <tr key={adm._id} className="border-b border-gray-800 hover:bg-gray-800/40">
                  <td className="py-3 pr-4 font-medium text-white">
                    {adm.name}
                    {adm._id === currentAdmin?._id && (
                      <span className="ml-2 text-xs text-orange-400">(you)</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-gray-300">{adm.email}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${roleColor(adm.role)}`}>
                      {adm.role}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {adm.role === 'superadmin' ? (
                        <span className="text-xs text-gray-400">All permissions</span>
                      ) : adm.permissions?.length > 0 ? (
                        adm.permissions.map((p) => (
                          <span
                            key={p}
                            className="px-1.5 py-0.5 bg-gray-700 text-gray-300 rounded text-xs"
                          >
                            {p.replace('manage_', '').replace('view_', '')}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500">None</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3">
                    {isSuperAdmin && adm._id !== currentAdmin?._id && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(adm)}
                          className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white"
                        >
                          Edit
                        </button>
                        {adm.role !== 'superadmin' && (
                          <button
                            onClick={() => setDeleteConfirm(adm)}
                            className="text-xs px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingAdmin ? 'Edit Admin' : 'Create Admin'}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="form-label">Name *</label>
                <input
                  {...register('name', { required: 'Name required' })}
                  className="form-input"
                  placeholder="Full name"
                />
                {errors.name && <p className="form-error">{errors.name.message}</p>}
              </div>

              <div>
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  {...register('email', { required: 'Email required' })}
                  className="form-input"
                  placeholder="admin@example.com"
                />
                {errors.email && <p className="form-error">{errors.email.message}</p>}
              </div>

              <div>
                <label className="form-label">
                  Password {editingAdmin ? '(leave blank to keep current)' : '*'}
                </label>
                <input
                  type="password"
                  {...register('password', {
                    required: !editingAdmin ? 'Password required' : false,
                    minLength: { value: 6, message: 'Min 6 characters' },
                  })}
                  className="form-input"
                  placeholder={editingAdmin ? 'New password (optional)' : 'Min 6 characters'}
                />
                {errors.password && <p className="form-error">{errors.password.message}</p>}
              </div>

              <div>
                <label className="form-label">Role *</label>
                <select {...register('role')} className="form-input">
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Permissions */}
              <div>
                <label className="form-label">Permissions</label>
                <div className="space-y-2 border border-gray-700 rounded-lg p-3 bg-gray-800">
                  {ALL_PERMISSIONS.map((perm) => (
                    <Controller
                      key={perm.key}
                      control={control}
                      name="permissions"
                      render={({ field }) => (
                        <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-700 rounded p-1">
                          <input
                            type="checkbox"
                            className="accent-orange-500"
                            value={perm.key}
                            checked={field.value?.includes(perm.key)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                field.onChange([...(field.value || []), perm.key]);
                              } else {
                                field.onChange(field.value?.filter((k) => k !== perm.key));
                              }
                            }}
                          />
                          <span className="text-sm text-gray-300">{perm.label}</span>
                        </label>
                      )}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Superadmin role ignores permissions and has full access.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? 'Saving...' : editingAdmin ? 'Update Admin' : 'Create Admin'}
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
            <h3 className="text-lg font-bold text-white mb-2">Delete Admin?</h3>
            <p className="text-gray-400 text-sm mb-6">
              Remove <span className="text-white font-medium">{deleteConfirm.name}</span> ({deleteConfirm.email})? This cannot be undone.
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

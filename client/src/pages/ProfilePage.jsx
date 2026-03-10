import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { updateProfile, changePassword } from '../api';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const avatarInputRef = useRef(null);

  const {
    register: regProfile,
    handleSubmit: handleProfile,
    reset: resetProfile,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
  } = useForm();

  const {
    register: regPwd,
    handleSubmit: handlePwd,
    reset: resetPwd,
    watch,
    formState: { errors: pwdErrors, isSubmitting: pwdSubmitting },
  } = useForm();

  useEffect(() => {
    if (user) {
      resetProfile({ name: user.name, phone: user.phone || '' });
      setAvatarPreview(user.avatar || '');
    }
  }, [user, resetProfile]);

  const profileMutation = useMutation({
    mutationFn: (formData) => updateProfile(formData),
    onSuccess: (res) => {
      setUser(res.data.user || res.data);
      setAvatarFile(null);
      toast.success('Profile updated');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error updating profile'),
  });

  const passwordMutation = useMutation({
    mutationFn: (data) => changePassword(data),
    onSuccess: () => {
      toast.success('Password changed');
      resetPwd();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Error changing password'),
  });

  const newPwd = watch('newPassword');

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function onProfileSubmit(data) {
    const fd = new FormData();
    fd.append('name', data.name);
    fd.append('phone', data.phone || '');
    if (avatarFile) fd.append('avatar', avatarFile);
    profileMutation.mutate(fd);
  }

  return (
    <>
      <Helmet>
        <title>My Profile — {import.meta.env.VITE_APP_NAME}</title>
      </Helmet>

      <div className="min-h-screen bg-dark-950 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">My Profile</h1>

          {/* Profile Info */}
          <div className="card p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-5">Account Details</h2>
            <form onSubmit={handleProfile(onProfileSubmit)} className="space-y-4">
              {/* Avatar */}
              <div>
                <label className="form-label">Profile Photo</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-700 shrink-0 border-2 border-gray-600">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400 font-bold select-none">
                        {user?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="text-sm text-gray-400 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-gray-700 file:text-white hover:file:bg-gray-600 cursor-pointer w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG or WEBP. Max 5 MB.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="form-label">Full Name</label>
                <input
                  {...regProfile('name', { required: 'Name is required' })}
                  className="form-input"
                  placeholder="Your full name"
                />
                {profileErrors.name && <p className="form-error">{profileErrors.name.message}</p>}
              </div>

              <div>
                <label className="form-label">Email</label>
                <input
                  value={user?.email || ''}
                  readOnly
                  className="form-input opacity-60 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
              </div>

              <div>
                <label className="form-label">Phone</label>
                <input
                  {...regProfile('phone')}
                  className="form-input"
                  placeholder="+91 9876543210"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={profileSubmitting || profileMutation.isPending}
                  className="btn-primary"
                >
                  {profileSubmitting || profileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-white mb-5">Change Password</h2>
            <form
              onSubmit={handlePwd((data) => passwordMutation.mutate(data))}
              className="space-y-4"
            >
              <div>
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  {...regPwd('currentPassword', { required: 'Current password is required' })}
                  className="form-input"
                  placeholder="••••••••"
                />
                {pwdErrors.currentPassword && (
                  <p className="form-error">{pwdErrors.currentPassword.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  {...regPwd('newPassword', {
                    required: 'New password is required',
                    minLength: { value: 6, message: 'Minimum 6 characters' },
                  })}
                  className="form-input"
                  placeholder="••••••••"
                />
                {pwdErrors.newPassword && (
                  <p className="form-error">{pwdErrors.newPassword.message}</p>
                )}
              </div>

              <div>
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  {...regPwd('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (v) => v === newPwd || 'Passwords do not match',
                  })}
                  className="form-input"
                  placeholder="••••••••"
                />
                {pwdErrors.confirmPassword && (
                  <p className="form-error">{pwdErrors.confirmPassword.message}</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={pwdSubmitting}
                  className="btn-primary"
                >
                  {pwdSubmitting ? 'Updating...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

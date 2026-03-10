import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { adminLogin } from '../../api';
import useAdminStore from '../../store/adminStore';
import Spinner from '../../components/common/Spinner';

const APP_NAME = import.meta.env.VITE_APP_NAME || 'Course';

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setAdminAuth } = useAdminStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await adminLogin(data);
      setAdminAuth(res.data.data, res.data.token);
      toast.success(`Welcome, ${res.data.data.name}!`);
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Login - {APP_NAME}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-hero-pattern px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary-500/20 border border-primary-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield size={28} className="text-primary-500" />
            </div>
            <h1 className="text-3xl font-heading font-bold text-white">Admin Portal</h1>
            <p className="text-dark-400 mt-2 text-sm">{APP_NAME} Administration</p>
          </div>

          <div className="card p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="label">Admin Email</label>
                <input type="email" placeholder="admin@example.com" className="input-field"
                  {...register('email', { required: 'Email is required' })}
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} placeholder="Password" className="input-field pr-11"
                    {...register('password', { required: 'Password is required' })}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400">
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
              </div>
              <button type="submit" disabled={isLoading} className="btn-primary w-full py-3.5 disabled:opacity-60">
                {isLoading ? <Spinner size="sm" /> : 'Sign In to Admin'}
              </button>
            </form>
            <div className="mt-6 text-center">
              <Link to="/" className="text-dark-500 text-xs hover:text-dark-300 transition-colors">
                ← Back to Website
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

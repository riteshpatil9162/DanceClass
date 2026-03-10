import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, BookOpen } from 'lucide-react';
import { loginUser, adminLogin } from '../api';
import useAuthStore from '../store/authStore';
import useAdminStore from '../store/adminStore';
import Spinner from '../components/common/Spinner';

const APP_NAME = import.meta.env.VITE_APP_NAME || 'Course';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const { setAdminAuth } = useAdminStore();
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = location.state?.redirect || '/dashboard';

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Try regular user login first
      const res = await loginUser(data);
      setAuth(res.data.data, res.data.token);
      toast.success(`Welcome back, ${res.data.data.name}!`);
      navigate(redirect);
    } catch (userErr) {
      // If user login fails, try admin login
      try {
        const adminRes = await adminLogin(data);
        setAdminAuth(adminRes.data.data, adminRes.data.token);
        toast.success(`Welcome, ${adminRes.data.data.name}!`);
        navigate('/admin');
      } catch {
        // Both failed — show the original user login error
        toast.error(userErr.response?.data?.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login - {APP_NAME}</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-hero-pattern px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-orange-gradient rounded-xl flex items-center justify-center">
                <BookOpen size={22} className="text-white" />
              </div>
              <span className="text-2xl font-heading font-bold text-white">{APP_NAME}</span>
            </Link>
            <h1 className="text-3xl font-heading font-bold text-white">Welcome Back</h1>
            <p className="text-dark-400 mt-2">Log in to continue your learning journey</p>
          </div>

          <div className="card p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="input-field"
                  {...register('email', { required: 'Email is required' })}
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Your password"
                    className="input-field pr-11"
                    {...register('password', { required: 'Password is required' })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <button type="submit" disabled={isLoading} className="btn-primary w-full py-3.5 disabled:opacity-60">
                {isLoading ? <Spinner size="sm" /> : 'Login'}
              </button>
            </form>

            <p className="text-center text-dark-400 text-sm mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

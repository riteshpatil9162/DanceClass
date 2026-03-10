import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, BookOpen } from 'lucide-react';
import { registerUser } from '../api';
import useAuthStore from '../store/authStore';
import Spinner from '../components/common/Spinner';

const APP_NAME = import.meta.env.VITE_APP_NAME || 'Course';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await registerUser({ name: data.name, email: data.email, password: data.password, phone: data.phone });
      setAuth(res.data.data, res.data.token);
      toast.success(`Welcome, ${res.data.data.name}! Account created.`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Create Account - {APP_NAME}</title>
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
            <h1 className="text-3xl font-heading font-bold text-white">Create Account</h1>
            <p className="text-dark-400 mt-2">Join thousands of learners today</p>
          </div>

          <div className="card p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input type="text" placeholder="John Doe" className="input-field"
                  {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name too short' } })}
                />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="label">Email Address</label>
                <input type="email" placeholder="you@example.com" className="input-field"
                  {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="label">Phone (optional)</label>
                <input type="tel" placeholder="+91 00000 00000" className="input-field"
                  {...register('phone')}
                />
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} placeholder="Minimum 6 characters" className="input-field pr-11"
                    {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200">
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <label className="label">Confirm Password</label>
                <input type="password" placeholder="Repeat password" className="input-field"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (val) => val === watch('password') || 'Passwords do not match',
                  })}
                />
                {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
              </div>

              <button type="submit" disabled={isLoading} className="btn-primary w-full py-3.5 mt-2 disabled:opacity-60">
                {isLoading ? <Spinner size="sm" /> : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-dark-400 text-sm mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

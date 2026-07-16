import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useState } from 'react';
import { FiUser, FiMail, FiLock, FiLoader, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

export default function Register() {
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await signup(data);
      toast.success('Account created successfully!', { toastId: 'register-success' });
      navigate('/dashboard');
    } catch (err) {
      if (!err.response) {
        toast.error('Server is starting up or unreachable. Please try again in a few seconds.');
      } else {
        toast.error(err.response.data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-[var(--color-accent)] opacity-5 blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-[var(--color-accent-blue)] opacity-5 blur-3xl"></div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-outfit gradient-text">Create Account</h1>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1.5">Join CarbonTrack to log activities and save CO₂</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Username</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-3.5 text-[var(--color-text-muted)]" />
              <input 
                type="text" 
                placeholder="eco_warrior" 
                className="input-field pl-10"
                {...register('username', { required: 'Username is required' })}
              />
            </div>
            {errors.username && <p className="error-text">{errors.username.message}</p>}
          </div>

          <div>
            <label className="label">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-3.5 text-[var(--color-text-muted)]" />
              <input 
                type="email" 
                placeholder="email@example.com" 
                className="input-field pl-10"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
            </div>
            {errors.email && <p className="error-text">{errors.email.message}</p>}
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3.5 text-[var(--color-text-muted)]" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••" 
                className="input-field pl-10 pr-10"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' }
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] focus:outline-none cursor-pointer"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.password && <p className="error-text">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={loading} className="w-full btn-primary flex items-center justify-center gap-2 mt-2">
            {loading ? <FiLoader className="animate-spin" /> : 'Register'}
          </button>
        </form>

        <div className="flex items-center my-5">
          <div className="flex-1 border-t border-[var(--color-border)]"></div>
          <span className="px-3 text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-wider">Or</span>
          <div className="flex-1 border-t border-[var(--color-border)]"></div>
        </div>

        <button
          type="button"
          onClick={() => window.location.href = '/oauth2/authorization/google'}
          className="w-full btn-ghost flex items-center justify-center gap-2 py-2.5 bg-[var(--color-bg-card)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-card-hover)] border-[var(--color-border)] font-semibold text-sm transition-all shadow-sm rounded-lg cursor-pointer"
        >
          <FcGoogle className="text-lg" />
          Continue with Google
        </button>

        <div className="text-center mt-6">
          <p className="text-xs text-[var(--color-text-secondary)]">
            Already have an account?{' '}
            <Link to="/login" className="text-[var(--color-accent)] font-semibold hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

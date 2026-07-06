import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/api';
import { toast } from 'react-toastify';
import { FiLoader } from 'react-icons/fi';

export default function OAuth2RedirectHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      // Temporarily store the token in localStorage so that profileService uses it in the request interceptor
      localStorage.setItem('accessToken', token);

      profileService.getProfile()
        .then((profile) => {
          loginWithToken(token, profile);
          toast.success('Logged in with Google successfully!');
          navigate('/dashboard');
        })
        .catch((err) => {
          console.error('Failed to retrieve user profile after Google login', err);
          localStorage.removeItem('accessToken');
          toast.error('Google login failed during profile setup.');
          navigate('/login');
        });
    } else {
      toast.error('Google login failed. No authentication token received.');
      navigate('/login');
    }
  }, [searchParams, loginWithToken, navigate]);

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] flex flex-col items-center justify-center p-4">
      <div className="glass-card p-8 flex flex-col items-center justify-center max-w-sm w-full text-center">
        <FiLoader className="text-4xl text-[var(--color-accent)] animate-spin mb-4" />
        <h3 className="text-xl font-bold font-outfit text-[var(--color-text-primary)]">Completing login...</h3>
        <p className="text-xs text-[var(--color-text-secondary)] mt-2 leading-relaxed">
          Please wait a moment while we establish your secure session.
        </p>
      </div>
    </div>
  );
}

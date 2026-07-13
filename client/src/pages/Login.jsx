import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import WeddingRingIcon from '../components/WeddingRingIcon';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, loginWithGoogle, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const googleButtonRef = useRef(null);
  const loginWithGoogleRef = useRef(loginWithGoogle);
  loginWithGoogleRef.current = loginWithGoogle;
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const redirectForRole = useCallback((currentUser) => {
    switch (currentUser.role) {
      case 'ADMIN': navigate('/admin', { replace: true }); break;
      case 'PLANNER': navigate('/planner', { replace: true }); break;
      default: navigate('/client', { replace: true }); break;
    }
  }, [navigate]);

  const redirectAfterLogin = useCallback((currentUser) => {
    const redirectPath = searchParams.get('redirect');
    if (redirectPath && currentUser.role === 'CLIENT') {
      navigate(redirectPath, { replace: true });
      return;
    }
    redirectForRole(currentUser);
  }, [navigate, redirectForRole, searchParams]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    redirectAfterLogin(user);
  }, [isAuthenticated, user, redirectAfterLogin]);

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) return undefined;

    const renderGoogleButton = () => {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async ({ credential }) => {
          setError('');
          setSubmitting(true);
          try {
            await loginWithGoogleRef.current(credential);
          } catch (err) {
            setError(typeof err === 'string' ? err : err?.message || 'Sign-in failed');
          } finally {
            setSubmitting(false);
          }
        },
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline', size: 'large', text: 'continue_with', width: 360,
      });
    };

    const existingScript = document.querySelector('script[data-google-identity]');
    if (existingScript) {
      if (window.google) renderGoogleButton();
      else existingScript.addEventListener('load', renderGoogleButton);
      return () => existingScript.removeEventListener('load', renderGoogleButton);
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.dataset.googleIdentity = 'true';
    script.onload = renderGoogleButton;
    document.head.appendChild(script);
    return () => { script.onload = null; };
  }, [googleClientId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(typeof err === 'string' ? err : err?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col justify-center py-12 sm:px-6 lg:px-8 bg-rose-50/10">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="rounded-full bg-rose-50 p-3 text-rose-600">
            <WeddingRingIcon className="h-12 w-12" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/register" className="font-semibold text-rose-600 hover:text-rose-500 transition">
            create a new wedding planner profile
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-100 sm:rounded-3xl sm:px-10 border border-gray-100">
          {error && (
            <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700 flex items-start gap-2.5 border border-red-100 animate-shake">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                Email address
              </label>
              <div className="mt-1.5 relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-2xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-950 placeholder-gray-400 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 sm:text-sm"
                  placeholder="name@wedding.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className="mt-1.5 relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-2xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-950 placeholder-gray-400 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
              <div className="mt-2 text-right">
                <Link to="/forgot-password" className="text-sm font-semibold text-rose-600 hover:text-rose-500">
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full justify-center rounded-2xl bg-rose-600 py-3.5 px-4 text-sm font-bold text-white shadow-lg shadow-rose-200 hover:bg-rose-500 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:bg-rose-400 hover:scale-[1.01]"
              >
                {submitting ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-gray-400">
            <div className="h-px flex-1 bg-gray-200" />
            <span>OR</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>
          {googleClientId ? (
            <div ref={googleButtonRef} className="flex justify-center" />
          ) : (
            <p className="text-center text-xs text-gray-500">Google sign-in will be available once it is configured.</p>
          )}

          <div className="mt-8 border-t border-gray-100 pt-6">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Demo User Logins</h4>
            <div className="space-y-2 text-xs text-gray-600 bg-gray-50 p-4 rounded-xl">
              <div><span className="font-bold">Admin:</span> admin@wedding.com <span className="text-gray-400">/</span> admin123</div>
              <div><span className="font-bold">Planner:</span> planner@wedding.com <span className="text-gray-400">/</span> planner123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

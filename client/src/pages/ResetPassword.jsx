import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import WeddingRingIcon from '../components/WeddingRingIcon';

const ResetPassword = () => {
  const [params] = useSearchParams();
  const token = params.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!token) {
      setError('Invalid or missing password reset token. Please request a new link.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please enter matching passwords.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await resetPassword(token, password);
      setMessage(response.message || 'Password reset successfully! You can now log in.');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Unable to reset password. The link may have expired.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-rose-50/10 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 shadow-xl shadow-gray-100 sm:p-10">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-rose-50 p-3 text-rose-600">
            <WeddingRingIcon className="h-10 w-10" />
          </div>
        </div>

        <h1 className="text-center text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
          Choose a new password
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Set a secure new password for your wedding planner profile.
        </p>

        {!token && !message && (
          <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-xs text-amber-800 flex items-start gap-2.5 border border-amber-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-bold">Missing Reset Token</p>
              <p className="mt-1">No valid reset token was found in the link URL. Please check your email or request a new password reset link.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl bg-red-50 p-4 text-xs text-red-700 flex items-start gap-2.5 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {message ? (
          <div className="mt-6 space-y-5">
            <div className="rounded-2xl bg-emerald-50 p-4 text-xs text-emerald-800 flex items-start gap-2.5 border border-emerald-200 leading-relaxed">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <p className="font-bold">{message}</p>
                <p className="mt-1 text-emerald-700">Your account is updated and ready to sign in.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-200 hover:bg-rose-500 transition hover:scale-[1.01]"
            >
              <span>Sign In with New Password</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          token && (
            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5" htmlFor="new-password">
                  New Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="new-password"
                    type="password"
                    minLength={8}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    className="block w-full rounded-2xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-950 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 text-sm shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5" htmlFor="confirm-password">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="confirm-password"
                    type="password"
                    minLength={8}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="Repeat new password"
                    className="block w-full rounded-2xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-950 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 text-sm shadow-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-rose-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-200 hover:bg-rose-500 transition disabled:bg-rose-400 hover:scale-[1.01]"
              >
                {submitting ? 'Updating password...' : 'Update Password'}
              </button>
            </form>
          )
        )}

        <div className="mt-8 border-t border-gray-100 pt-6 text-center">
          <Link to="/login" className="text-sm font-semibold text-rose-600 hover:text-rose-500 transition">
            ← Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

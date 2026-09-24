import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import WeddingRingIcon from '../components/WeddingRingIcon';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { requestPasswordReset } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setResetUrl('');
    setSubmitting(true);

    try {
      const response = await requestPasswordReset(email.trim());
      setMessage(response.message || 'Password reset link generated successfully.');
      setResetUrl(response.resetUrl || '');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Unable to request password reset. Please check your email.');
    } finally {
      setSubmitting(false);
    }
  };

  const getResetRelativePath = (urlStr) => {
    if (!urlStr) return '/reset-password';
    try {
      const parsed = new URL(urlStr, window.location.origin);
      return parsed.pathname + parsed.search;
    } catch {
      return urlStr.startsWith('/') ? urlStr : `/reset-password`;
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
          Reset your password
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your registered email address and we'll generate a secure password reset link for your account.
        </p>

        {error && (
          <div className="mt-6 rounded-2xl bg-red-50 p-4 text-xs text-red-700 flex items-start gap-2.5 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-emerald-50 p-4 text-xs text-emerald-800 flex items-start gap-2.5 border border-emerald-200 leading-relaxed">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <p className="font-bold">{message}</p>
                <p className="mt-1 text-emerald-700">Click the button below to choose a new password.</p>
              </div>
            </div>

            {resetUrl && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate(getResetRelativePath(resetUrl))}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-200 hover:bg-rose-500 transition hover:scale-[1.01]"
                >
                  <KeyRound className="h-4 w-4" />
                  <span>Click Here to Reset Password</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {!message && (
          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="name@example.com"
                  className="block w-full rounded-2xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-950 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 text-sm shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-rose-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-200 hover:bg-rose-500 transition disabled:bg-rose-400 hover:scale-[1.01]"
            >
              {submitting ? 'Generating link...' : 'Send Reset Link'}
            </button>
          </form>
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

export default ForgotPassword;
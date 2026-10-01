import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle2, AlertCircle, Inbox, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import WeddingRingIcon from '../components/WeddingRingIcon';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { requestPasswordReset } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      const response = await requestPasswordReset(email.trim());
      setSubmittedEmail(email.trim());
      setMessage(response.message || `A password reset link has been sent to ${email.trim()}. Please check your email to proceed.`);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Unable to request password reset. Please check your email.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = () => {
    setMessage('');
    setError('');
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-rose-50/10 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 shadow-xl shadow-gray-100 sm:p-10">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-rose-50 p-3 text-rose-600">
            <WeddingRingIcon className="h-10 w-10" />
          </div>
        </div>

        {message ? (
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4 shadow-sm">
              <Inbox className="h-7 w-7" />
            </div>
            
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
              Check your email
            </h1>

            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              We have sent a password reset link to <strong className="font-semibold text-gray-900">{submittedEmail || email}</strong>.
            </p>

            <div className="mt-6 rounded-2xl bg-emerald-50/80 p-4 text-xs text-emerald-900 border border-emerald-200 text-left space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>Next steps:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-gray-700 pl-1">
                <li>Open your email inbox.</li>
                <li>Click on the <strong>Reset Password Now</strong> link inside the email.</li>
                <li>Choose your new password on the secure page.</li>
              </ol>
            </div>

            <p className="mt-5 text-xs text-gray-500">
              Didn't receive the email? Check your spam/junk folder or{' '}
              <button
                type="button"
                onClick={handleResend}
                className="font-bold text-rose-600 hover:underline inline-flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3 inline" /> try again
              </button>
              .
            </p>

            <div className="mt-8 border-t border-gray-100 pt-6">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-rose-600 hover:text-rose-500 transition"
              >
                <ArrowLeft className="h-4 w-4" /> Back to sign in
              </Link>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-center text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
              Reset your password
            </h1>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter your registered email address and we'll send a password reset link to your inbox.
            </p>

            {error && (
              <div className="mt-6 rounded-2xl bg-red-50 p-4 text-xs text-red-700 flex items-start gap-2.5 border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

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
                {submitting ? 'Sending email...' : 'Send Reset Link to Email'}
              </button>
            </form>

            <div className="mt-8 border-t border-gray-100 pt-6 text-center">
              <Link to="/login" className="text-sm font-semibold text-rose-600 hover:text-rose-500 transition">
                ← Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
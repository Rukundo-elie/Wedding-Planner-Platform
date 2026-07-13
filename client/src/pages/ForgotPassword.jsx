import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { requestPasswordReset } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const response = await requestPasswordReset(email);
      setMessage(response.message);
      setResetUrl(response.resetUrl || '');
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-rose-50/10 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white px-6 py-8 shadow-xl shadow-gray-100 sm:px-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Reset your password</h1>
        <p className="mt-2 text-sm text-gray-600">Enter your account email and we’ll send you a reset link.</p>

        {message && <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">{message}</div>}
        {resetUrl && <Link to={new URL(resetUrl).pathname + new URL(resetUrl).search} className="mt-4 block text-sm font-semibold text-rose-600 hover:text-rose-500">Continue to reset password (development)</Link>}
        {error && <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        {!message && <form onSubmit={handleSubmit} className="mt-7 space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Email address</label>
            <div className="relative mt-1.5">
              <Mail className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="name@wedding.com" className="block w-full rounded-2xl border border-gray-300 py-3 pl-10 pr-4 text-gray-950 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500" />
            </div>
          </div>
          <button type="submit" disabled={submitting} className="w-full rounded-2xl bg-rose-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-200 hover:bg-rose-500 disabled:bg-rose-400">{submitting ? 'Sending...' : 'Send reset link'}</button>
        </form>}
        <Link to="/login" className="mt-7 block text-center text-sm font-semibold text-rose-600 hover:text-rose-500">Back to sign in</Link>
      </div>
    </div>
  );
};

export default ForgotPassword;

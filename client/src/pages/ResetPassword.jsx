import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ResetPassword = () => {
  const [params] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    setSubmitting(true);
    try {
      const response = await resetPassword(params.get('token'), password);
      setMessage(response.message);
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-rose-50/10 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white px-6 py-8 shadow-xl shadow-gray-100 sm:px-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Choose a new password</h1>
        {message ? <><p className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">{message}</p><Link to="/login" className="mt-6 block text-center text-sm font-semibold text-rose-600">Sign in</Link></> : <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          {error && <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
          {['New password', 'Confirm password'].map((label, index) => <div key={label}><label className="block text-sm font-semibold text-gray-700" htmlFor={`password-${index}`}>{label}</label><div className="relative mt-1.5"><Lock className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-gray-400" /><input id={`password-${index}`} type="password" minLength="8" required value={index ? confirmPassword : password} onChange={(e) => index ? setConfirmPassword(e.target.value) : setPassword(e.target.value)} autoComplete="new-password" className="block w-full rounded-2xl border border-gray-300 py-3 pl-10 pr-4 text-gray-950 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500" /></div></div>)}
          <button type="submit" disabled={submitting} className="w-full rounded-2xl bg-rose-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-200 hover:bg-rose-500 disabled:bg-rose-400">{submitting ? 'Updating...' : 'Update password'}</button>
        </form>}
      </div>
    </div>
  );
};

export default ResetPassword;

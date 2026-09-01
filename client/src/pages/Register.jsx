import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Lock, Mail, User, Phone, AlertCircle, Building2, 
  MapPin, DollarSign, Tag, FileText, Sparkles, CheckCircle2 
} from 'lucide-react';
import WeddingRingIcon from '../components/WeddingRingIcon';

const SERVICE_OPTIONS = [
  'Venue',
  'Caterer',
  'Decorator',
  'Photographer',
  'DJ',
  'Transport',
  'Makeup Artist',
  'Cake & Pastry',
  'Entertainment'
];

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CLIENT');

  // Vendor-specific state fields
  const [businessName, setBusinessName] = useState('');
  const [service, setService] = useState('Venue');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('Kigali City');
  const [description, setDescription] = useState('');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const vendorData = role === 'VENDOR' ? {
      businessName: businessName || name,
      service,
      price: price ? parseFloat(price) : 0,
      location,
      description,
    } : {};

    try {
      const user = await register(name, email, phone, password, role, vendorData);
      
      // Redirect based on role
      switch (user.role) {
        case 'ADMIN':
          navigate('/admin');
          break;
        case 'PLANNER':
          navigate('/planner');
          break;
        case 'VENDOR':
          navigate('/vendor');
          break;
        default:
          navigate('/client');
          break;
      }
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] flex-col justify-center py-12 sm:px-6 lg:px-8 bg-rose-50/10">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="rounded-full bg-rose-50 p-3 text-rose-600">
            <WeddingRingIcon className="h-12 w-12" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/login" className="font-semibold text-rose-600 hover:text-rose-500 transition">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className={`mt-8 sm:mx-auto sm:w-full ${role === 'VENDOR' ? 'sm:max-w-xl' : 'sm:max-w-md'}`}>
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-100 sm:rounded-3xl sm:px-10 border border-gray-100">
          {error && (
            <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700 flex items-start gap-2.5 border border-red-100 animate-shake">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                I am registering as:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('CLIENT')}
                  className={`rounded-2xl p-3 text-xs font-bold border transition text-center flex flex-col items-center gap-1 ${
                    role === 'CLIENT'
                      ? 'border-rose-500 bg-rose-50 text-rose-600 shadow-sm'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Couple / Client</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('VENDOR')}
                  className={`rounded-2xl p-3 text-xs font-bold border transition text-center flex flex-col items-center gap-1 ${
                    role === 'VENDOR'
                      ? 'border-rose-500 bg-rose-50 text-rose-600 shadow-sm'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  <span>Service Vendor / Business</span>
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                {role === 'VENDOR' ? 'Owner / Contact Full Name' : 'Full Name'}
              </label>
              <div className="mt-1.5 relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <User className="h-5 w-5" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-2xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-950 placeholder-gray-400 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 sm:text-sm"
                  placeholder="Elie Rukundo"
                />
              </div>
            </div>

            {/* Email */}
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
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-2xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-950 placeholder-gray-400 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 sm:text-sm"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
                Phone / WhatsApp Number
              </label>
              <div className="mt-1.5 relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Phone className="h-5 w-5" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full rounded-2xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-950 placeholder-gray-400 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 sm:text-sm"
                  placeholder="+250 788 000 000"
                />
              </div>
            </div>

            {/* Password */}
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
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-2xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-gray-950 placeholder-gray-400 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* VENDOR SPECIAL BUSINESS FIELDS */}
            {role === 'VENDOR' && (
              <div className="pt-4 border-t border-rose-100/80 space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider">
                  <Building2 className="h-4 w-4" />
                  <span>Vendor Business Listing Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Business / Trade Name</label>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Kigali Luxury Rides"
                      className="block w-full rounded-2xl border border-gray-300 bg-white py-2.5 px-3.5 text-gray-950 focus:border-rose-500 focus:outline-none sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Service Category</label>
                    <select
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      className="block w-full rounded-2xl border border-gray-300 bg-white py-2.5 px-3.5 text-gray-950 focus:border-rose-500 focus:outline-none sm:text-sm font-medium"
                    >
                      {SERVICE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Starting Price (RWF)</label>
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. 500000"
                      className="block w-full rounded-2xl border border-gray-300 bg-white py-2.5 px-3.5 text-gray-950 focus:border-rose-500 focus:outline-none sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Location / City</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Kigali, Rubavu"
                      className="block w-full rounded-2xl border border-gray-300 bg-white py-2.5 px-3.5 text-gray-950 focus:border-rose-500 focus:outline-none sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Short Business Bio / Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell couples what is included in your wedding service..."
                    className="block w-full rounded-2xl border border-gray-300 bg-white py-2.5 px-3.5 text-gray-950 focus:border-rose-500 focus:outline-none sm:text-sm"
                  />
                </div>

                <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/60 text-xs text-amber-800 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                  <span>
                    <strong>Verification Notice:</strong> Newly registered vendor accounts are reviewed by administrators before being published to the category directory.
                  </span>
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full justify-center rounded-2xl bg-rose-600 py-3.5 px-4 text-sm font-bold text-white shadow-lg shadow-rose-200 hover:bg-rose-500 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:bg-rose-400 hover:scale-[1.01]"
              >
                {submitting ? 'Registering...' : role === 'VENDOR' ? 'Register Business' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { 
  Building2, MapPin, Phone, Mail, Sparkles, CheckCircle2, 
  Clock, AlertCircle, Eye, Save, ExternalLink, RefreshCw 
} from 'lucide-react';

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

const VendorDashboard = () => {
  const { user } = useAuth();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ type: '', text: '' });

  // Profile Form States
  const [name, setName] = useState('');
  const [service, setService] = useState('Venue');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  useEffect(() => {
    fetchVendorProfile();
  }, []);

  const fetchVendorProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/vendors/profile/me');
      const data = res.data;
      setVendor(data);
      setName(data.name || '');
      setService(data.service || 'Venue');
      setPrice(data.price !== undefined ? data.price.toString() : '');
      setLocation(data.location || '');
      setPhone(data.phone || '');
      setEmail(data.email || '');
      setDescription(data.description || '');
      setImage(data.image || '');
    } catch (err) {
      console.error('Error fetching vendor profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, text) => {
    setNotification({ type, text });
    setTimeout(() => setNotification({ type: '', text: '' }), 5000);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.put('/vendors/profile/me', {
        name,
        service,
        price: price ? parseFloat(price) : 0,
        location,
        phone,
        email,
        description,
        image,
      });

      setVendor(res.data.vendor);
      showNotification('success', res.data.message || 'Profile saved successfully!');
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[75vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
      </div>
    );
  }

  const isApproved = vendor?.isApproved || vendor?.status === 'APPROVED';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Vendor Business Portal</h1>
          <p className="text-sm text-gray-500">Welcome back, {user?.name}. Manage your public business listing.</p>
        </div>
        <Link
          to={`/vendors?category=${encodeURIComponent(service || 'All')}`}
          className="inline-flex items-center gap-2 rounded-2xl bg-white border border-gray-200 px-5 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition"
        >
          <Eye className="h-4 w-4 text-rose-500" />
          <span>View Public Directory</span>
        </Link>
      </div>

      {/* Alert Notifications */}
      {notification.text && (
        <div className={`mb-6 p-4 rounded-2xl text-sm border flex items-center gap-2.5 ${
          notification.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
        }`}>
          <span>{notification.text}</span>
        </div>
      )}

      {/* Approval Status Banner */}
      <div className={`mb-8 p-6 rounded-3xl border ${
        isApproved 
          ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' 
          : 'bg-amber-50/60 border-amber-200 text-amber-900'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {isApproved ? (
              <div className="rounded-full bg-emerald-100 p-2.5 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            ) : (
              <div className="rounded-full bg-amber-100 p-2.5 text-amber-600">
                <Clock className="h-6 w-6" />
              </div>
            )}
            <div>
              <div className="font-extrabold text-base">
                {isApproved ? 'Listing Status: Verified & Live' : 'Listing Status: Awaiting Administrator Approval'}
              </div>
              <p className="text-xs text-gray-600 mt-0.5 max-w-2xl">
                {isApproved 
                  ? `Your business is live and actively displayed under the "${vendor?.service}" category in our public directory.` 
                  : 'Your account is currently under review by our administration team. Once verified, your business will be visible to couples across Rwanda.'}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
            isApproved ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
          }`}>
            {vendor?.status || (isApproved ? 'APPROVED' : 'PENDING')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Edit Profile */}
        <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-xl font-bold text-gray-900">Business Profile Details</h2>
            <p className="text-xs text-gray-500">Update your pricing, location, and services offered.</p>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Business / Brand Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kigali Serena Hotel Venue"
                  className="block w-full rounded-2xl border border-gray-300 bg-white py-3 px-4 text-gray-950 focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Service Category</label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="block w-full rounded-2xl border border-gray-300 bg-white py-3 px-4 text-gray-950 focus:border-rose-500 focus:outline-none font-medium"
                >
                  {SERVICE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Starting Price (RWF)</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 500000"
                  className="block w-full rounded-2xl border border-gray-300 bg-white py-3 px-4 text-gray-950 focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Business Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Kigali City, Rubavu, Musanze"
                  className="block w-full rounded-2xl border border-gray-300 bg-white py-3 px-4 text-gray-950 focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Public Contact Phone / WhatsApp</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+250 788 000 000"
                  className="block w-full rounded-2xl border border-gray-300 bg-white py-3 px-4 text-gray-950 focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Public Business Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="info@business.rw"
                  className="block w-full rounded-2xl border border-gray-300 bg-white py-3 px-4 text-gray-950 focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Cover Photo Image URL</label>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="block w-full rounded-2xl border border-gray-300 bg-white py-3 px-4 text-gray-950 focus:border-rose-500 focus:outline-none text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Business Bio / Inclusions Description</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your wedding packages, guest capacity, floral themes, equipment specs..."
                className="block w-full rounded-2xl border border-gray-300 bg-white py-3 px-4 text-gray-950 focus:border-rose-500 focus:outline-none text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 w-full rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold py-3.5 px-4 text-sm shadow-md shadow-rose-100 transition disabled:opacity-60"
            >
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>{saving ? 'Saving Profile...' : 'Save Business Profile'}</span>
            </button>
          </form>
        </div>

        {/* Right Side: Live Card Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-gray-900 text-sm">Directory Card Preview</h3>
              <span className="text-[11px] bg-gray-100 text-gray-600 font-semibold px-2.5 py-0.5 rounded-full">
                Live Preview
              </span>
            </div>

            {/* Simulated Card */}
            <div className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-md">
              <div className="h-48 w-full bg-gray-100 relative overflow-hidden">
                {image ? (
                  <img src={image} alt={name || 'Vendor Preview'} className="w-full h-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-rose-50/50 text-rose-300">
                    <Building2 className="h-12 w-12" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-md px-3 py-1 text-xs font-bold text-rose-600 shadow-sm">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>{service}</span>
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">{name || 'Your Business Name'}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-rose-500" />
                    <span>{location || 'Kigali, Rwanda'}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 line-clamp-2">
                  {description || 'Your service description will appear here on the public wedding category page.'}
                </p>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] font-semibold text-gray-400 uppercase">Starting Price</span>
                    <span className="text-base font-extrabold text-gray-950">
                      {price ? `${parseFloat(price).toLocaleString()} RWF` : 'Custom Quote'}
                    </span>
                  </div>

                  <span className="rounded-full bg-rose-50 text-rose-600 px-3.5 py-1.5 text-xs font-bold">
                    Contact Provider
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl text-xs text-gray-500 leading-relaxed">
              💡 <strong>Tip:</strong> Keep your pricing and contact details updated. Wedding planners frequently recommend verified providers to couples.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;

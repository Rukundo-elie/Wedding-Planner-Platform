import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TrendingUp, Package, Briefcase, Plus, 
  Trash2, Award, Users, AlertCircle, Mail, CreditCard 
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [reports, setReports] = useState(null);
  const [packages, setPackages] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [payments, setPayments] = useState([]);
  
  // Package form state
  const [pkgForm, setPkgForm] = useState({ id: null, name: '', description: '', price: '', image: '' });
  
  // Vendor form state
  const [vendorForm, setVendorForm] = useState({ id: null, name: '', service: 'Venue', price: '', location: '', phone: '', email: '' });

  // Notifications / status
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      const fetchResource = async (url) => {
        try {
          const res = await axios.get(url);
          return res.data;
        } catch (e) {
          console.error(`Error loading ${url}:`, e);
          return null;
        }
      };

      const [reportsData, pkgsData, vendorsData, contactData, paymentsData] = await Promise.all([
        fetchResource('/reports'),
        fetchResource('/packages'),
        fetchResource('/vendors'),
        fetchResource('/contact'),
        fetchResource('/payments')
      ]);

      if (reportsData) setReports(reportsData);
      if (pkgsData) setPackages(pkgsData);
      if (vendorsData) setVendors(vendorsData);
      if (contactData) setContactMessages(contactData);
      if (paymentsData) setPayments(paymentsData);
    } catch (err) {
      console.error(err);
      showNotification('error', 'Failed to retrieve administrator data.');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 5000);
  };

  // Manage Packages CRUD
  const handlePkgSubmit = async (e) => {
    e.preventDefault();
    if (!pkgForm.name || !pkgForm.description || !pkgForm.price) return;

    try {
      if (pkgForm.id) {
        // Update
        const res = await axios.put(`/packages/${pkgForm.id}`, pkgForm);
        setPackages(packages.map(p => p.id === pkgForm.id ? res.data.package : p));
        showNotification('success', 'Package updated successfully.');
      } else {
        // Create
        const res = await axios.post('/packages', pkgForm);
        setPackages([...packages, res.data.package]);
        showNotification('success', 'New package created.');
      }
      setPkgForm({ id: null, name: '', description: '', price: '', image: '' });
    } catch (err) {
      showNotification('error', 'Failed to save package.');
    }
  };

  const handlePkgDelete = async (pkgId) => {
    if (!window.confirm('Are you sure you want to delete this package?')) return;
    try {
      await axios.delete(`/packages/${pkgId}`);
      setPackages(packages.filter(p => p.id !== pkgId));
      showNotification('success', 'Package removed.');
    } catch (err) {
      showNotification('error', 'Failed to delete package.');
    }
  };

  // Manage Vendors CRUD
  const handleVendorSubmit = async (e) => {
    e.preventDefault();
    if (!vendorForm.name || !vendorForm.price) return;

    try {
      if (vendorForm.id) {
        // Update
        const res = await axios.put(`/vendors/${vendorForm.id}`, vendorForm);
        setVendors(vendors.map(v => v.id === vendorForm.id ? res.data.vendor : v));
        showNotification('success', 'Vendor information updated.');
      } else {
        // Create
        const res = await axios.post('/vendors', vendorForm);
        setVendors([...vendors, res.data.vendor]);
        showNotification('success', 'New vendor added.');
      }
      setVendorForm({ id: null, name: '', service: 'Venue', price: '', location: '', phone: '', email: '' });
    } catch (err) {
      showNotification('error', 'Failed to save vendor.');
    }
  };

  const handleVendorDelete = async (vendorId) => {
    if (!window.confirm('Are you sure you want to remove this vendor?')) return;
    try {
      await axios.delete(`/vendors/${vendorId}`);
      setVendors(vendors.filter(v => v.id !== vendorId));
      showNotification('success', 'Vendor removed.');
    } catch (err) {
      showNotification('error', 'Failed to delete vendor.');
    }
  };

  // Handle Verify & Reject Payments
  const handleVerifyPayment = async (paymentId) => {
    if (!window.confirm('Are you sure you want to verify and confirm this payment?')) return;
    try {
      const res = await axios.patch(`/payments/${paymentId}/verify`);
      showNotification('success', res.data.message || 'Payment verified and booking confirmed!');
      fetchAdminData();
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Verification failed.');
    }
  };

  const handleRejectPayment = async (paymentId) => {
    if (!window.confirm('Are you sure you want to reject this payment?')) return;
    try {
      const res = await axios.patch(`/payments/${paymentId}/reject`);
      showNotification('success', res.data.message || 'Payment marked as rejected.');
      fetchAdminData();
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Rejection failed.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Toast Alert */}
      {msg.text && (
        <div className={`mb-6 p-4 rounded-xl text-sm border flex items-center gap-2.5 ${
          msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
        }`}>
          <span>{msg.text}</span>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Administrator Console</h1>
        <p className="text-gray-500 text-sm">Monitor platform metrics, manage packages, and vendor listings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-fit space-y-2">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition ${
              activeTab === 'analytics' ? 'bg-rose-50 text-rose-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <TrendingUp className="h-5 w-5" />
            <span>Platform Overview</span>
          </button>
          
          <button
            onClick={() => setActiveTab('packages')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition ${
              activeTab === 'packages' ? 'bg-rose-50 text-rose-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Package className="h-5 w-5" />
            <span>Manage Packages</span>
          </button>

          <button
            onClick={() => setActiveTab('vendors')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition ${
              activeTab === 'vendors' ? 'bg-rose-50 text-rose-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Briefcase className="h-5 w-5" />
            <span>Manage Vendors</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition ${
              activeTab === 'payments' ? 'bg-rose-50 text-rose-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <CreditCard className="h-5 w-5" />
            <span>Verify Payments</span>
          </button>

          <button
            onClick={() => setActiveTab('inquiries')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition ${
              activeTab === 'inquiries' ? 'bg-rose-50 text-rose-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Mail className="h-5 w-5" />
            <span>Contact Inquiries</span>
          </button>
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-3 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm min-h-[500px]">
          
          {/* TAB 1: ANALYTICS */}
          {activeTab === 'analytics' && reports && (
            <div className="space-y-8">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-4">Revenue & Performance Summary</h2>
              
              {/* Analytics grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-emerald-50/20 border border-emerald-100 p-6 rounded-2xl">
                  <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Total Revenue</div>
                  <div className="text-3xl font-extrabold text-gray-900">{reports.revenue.toLocaleString()} RWF</div>
                </div>
                <div className="bg-rose-50/20 border border-rose-100 p-6 rounded-2xl">
                  <div className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">Total Bookings</div>
                  <div className="text-3xl font-extrabold text-gray-900">{reports.bookingsCount} Weddings</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANAGE PACKAGES */}
          {activeTab === 'packages' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-xl font-bold text-gray-900">Wedding Packages</h2>
                <span className="bg-rose-50 text-rose-600 font-bold text-xs px-3 py-1.5 rounded-2xl border border-rose-100/50">
                  {packages.length} Packages Available
                </span>
              </div>

              {/* Package list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {packages.map((pkg) => (
                  <div key={pkg.id} className="border border-gray-100 rounded-3xl p-6 space-y-4 shadow-sm relative group bg-white hover:border-rose-100 transition">
                    <div>
                      <h4 className="font-extrabold text-gray-900 text-lg">{pkg.name}</h4>
                      <p className="text-gray-500 text-xs mt-1">{pkg.description}</p>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="font-extrabold text-rose-600 text-base">{pkg.price.toLocaleString()} RWF</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPkgForm(pkg)}
                          className="rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 px-4 py-1.5 text-xs font-bold transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handlePkgDelete(pkg.id)}
                          className="rounded-full bg-gray-50 hover:bg-red-50 hover:text-red-600 text-gray-400 p-2 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Package form */}
              <div className="bg-gray-50/50 border border-gray-100 rounded-3xl p-6">
                <h3 className="font-bold text-gray-900 mb-4">{pkgForm.id ? 'Edit Package Inclusions' : 'Create New Inclusions Package'}</h3>
                <form onSubmit={handlePkgSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Package Name</label>
                    <input
                      type="text"
                      value={pkgForm.name}
                      onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })}
                      placeholder="e.g. Diamond Luxury"
                      className="block w-full rounded-2xl border border-gray-300 bg-white py-3 px-4 text-gray-950 focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Description / Inclusions</label>
                    <textarea
                      value={pkgForm.description}
                      onChange={(e) => setPkgForm({ ...pkgForm, description: e.target.value })}
                      placeholder="List venues, food, decoration, services..."
                      rows={3}
                      className="block w-full rounded-2xl border border-gray-300 bg-white py-3 px-4 text-gray-950 focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Pricing Rate (RWF)</label>
                    <input
                      type="number"
                      value={pkgForm.price}
                      onChange={(e) => setPkgForm({ ...pkgForm, price: e.target.value })}
                      placeholder="10,000,000"
                      className="block w-full rounded-2xl border border-gray-300 bg-white py-3 px-4 text-gray-950 focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    {pkgForm.id && (
                      <button
                        type="button"
                        onClick={() => setPkgForm({ id: null, name: '', description: '', price: '', image: '' })}
                        className="rounded-2xl bg-gray-200 text-gray-700 py-3 px-6 text-sm font-bold transition"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="rounded-2xl bg-rose-600 text-white py-3 px-6 text-sm font-bold hover:bg-rose-500 transition shadow-md shadow-rose-100"
                    >
                      {pkgForm.id ? 'Save Changes' : 'Publish Package'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: MANAGE VENDORS */}
          {activeTab === 'vendors' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-xl font-bold text-gray-900">Platform Vendors</h2>
                <span className="bg-rose-50 text-rose-600 font-bold text-xs px-3 py-1.5 rounded-2xl border border-rose-100/50">
                  {vendors.length} Registered Listings
                </span>
              </div>

              {/* Vendor table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100 text-sm">
                  <thead>
                    <tr className="text-left font-semibold text-gray-400">
                      <th className="py-3 px-4">Vendor Details</th>
                      <th className="py-3 px-4">Service</th>
                      <th className="py-3 px-4">Starting Price</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {vendors.map((v) => (
                      <tr key={v.id} className="hover:bg-gray-50/30 transition text-gray-700">
                        <td className="py-4 px-4 font-bold text-gray-900">
                          <div>{v.name}</div>
                          <div className="text-xs text-gray-400 font-normal">{v.email || 'No email'} | {v.phone || 'No phone'}</div>
                        </td>
                        <td className="py-4 px-4"><span className="text-xs font-bold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full">{v.service}</span></td>
                        <td className="py-4 px-4 font-bold text-gray-900">{v.price.toLocaleString()} RWF</td>
                        <td className="py-4 px-4 text-gray-500">{v.location || 'N/A'}</td>
                        <td className="py-4 px-4 text-center space-x-2">
                          <button
                            onClick={() => setVendorForm(v)}
                            className="text-xs text-rose-600 font-bold hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleVendorDelete(v.id)}
                            className="text-xs text-red-500 font-bold hover:underline"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Vendor form */}
              <div className="bg-gray-50/50 border border-gray-100 rounded-3xl p-6">
                <h3 className="font-bold text-gray-900 mb-4">{vendorForm.id ? 'Edit Vendor Info' : 'Register New Vendor Account'}</h3>
                <form onSubmit={handleVendorSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Vendor/Business Name</label>
                      <input
                        type="text"
                        value={vendorForm.name}
                        onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                        placeholder="e.g. Kigali Convention Center"
                        className="block w-full rounded-2xl border border-gray-300 bg-white py-3 px-4 text-gray-950 focus:border-rose-500 focus:outline-none animate-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Service Type Category</label>
                      <select
                        value={vendorForm.service}
                        onChange={(e) => setVendorForm({ ...vendorForm, service: e.target.value })}
                        className="block w-full rounded-2xl border border-gray-300 bg-white py-3 px-4 text-gray-950 focus:border-rose-500 focus:outline-none"
                      >
                        <option value="Venue">Venue / Halls</option>
                        <option value="Catering">Catering & Cakes</option>
                        <option value="Decoration">Florist & Decors</option>
                        <option value="Photography">Photography & Videography</option>
                        <option value="Transport">Luxury Car Rental</option>
                        <option value="Entertainment">DJ & Sound Systems</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Starting Quote (RWF)</label>
                      <input
                        type="number"
                        value={vendorForm.price}
                        onChange={(e) => setVendorForm({ ...vendorForm, price: e.target.value })}
                        placeholder="1,500,000"
                        className="block w-full rounded-2xl border border-gray-300 bg-white py-3 px-4 text-gray-950 focus:border-rose-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Physical Location</label>
                      <input
                        type="text"
                        value={vendorForm.location}
                        onChange={(e) => setVendorForm({ ...vendorForm, location: e.target.value })}
                        placeholder="e.g. Gasabo, Kigali"
                        className="block w-full rounded-2xl border border-gray-300 bg-white py-3 px-4 text-gray-950 focus:border-rose-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Contact Phone</label>
                      <input
                        type="text"
                        value={vendorForm.phone}
                        onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                        placeholder="+250 788..."
                        className="block w-full rounded-2xl border border-gray-300 bg-white py-3 px-4 text-gray-950 focus:border-rose-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Contact Email</label>
                      <input
                        type="email"
                        value={vendorForm.email}
                        onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                        placeholder="info@business.com"
                        className="block w-full rounded-2xl border border-gray-300 bg-white py-3 px-4 text-gray-950 focus:border-rose-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    {vendorForm.id && (
                      <button
                        type="button"
                        onClick={() => setVendorForm({ id: null, name: '', service: 'Venue', price: '', location: '', phone: '', email: '' })}
                        className="rounded-2xl bg-gray-200 text-gray-700 py-3 px-6 text-sm font-bold transition"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="rounded-2xl bg-rose-600 text-white py-3 px-6 text-sm font-bold hover:bg-rose-500 transition shadow-md shadow-rose-100"
                    >
                      {vendorForm.id ? 'Save Changes' : 'List Vendor Business'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: VERIFY PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-4">Manage Platform Payments</h2>
              {payments.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No payments recorded on the platform yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100 text-sm">
                    <thead>
                      <tr className="text-left font-semibold text-gray-400 bg-gray-50/50">
                        <th className="py-3 px-4">Client</th>
                        <th className="py-3 px-4">Package</th>
                        <th className="py-3 px-4">Method</th>
                        <th className="py-3 px-4">Transaction ID</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 font-medium">
                      {payments.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50/30 transition text-gray-700">
                          <td className="py-4 px-4">
                            <div className="font-bold text-gray-900">{p.booking?.user?.name}</div>
                            <div className="text-xs text-gray-400">{p.booking?.user?.email}</div>
                          </td>
                          <td className="py-4 px-4 text-xs font-bold text-gray-600">
                            {p.booking?.package?.name || 'Custom Plan'}
                          </td>
                          <td className="py-4 px-4 text-xs font-bold text-gray-500">{p.method}</td>
                          <td className="py-4 px-4 font-mono text-xs text-gray-900">
                            {p.transactionId}
                          </td>
                          <td className="py-4 px-4 font-extrabold text-gray-900">{p.amount.toLocaleString()} RWF</td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              p.status === 'PAID' 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : p.status === 'FAILED'
                                ? 'bg-red-50 text-red-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center space-y-2">
                            {p.slipImage && (
                              <a
                                href={p.slipImage}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-3 py-1.5 rounded-full transition mr-2"
                              >
                                View BK Slip
                              </a>
                            )}
                            {p.status === 'PENDING' && (
                              <div className="inline-flex gap-2">
                                <button
                                  onClick={() => handleVerifyPayment(p.id)}
                                  className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-full transition"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectPayment(p.id)}
                                  className="text-xs bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-1.5 rounded-full transition"
                                >
                                  Decline
                                </button>
                              </div>
                            )}
                            {p.status === 'PAID' && (
                              <span className="text-xs text-emerald-600 font-bold">Verified & Approved</span>
                            )}
                            {p.status === 'FAILED' && (
                              <span className="text-xs text-red-500 font-bold">Rejected</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: CONTACT INQUIRIES */}
          {activeTab === 'inquiries' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Contact Inquiries</h2>
                  <p className="text-gray-500 text-xs mt-1">Review contact messages submitted by potential clients from the landing page.</p>
                </div>
                <span className="bg-rose-50 text-rose-600 font-bold text-xs px-3 py-1.5 rounded-2xl border border-rose-100/50">
                  {contactMessages.length} Messages
                </span>
              </div>

              {contactMessages.length === 0 ? (
                <div className="text-center py-20 text-gray-400 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
                  <Mail className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm font-semibold">No inquiries received yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {contactMessages.map((msg) => (
                    <div key={msg.id} className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm space-y-4 hover:border-rose-100 transition">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-gray-50">
                        <div>
                          <h4 className="font-extrabold text-gray-900 text-base">{msg.name}</h4>
                          <span className="text-xs font-semibold text-rose-600">{msg.email}</span>
                        </div>
                        <span className="text-xs text-gray-400 font-semibold">
                          {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs bg-rose-50 text-rose-600 font-bold px-2.5 py-0.5 rounded-full border border-rose-100/30">
                            Subject: {msg.subject}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {msg.message}
                        </p>
                      </div>

                      <div className="flex justify-end pt-2">
                        <a
                          href={`mailto:${msg.email}?subject=RE: ${encodeURIComponent(msg.subject)}`}
                          className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 text-xs font-bold transition shadow-sm"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          <span>Reply via Email</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

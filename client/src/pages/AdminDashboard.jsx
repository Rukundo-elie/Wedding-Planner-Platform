import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TrendingUp, Package, Briefcase, Plus, 
  Trash2, Award, Users, AlertCircle, Mail, CreditCard, Landmark 
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [reports, setReports] = useState(null);
  const [packages, setPackages] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [payments, setPayments] = useState([]);
  const [planners, setPlanners] = useState([]);
  
  // Package form state
  const [pkgForm, setPkgForm] = useState({ id: null, name: '', description: '', price: '', image: '' });
  
  // Vendor form state
  const [vendorForm, setVendorForm] = useState({ id: null, name: '', service: 'Venue', price: '', location: '', phone: '', email: '' });

  // Planner form state
  const [plannerForm, setPlannerForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [plannerSubmitting, setPlannerSubmitting] = useState(false);

  // Bank settings state
  const [bankSettings, setBankSettings] = useState({
    bankName: 'Bank of Kigali (BK)',
    accountName: 'Wedding Planner Platform Ltd',
    accountNumber: '00095-07712345-88',
    instructions: '',
  });
  const [savingBank, setSavingBank] = useState(false);

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

      const [reportsData, pkgsData, vendorsData, contactData, paymentsData, plannersData, bankData] = await Promise.all([
        fetchResource('/reports'),
        fetchResource('/packages'),
        fetchResource('/vendors?all=true'),
        fetchResource('/contact'),
        fetchResource('/payments'),
        fetchResource('/admin/planners'),
        fetchResource('/admin/bank-settings'),
      ]);

      if (reportsData) setReports(reportsData);
      if (pkgsData) setPackages(pkgsData);
      if (vendorsData) setVendors(vendorsData);
      if (contactData) setContactMessages(contactData);
      if (paymentsData) setPayments(paymentsData);
      if (plannersData) setPlanners(plannersData);
      if (bankData) setBankSettings(bankData);
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

  // Manage Vendors CRUD & Approvals
  const handleVendorSubmit = async (e) => {
    e.preventDefault();
    if (!vendorForm.name || !vendorForm.service || !vendorForm.price) return;

    try {
      if (vendorForm.id) {
        // Update
        const res = await axios.put(`/vendors/${vendorForm.id}`, vendorForm);
        setVendors(vendors.map(v => v.id === vendorForm.id ? res.data.vendor : v));
        showNotification('success', 'Vendor updated successfully.');
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

  const handleApproveVendor = async (vendorId) => {
    try {
      const res = await axios.patch(`/vendors/${vendorId}/approve`);
      showNotification('success', res.data.message || 'Vendor approved and published.');
      fetchAdminData();
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Approval failed.');
    }
  };

  const handleRejectVendor = async (vendorId) => {
    if (!window.confirm('Are you sure you want to reject this vendor?')) return;
    try {
      const res = await axios.patch(`/vendors/${vendorId}/reject`);
      showNotification('success', res.data.message || 'Vendor rejected.');
      fetchAdminData();
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Rejection failed.');
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

  const handlePlannerSubmit = async (e) => {
    e.preventDefault();
    if (!plannerForm.name || !plannerForm.email || !plannerForm.password) return;
    try {
      setPlannerSubmitting(true);
      const res = await axios.post('/admin/planners', plannerForm);
      showNotification('success', res.data.message || 'Certified planner created.');
      setPlannerForm({ name: '', email: '', phone: '', password: '' });
      fetchAdminData();
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to provision planner.');
    } finally {
      setPlannerSubmitting(false);
    }
  };

  const handlePlannerDelete = async (plannerId) => {
    if (!window.confirm('Are you sure you want to remove this Certified Planner account?')) return;
    try {
      const res = await axios.delete(`/admin/planners/${plannerId}`);
      showNotification('success', res.data.message || 'Planner removed.');
      fetchAdminData();
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to remove planner.');
    }
  };

  const handleBankSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      setSavingBank(true);
      const res = await axios.put('/admin/bank-settings', bankSettings);
      showNotification('success', res.data.message || 'Platform bank account updated successfully!');
      if (res.data.settings) setBankSettings(res.data.settings);
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to update bank details.');
    } finally {
      setSavingBank(false);
    }
  };

  const pendingVendors = vendors.filter((v) => !v.isApproved || v.status === 'PENDING');
  const pendingPayments = payments.filter((p) => p.status === 'PENDING');
  const unreadInquiries = contactMessages.filter((m) => !m.isRead);

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
        <p className="text-gray-500 text-sm">Monitor platform metrics, manage certified planners, packages, and vendor listings.</p>
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
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition ${
              activeTab === 'packages' ? 'bg-rose-50 text-rose-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5" />
              <span>Manage Packages</span>
            </div>
            <span className="text-xs bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-full">
              {packages.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('vendors')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition ${
              activeTab === 'vendors' ? 'bg-rose-50 text-rose-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Briefcase className="h-5 w-5" />
              <span>Manage Vendors</span>
            </div>
            {pendingVendors.length > 0 ? (
              <span className="text-[10px] bg-amber-500 text-white font-extrabold px-2 py-0.5 rounded-full animate-pulse">
                {pendingVendors.length} New
              </span>
            ) : (
              <span className="text-xs bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-full">
                {vendors.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition ${
              activeTab === 'payments' ? 'bg-rose-50 text-rose-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5" />
              <span>Verify Payments</span>
            </div>
            {pendingPayments.length > 0 ? (
              <span className="text-[10px] bg-rose-600 text-white font-extrabold px-2 py-0.5 rounded-full animate-pulse">
                {pendingPayments.length} New
              </span>
            ) : (
              <span className="text-xs bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-full">
                {payments.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('bank')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition ${
              activeTab === 'bank' ? 'bg-rose-50 text-rose-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Landmark className="h-5 w-5" />
              <span>Bank Account Config</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('planners')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition ${
              activeTab === 'planners' ? 'bg-rose-50 text-rose-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5" />
              <span>Planners & Staff</span>
            </div>
            <span className="text-xs bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full border border-blue-100">
              {planners.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('inquiries')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition ${
              activeTab === 'inquiries' ? 'bg-rose-50 text-rose-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5" />
              <span>Contact Inquiries</span>
            </div>
            {unreadInquiries.length > 0 ? (
              <span className="text-[10px] bg-blue-600 text-white font-extrabold px-2 py-0.5 rounded-full animate-pulse">
                {unreadInquiries.length} New
              </span>
            ) : (
              <span className="text-xs bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-full">
                {contactMessages.length}
              </span>
            )}
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
                  <div className="text-3xl font-extrabold text-gray-900">{(reports.totalRevenue || 0).toLocaleString()} RWF</div>
                </div>
                <div className="bg-rose-50/20 border border-rose-100 p-6 rounded-2xl">
                  <div className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">Total Bookings</div>
                  <div className="text-3xl font-extrabold text-gray-900">{reports.totalBookings || 0} Weddings</div>
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

          {/* TAB 3: MANAGE VENDORS & APPROVALS */}
          {activeTab === 'vendors' && (() => {
            const pendingVendors = vendors.filter((v) => !v.isApproved || v.status === 'PENDING');
            const approvedVendors = vendors.filter((v) => v.isApproved && v.status !== 'PENDING');

            return (
              <div className="space-y-10">
                {/* 1. Pending Approvals Queue */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Pending Vendor Registrations</h2>
                      <p className="text-xs text-gray-500">Review and approve new vendor business applications before publishing.</p>
                    </div>
                    <span className="bg-amber-50 text-amber-700 font-extrabold text-xs px-3 py-1.5 rounded-full border border-amber-200">
                      {pendingVendors.length} Awaiting Approval
                    </span>
                  </div>

                  {pendingVendors.length === 0 ? (
                    <div className="bg-gray-50/50 rounded-2xl p-6 text-center text-xs text-gray-500 border border-dashed border-gray-200">
                      ✅ All vendor applications have been reviewed. No pending registrations.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-100 text-sm">
                        <thead>
                          <tr className="text-left font-semibold text-gray-400 bg-amber-50/30">
                            <th className="py-3 px-4">Business Details</th>
                            <th className="py-3 px-4">Category</th>
                            <th className="py-3 px-4">Starting Price</th>
                            <th className="py-3 px-4">Location</th>
                            <th className="py-3 px-4 text-center">Approval Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 font-medium">
                          {pendingVendors.map((v) => (
                            <tr key={v.id} className="hover:bg-amber-50/20 transition text-gray-700">
                              <td className="py-4 px-4 font-bold text-gray-900">
                                <div>{v.name}</div>
                                <div className="text-xs text-gray-400 font-normal">{v.email || 'No email'} | {v.phone || 'No phone'}</div>
                                {v.description && <div className="text-[11px] text-gray-500 italic mt-0.5 max-w-xs truncate">{v.description}</div>}
                              </td>
                              <td className="py-4 px-4">
                                <span className="text-xs font-bold bg-rose-50 text-rose-600 px-2.5 py-0.5 rounded-full">
                                  {v.service}
                                </span>
                              </td>
                              <td className="py-4 px-4 font-bold text-gray-900">{v.price.toLocaleString()} RWF</td>
                              <td className="py-4 px-4 text-gray-500 text-xs">{v.location || 'Rwanda'}</td>
                              <td className="py-4 px-4 text-center space-x-2">
                                <button
                                  type="button"
                                  onClick={() => handleApproveVendor(v.id)}
                                  className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-1.5 rounded-full transition shadow-sm"
                                >
                                  Approve & List
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRejectVendor(v.id)}
                                  className="text-xs bg-red-50 hover:bg-red-100 text-red-600 font-bold px-3 py-1.5 rounded-full transition"
                                >
                                  Reject
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* 2. Active Approved Listings */}
                <div className="space-y-4 pt-6 border-t">
                  <div className="flex justify-between items-center border-b pb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Active Directory Listings</h2>
                      <p className="text-xs text-gray-500">Live vendors currently visible to wedding clients in public categories.</p>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 font-bold text-xs px-3 py-1.5 rounded-2xl border border-emerald-100/50">
                      {approvedVendors.length} Live on Platform
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100 text-sm">
                      <thead>
                        <tr className="text-left font-semibold text-gray-400 bg-gray-50/50">
                          <th className="py-3 px-4">Vendor Details</th>
                          <th className="py-3 px-4">Service Category</th>
                          <th className="py-3 px-4">Starting Price</th>
                          <th className="py-3 px-4">Location</th>
                          <th className="py-3 px-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {approvedVendors.map((v) => (
                          <tr key={v.id} className="hover:bg-gray-50/30 transition text-gray-700">
                            <td className="py-4 px-4 font-bold text-gray-900">
                              <div>{v.name}</div>
                              <div className="text-xs text-gray-400 font-normal">{v.email || 'No email'} | {v.phone || 'No phone'}</div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-xs font-bold bg-rose-50 text-rose-600 px-2.5 py-0.5 rounded-full">
                                {v.service}
                              </span>
                            </td>
                            <td className="py-4 px-4 font-bold text-gray-900">{v.price.toLocaleString()} RWF</td>
                            <td className="py-4 px-4 text-gray-500 text-xs">{v.location || 'N/A'}</td>
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
                </div>

                {/* 3. Direct Add / Edit Vendor Form */}
                <div className="bg-gray-50/50 border border-gray-100 rounded-3xl p-6 pt-4">
                  <h3 className="font-bold text-gray-900 mb-4">{vendorForm.id ? 'Edit Vendor Info' : 'Directly Register / Add New Vendor Account'}</h3>
                  <form onSubmit={handleVendorSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Vendor/Business Name</label>
                        <input
                          type="text"
                          required
                          value={vendorForm.name}
                          onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                          placeholder="e.g. Kigali Convention Center"
                          className="block w-full rounded-2xl border border-gray-300 bg-white py-3 px-4 text-gray-950 focus:border-rose-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Service Type Category</label>
                        <select
                          value={vendorForm.service}
                          onChange={(e) => setVendorForm({ ...vendorForm, service: e.target.value })}
                          className="block w-full rounded-2xl border border-gray-300 bg-white py-3 px-4 text-gray-950 focus:border-rose-500 focus:outline-none font-medium"
                        >
                          <option value="Venue">Venue / Halls</option>
                          <option value="Caterer">Catering & Food</option>
                          <option value="Decorator">Decor & Florals</option>
                          <option value="Photographer">Photography & Film</option>
                          <option value="DJ">DJ & Sound Systems</option>
                          <option value="Transport">Transport & Luxury Cars</option>
                          <option value="Makeup Artist">Bridal Makeup & Hair</option>
                          <option value="Cake & Pastry">Wedding Cakes</option>
                          <option value="Entertainment">Entertainment</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Starting Quote (RWF)</label>
                        <input
                          type="number"
                          required
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
                    <div className="flex gap-2 justify-end pt-2">
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
                        {vendorForm.id ? 'Save Changes' : 'Publish Vendor Listing'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            );
          })()}

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

          {/* TAB 5: BANK ACCOUNT CONFIGURATION */}
          {activeTab === 'bank' && (
            <div className="space-y-8">
              <div className="border-b pb-4">
                <h2 className="text-xl font-bold text-gray-900">Platform Bank Deposit Configuration</h2>
                <p className="text-xs text-gray-500 mt-1">Configure the official bank details shown to clients when paying via bank slip deposit.</p>
              </div>

              <div className="bg-rose-50/30 border border-rose-100/60 rounded-3xl p-6 sm:p-8">
                <form onSubmit={handleBankSettingsSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        required
                        value={bankSettings.bankName}
                        onChange={(e) => setBankSettings({ ...bankSettings, bankName: e.target.value })}
                        placeholder="e.g. Bank of Kigali (BK), Equity Bank, I&M Bank"
                        className="block w-full rounded-2xl border border-gray-300 bg-white py-3.5 px-4 text-gray-950 focus:border-rose-500 focus:outline-none sm:text-sm shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
                        Account Holder / Business Name
                      </label>
                      <input
                        type="text"
                        required
                        value={bankSettings.accountName}
                        onChange={(e) => setBankSettings({ ...bankSettings, accountName: e.target.value })}
                        placeholder="e.g. Wedding Planner Platform Ltd"
                        className="block w-full rounded-2xl border border-gray-300 bg-white py-3.5 px-4 text-gray-950 focus:border-rose-500 focus:outline-none sm:text-sm shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
                        Bank Account Number / IBAN
                      </label>
                      <input
                        type="text"
                        required
                        value={bankSettings.accountNumber}
                        onChange={(e) => setBankSettings({ ...bankSettings, accountNumber: e.target.value })}
                        placeholder="e.g. 00095-07712345-88"
                        className="block w-full rounded-2xl border border-gray-300 bg-white py-3.5 px-4 text-gray-950 focus:border-rose-500 focus:outline-none sm:text-sm font-mono shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-2">
                        Deposit Instructions for Clients
                      </label>
                      <input
                        type="text"
                        value={bankSettings.instructions || ''}
                        onChange={(e) => setBankSettings({ ...bankSettings, instructions: e.target.value })}
                        placeholder="e.g. Deposit at any branch or mobile app and upload clear receipt slip."
                        className="block w-full rounded-2xl border border-gray-300 bg-white py-3.5 px-4 text-gray-950 focus:border-rose-500 focus:outline-none sm:text-sm shadow-sm"
                      />
                    </div>
                  </div>

                  {/* Preview Card */}
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-5 space-y-2">
                    <div className="text-[11px] font-extrabold uppercase text-gray-400">Live Client Preview</div>
                    <div className="text-sm font-semibold text-gray-800">
                      <strong>Bank:</strong> {bankSettings.bankName}
                    </div>
                    <div className="text-sm font-semibold text-gray-800">
                      <strong>Account Name:</strong> {bankSettings.accountName}
                    </div>
                    <div className="text-sm font-semibold text-gray-800 font-mono">
                      <strong>Account Number:</strong> {bankSettings.accountNumber}
                    </div>
                    {bankSettings.instructions && (
                      <div className="text-xs text-gray-500 italic mt-1">
                        Note: {bankSettings.instructions}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={savingBank}
                      className="rounded-2xl bg-rose-600 hover:bg-rose-500 text-white py-3.5 px-8 text-sm font-bold shadow-md shadow-rose-100 transition disabled:opacity-60"
                    >
                      {savingBank ? 'Saving Changes...' : 'Save Bank Account Details'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 6: PLANNERS & STAFF MANAGEMENT */}
          {activeTab === 'planners' && (
            <div className="space-y-10">
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Certified Planners & Staff</h2>
                    <p className="text-xs text-gray-500">Authorized coordinators who manage client timelines, budgets, and wedding tasks.</p>
                  </div>
                  <span className="bg-blue-50 text-blue-700 font-extrabold text-xs px-3 py-1.5 rounded-full border border-blue-200">
                    {planners.length} Active Staff
                  </span>
                </div>

                {planners.length === 0 ? (
                  <div className="bg-gray-50/50 rounded-2xl p-8 text-center text-xs text-gray-500 border border-dashed border-gray-200">
                    No planners registered yet. Use the form below to provision a planner.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100 text-sm">
                      <thead>
                        <tr className="text-left font-semibold text-gray-400 bg-blue-50/30">
                          <th className="py-3 px-4">Planner Details</th>
                          <th className="py-3 px-4">Contact Info</th>
                          <th className="py-3 px-4">Active Tasks</th>
                          <th className="py-3 px-4">Date Provisioned</th>
                          <th className="py-3 px-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 font-medium">
                        {planners.map((p) => (
                          <tr key={p.id} className="hover:bg-blue-50/20 transition text-gray-700">
                            <td className="py-4 px-4 font-bold text-gray-900">
                              <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                <span>{p.name}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-xs">
                              <div className="font-semibold text-gray-900">{p.email}</div>
                              <div className="text-gray-400">{p.phone || 'No phone'}</div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-xs bg-gray-100 text-gray-700 font-bold px-2.5 py-0.5 rounded-full">
                                {p._count?.plannerTasks || 0} tasks
                              </span>
                            </td>
                            <td className="py-4 px-4 text-xs text-gray-400">
                              {new Date(p.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handlePlannerDelete(p.id)}
                                className="text-xs text-red-500 hover:text-red-700 font-bold hover:underline"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Add New Planner Form */}
              <div className="bg-gray-50/50 border border-gray-100 rounded-3xl p-6 pt-4">
                <h3 className="font-bold text-gray-900 mb-1">Provision New Certified Planner Account</h3>
                <p className="text-xs text-gray-500 mb-4">Create secure planner credentials with planning privileges.</p>

                <form onSubmit={handlePlannerSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Planner Full Name</label>
                      <input
                        type="text"
                        required
                        value={plannerForm.name}
                        onChange={(e) => setPlannerForm({ ...plannerForm, name: e.target.value })}
                        placeholder="e.g. Sarah Uwase"
                        className="block w-full rounded-2xl border border-gray-300 bg-white py-3 px-4 text-gray-950 focus:border-rose-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Official Email Address</label>
                      <input
                        type="email"
                        required
                        value={plannerForm.email}
                        onChange={(e) => setPlannerForm({ ...plannerForm, email: e.target.value })}
                        placeholder="sarah.planner@wedding.com"
                        className="block w-full rounded-2xl border border-gray-300 bg-white py-3 px-4 text-gray-950 focus:border-rose-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Phone / WhatsApp</label>
                      <input
                        type="text"
                        value={plannerForm.phone}
                        onChange={(e) => setPlannerForm({ ...plannerForm, phone: e.target.value })}
                        placeholder="+250 788 123 456"
                        className="block w-full rounded-2xl border border-gray-300 bg-white py-3 px-4 text-gray-950 focus:border-rose-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Initial Password</label>
                      <input
                        type="password"
                        required
                        value={plannerForm.password}
                        onChange={(e) => setPlannerForm({ ...plannerForm, password: e.target.value })}
                        placeholder="••••••••"
                        className="block w-full rounded-2xl border border-gray-300 bg-white py-3 px-4 text-gray-950 focus:border-rose-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={plannerSubmitting}
                      className="rounded-2xl bg-rose-600 text-white py-3 px-6 text-sm font-bold hover:bg-rose-500 transition shadow-md shadow-rose-100 disabled:opacity-60"
                    >
                      {plannerSubmitting ? 'Creating Planner...' : 'Provision Certified Planner'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 6: CONTACT INQUIRIES */}
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

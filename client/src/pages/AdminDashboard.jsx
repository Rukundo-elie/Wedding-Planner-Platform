import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TrendingUp, Package, Briefcase, Plus, 
  Trash2, Award, Users, AlertCircle, Mail 
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [reports, setReports] = useState(null);
  const [packages, setPackages] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  
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
      const [reportsRes, pkgsRes, vendorsRes, contactRes] = await Promise.all([
        axios.get('/reports'),
        axios.get('/packages'),
        axios.get('/vendors'),
        axios.get('/contact')
      ]);
      setReports(reportsRes.data);
      setPackages(pkgsRes.data);
      setVendors(vendorsRes.data);
      setContactMessages(contactRes.data);
    } catch (err) {
      console.error(err);
      showNotification('error', 'Failed to retrieve administrator analytics.');
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
                <div className="bg-rose-50/30 p-6 rounded-2xl border border-rose-100/50">
                  <div className="text-xs text-rose-500 font-bold uppercase tracking-wider mb-1">Total Platform Revenue</div>
                  <div className="text-3xl font-extrabold text-gray-900">{reports.totalRevenue.toLocaleString()} RWF</div>
                </div>

                <div className="bg-rose-50/30 p-6 rounded-2xl border border-rose-100/50">
                  <div className="text-xs text-rose-500 font-bold uppercase tracking-wider mb-1">Total Wedding Bookings</div>
                  <div className="text-3xl font-extrabold text-gray-900">{reports.totalBookings} Bookings</div>
                </div>
              </div>

              {/* Status and User details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-5 rounded-2xl">
                  <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3">Bookings By Status</h3>
                  <div className="space-y-2">
                    {reports.bookingsByStatus.map((statusObj, idx) => (
                      <div key={idx} className="flex justify-between text-sm font-semibold">
                        <span className="text-gray-500">{statusObj.status}</span>
                        <span className="text-gray-950">{statusObj._count.id}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-5 rounded-2xl">
                  <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3">Users By Role</h3>
                  <div className="space-y-2">
                    {reports.usersByRole.map((roleObj, idx) => (
                      <div key={idx} className="flex justify-between text-sm font-semibold">
                        <span className="text-gray-500">{roleObj.role}</span>
                        <span className="text-gray-950">{roleObj._count.id}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Bookings */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Recent Orders</h3>
                <div className="border border-gray-100 rounded-2xl divide-y divide-gray-100 overflow-hidden">
                  {reports.recentBookings.map((b) => (
                    <div key={b.id} className="p-4 text-sm flex justify-between items-center hover:bg-gray-50/50">
                      <div>
                        <div className="font-bold text-gray-950">{b.user.name}</div>
                        <div className="text-xs text-gray-400 font-semibold">{b.package ? b.package.name : 'Custom Plan'}</div>
                      </div>
                      <span className="font-extrabold text-gray-800">{b.budget.toLocaleString()} RWF</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANAGE PACKAGES */}
          {activeTab === 'packages' && (
            <div className="space-y-8">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-4">
                {pkgForm.id ? 'Edit Package Inclusions' : 'Create New Wedding Package'}
              </h2>

              {/* Form */}
              <form onSubmit={handlePkgSubmit} className="space-y-4 max-w-lg bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Package Name</label>
                    <input
                      type="text"
                      required
                      value={pkgForm.name}
                      onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })}
                      className="block w-full rounded-xl border border-gray-300 bg-white py-2 px-3 text-sm focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Price (RWF)</label>
                    <input
                      type="number"
                      required
                      value={pkgForm.price}
                      onChange={(e) => setPkgForm({ ...pkgForm, price: e.target.value })}
                      className="block w-full rounded-xl border border-gray-300 bg-white py-2 px-3 text-sm focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Image URL</label>
                  <input
                    type="text"
                    value={pkgForm.image}
                    onChange={(e) => setPkgForm({ ...pkgForm, image: e.target.value })}
                    className="block w-full rounded-xl border border-gray-300 bg-white py-2 px-3 text-sm focus:border-rose-500 focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Description Inclusions</label>
                  <textarea
                    required
                    value={pkgForm.description}
                    onChange={(e) => setPkgForm({ ...pkgForm, description: e.target.value })}
                    rows={3}
                    className="block w-full rounded-xl border border-gray-300 bg-white py-2 px-3 text-sm focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  {pkgForm.id && (
                    <button
                      type="button"
                      onClick={() => setPkgForm({ id: null, name: '', description: '', price: '', image: '' })}
                      className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white hover:bg-rose-500 transition"
                  >
                    {pkgForm.id ? 'Save Changes' : 'Create Package'}
                  </button>
                </div>
              </form>

              {/* Package list */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Packages List</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {packages.map((pkg) => (
                    <div key={pkg.id} className="border border-gray-100 rounded-2xl p-5 flex flex-col justify-between hover:shadow-sm">
                      <div>
                        <h4 className="font-extrabold text-gray-900">{pkg.name}</h4>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{pkg.description}</p>
                        <span className="inline-block mt-3 text-sm font-extrabold text-rose-600">{pkg.price.toLocaleString()} RWF</span>
                      </div>
                      <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-gray-50">
                        <button
                          onClick={() => setPkgForm({ id: pkg.id, name: pkg.name, description: pkg.description, price: pkg.price, image: pkg.image || '' })}
                          className="text-xs text-gray-600 hover:text-rose-600 font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handlePkgDelete(pkg.id)}
                          className="text-xs text-red-600 font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MANAGE VENDORS */}
          {activeTab === 'vendors' && (
            <div className="space-y-8">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-4">
                {vendorForm.id ? 'Edit Vendor Details' : 'Add New Vendor'}
              </h2>

              {/* Form */}
              <form onSubmit={handleVendorSubmit} className="space-y-4 max-w-lg bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Vendor Name</label>
                    <input
                      type="text"
                      required
                      value={vendorForm.name}
                      onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                      className="block w-full rounded-xl border border-gray-300 bg-white py-2 px-3 text-sm focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Service category</label>
                    <select
                      value={vendorForm.service}
                      onChange={(e) => setVendorForm({ ...vendorForm, service: e.target.value })}
                      className="block w-full rounded-xl border border-gray-300 bg-white py-2 px-3 text-sm focus:border-rose-500 focus:outline-none"
                    >
                      <option value="Venue">Venue</option>
                      <option value="Decorator">Decorator</option>
                      <option value="Caterer">Caterer</option>
                      <option value="Photographer">Photographer</option>
                      <option value="DJ">DJ</option>
                      <option value="Transport">Transport</option>
                      <option value="Makeup Artist">Makeup Artist</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Starting Price (RWF)</label>
                    <input
                      type="number"
                      required
                      value={vendorForm.price}
                      onChange={(e) => setVendorForm({ ...vendorForm, price: e.target.value })}
                      className="block w-full rounded-xl border border-gray-300 bg-white py-2 px-3 text-sm focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Location</label>
                    <input
                      type="text"
                      value={vendorForm.location}
                      onChange={(e) => setVendorForm({ ...vendorForm, location: e.target.value })}
                      className="block w-full rounded-xl border border-gray-300 bg-white py-2 px-3 text-sm focus:border-rose-500 focus:outline-none"
                      placeholder="Kigali City"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={vendorForm.phone}
                      onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                      className="block w-full rounded-xl border border-gray-300 bg-white py-2 px-3 text-sm focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={vendorForm.email}
                      onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                      className="block w-full rounded-xl border border-gray-300 bg-white py-2 px-3 text-sm focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  {vendorForm.id && (
                    <button
                      type="button"
                      onClick={() => setVendorForm({ id: null, name: '', service: 'Venue', price: '', location: '', phone: '', email: '' })}
                      className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white hover:bg-rose-505 transition"
                  >
                    {vendorForm.id ? 'Save Changes' : 'Add Vendor'}
                  </button>
                </div>
              </form>

              {/* Vendor directory list */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Vendor Marketplace List</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {vendors.map((vendor) => (
                    <div key={vendor.id} className="border border-gray-100 rounded-2xl p-5 hover:shadow-sm">
                      <div className="flex justify-between items-start">
                        <h4 className="font-extrabold text-gray-900">{vendor.name}</h4>
                        <span className="text-[10px] bg-rose-50 text-rose-600 font-bold px-2 py-0.5 rounded-full">{vendor.service}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{vendor.location || 'Kigali, Rwanda'}</p>
                      
                      <div className="flex justify-between items-end mt-4 pt-3 border-t border-gray-50">
                        <span className="text-xs font-extrabold text-gray-900">{vendor.price.toLocaleString()} RWF</span>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => setVendorForm({ id: vendor.id, name: vendor.name, service: vendor.service, price: vendor.price, location: vendor.location || '', phone: vendor.phone || '', email: vendor.email || '' })}
                            className="text-xs text-gray-600 hover:text-rose-600 font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleVendorDelete(vendor.id)}
                            className="text-xs text-red-600 font-semibold"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CONTACT INQUIRIES */}
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
                          <span className="text-[10px] bg-rose-50 text-rose-600 font-bold px-2 py-0.5 rounded-full border border-rose-100/30">
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
                          className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 hover:bg-rose-505 text-white px-4 py-2 text-xs font-bold transition shadow-sm"
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

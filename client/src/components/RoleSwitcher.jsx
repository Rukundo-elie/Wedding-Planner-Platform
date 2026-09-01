import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ShieldCheck, UserCheck, Building2, Heart, 
  ChevronDown, Lock, Mail, AlertCircle, X, KeyRound 
} from 'lucide-react';

const ROLES = [
  { id: 'ADMIN', label: 'Admin', path: '/admin', icon: ShieldCheck, color: 'text-amber-600 bg-amber-50', defaultEmail: 'admin@wedding.com' },
  { id: 'PLANNER', label: 'Planner', path: '/planner', icon: UserCheck, color: 'text-blue-600 bg-blue-50', defaultEmail: 'planner@wedding.com' },
  { id: 'VENDOR', label: 'Vendor', path: '/vendor', icon: Building2, color: 'text-purple-600 bg-purple-50', defaultEmail: '' },
  { id: 'CLIENT', label: 'Client', path: '/client', icon: Heart, color: 'text-rose-600 bg-rose-50', defaultEmail: '' },
];

const RoleSwitcher = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Login Modal State
  const [selectedTargetRole, setSelectedTargetRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [authenticating, setAuthenticating] = useState(false);

  const currentRoleObj = ROLES.find(r => r.id === user?.role) || ROLES[3];

  const handleRoleSelect = (roleObj) => {
    setDropdownOpen(false);
    setError('');
    
    // If already logged in with this exact role, just navigate
    if (user?.role === roleObj.id) {
      navigate(roleObj.path);
      return;
    }

    // Open login modal requiring valid credentials
    setSelectedTargetRole(roleObj);
    setEmail(roleObj.defaultEmail || '');
    setPassword('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setAuthenticating(true);

    try {
      const loggedUser = await login(email, password);
      
      // Close modal
      setSelectedTargetRole(null);
      setEmail('');
      setPassword('');

      // Redirect to the appropriate dashboard
      switch (loggedUser.role) {
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
      setError(typeof err === 'string' ? err : err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setAuthenticating(false);
    }
  };

  return (
    <>
      <div className="relative inline-block text-left">
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/90 backdrop-blur-sm px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition"
          title="Switch role / account (Requires authentication)"
        >
          <KeyRound className="h-3.5 w-3.5 text-rose-500" />
          <span className="hidden sm:inline text-[11px] text-gray-500 uppercase tracking-wider font-extrabold">Role:</span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${currentRoleObj.color}`}>
            {currentRoleObj.label}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
        </button>

        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
            <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white p-2 shadow-2xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-gray-100 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                🔒 Authenticated Role Switch
              </div>
              <div className="space-y-1 mt-1">
                {ROLES.map((r) => {
                  const Icon = r.icon;
                  const isCurrent = user?.role === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleRoleSelect(r)}
                      className={`flex items-center justify-between w-full px-3 py-2.5 text-xs font-bold rounded-xl transition ${
                        isCurrent
                          ? 'bg-rose-50 text-rose-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-lg ${r.color}`}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <span>{r.label} Account</span>
                      </div>
                      {isCurrent ? (
                        <span className="text-[10px] bg-rose-200/60 text-rose-700 font-extrabold px-1.5 py-0.5 rounded">Active</span>
                      ) : (
                        <Lock className="h-3 w-3 text-gray-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Secure Authentication Modal */}
      {selectedTargetRole && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-slate-900 to-rose-950 p-6 text-white relative">
              <button
                type="button"
                onClick={() => setSelectedTargetRole(null)}
                className="absolute top-5 right-5 text-white/80 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
              <div className="flex items-center gap-2 text-rose-300 text-xs font-bold uppercase tracking-wider mb-1">
                <Lock className="h-3.5 w-3.5" />
                <span>Security Verification</span>
              </div>
              <h3 className="text-xl font-bold">Log in to {selectedTargetRole.label} Account</h3>
              <p className="text-xs text-slate-300 mt-1">Please enter your verified credentials to access this dashboard.</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
              {error && (
                <div className="rounded-2xl bg-red-50 p-3 text-xs text-red-700 flex items-center gap-2 border border-red-100">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Email Address</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@wedding.com"
                    className="block w-full rounded-2xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-gray-950 focus:border-rose-500 focus:outline-none sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Password</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full rounded-2xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-gray-950 focus:border-rose-500 focus:outline-none sm:text-sm"
                  />
                </div>
              </div>

              {selectedTargetRole.defaultEmail && (
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-[11px] text-gray-500">
                  💡 <strong>Default Demo:</strong> <code>{selectedTargetRole.defaultEmail}</code> (Password: <code>{selectedTargetRole.id.toLowerCase()}123</code>)
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTargetRole(null)}
                  className="w-1/3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={authenticating}
                  className="w-2/3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 text-xs shadow-md shadow-rose-100 transition disabled:opacity-60"
                >
                  {authenticating ? 'Verifying...' : `Log in to ${selectedTargetRole.label}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default RoleSwitcher;

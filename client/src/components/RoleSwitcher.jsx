import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ShieldCheck, UserCheck, Building2, Heart, 
  ChevronDown, RefreshCw, Zap 
} from 'lucide-react';

const ROLES = [
  { id: 'ADMIN', label: 'Admin', path: '/admin', icon: ShieldCheck, color: 'text-amber-600 bg-amber-50' },
  { id: 'PLANNER', label: 'Planner', path: '/planner', icon: UserCheck, color: 'text-blue-600 bg-blue-50' },
  { id: 'VENDOR', label: 'Vendor', path: '/vendor', icon: Building2, color: 'text-purple-600 bg-purple-50' },
  { id: 'CLIENT', label: 'Client', path: '/client', icon: Heart, color: 'text-rose-600 bg-rose-50' },
];

const RoleSwitcher = () => {
  const { user, quickSwitch } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const currentRoleObj = ROLES.find(r => r.id === user?.role) || ROLES[3];

  const handleRoleSwitch = async (roleObj) => {
    if (user?.role === roleObj.id) {
      setOpen(false);
      navigate(roleObj.path);
      return;
    }

    try {
      setSwitching(true);
      const updatedUser = await quickSwitch(roleObj.id);
      setOpen(false);
      
      switch (updatedUser.role) {
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
      console.error('Error switching role:', err);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={switching}
        className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/90 backdrop-blur-sm px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition"
        title="1-Click Switch Active Account Role"
      >
        {switching ? (
          <RefreshCw className="h-3.5 w-3.5 animate-spin text-rose-600" />
        ) : (
          <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
        )}
        <span className="hidden sm:inline text-[11px] text-gray-500 uppercase tracking-wider font-extrabold">Role:</span>
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${currentRoleObj.color}`}>
          {currentRoleObj.label}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-2xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-2 border-b border-gray-100 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
              ⚡ Instant Role Switcher
            </div>
            <div className="space-y-1 mt-1">
              {ROLES.map((r) => {
                const Icon = r.icon;
                const isCurrent = user?.role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleRoleSwitch(r)}
                    className={`flex items-center justify-between w-full px-3 py-2 text-xs font-bold rounded-xl transition ${
                      isCurrent
                        ? 'bg-rose-50 text-rose-600'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${r.color}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <span>{r.label} View</span>
                    </div>
                    {isCurrent && (
                      <span className="h-2 w-2 rounded-full bg-rose-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RoleSwitcher;

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, LogOut, LayoutDashboard } from 'lucide-react';
import WeddingRingIcon from './WeddingRingIcon';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  const handleLogout = () => {
    logout();
    setShowLogoutConfirmation(false);
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'ADMIN':
        return '/admin';
      case 'PLANNER':
        return '/planner';
      default:
        return '/client';
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-rose-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-rose-600">
              <WeddingRingIcon className="h-8 w-8" />
              <span>Wedding Planner</span>
            </Link>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
            <Link to="/" className="hover:text-rose-600 transition-colors">Home</Link>
            <Link to="/#packages" className="hover:text-rose-600 transition-colors">Packages</Link>
            <Link to="/#about" className="hover:text-rose-600 transition-colors">About Us</Link>
            <Link to="/#contact" className="hover:text-rose-600 transition-colors">Contact</Link>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to={getDashboardPath()}
                  className="flex items-center gap-1.5 rounded-full bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-100 transition"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                <div className="hidden sm:block text-xs font-semibold text-gray-500">
                  Hi, {user.name.split(' ')[0]} ({user.role})
                </div>
                <button
                  onClick={() => setShowLogoutConfirmation(true)}
                  className="rounded-full p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-gray-700 hover:text-rose-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 transition-all hover:scale-105"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      </nav>

      {showLogoutConfirmation && createPortal(
        <div className="fixed inset-0 z-[9999] flex min-h-screen items-center justify-center bg-gray-900/40 p-4" role="dialog" aria-modal="true" aria-labelledby="logout-title">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <h2 id="logout-title" className="text-xl font-bold text-gray-900">Log out?</h2>
            <p className="mt-2 text-sm text-gray-600">Are you sure you want to log out of your account❓</p>
            <div className="mt-6 flex justify-center gap-3">
              <button onClick={() => setShowLogoutConfirmation(false)} className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">No 👎</button>
              <button onClick={handleLogout} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500">Yes👍</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Navbar;

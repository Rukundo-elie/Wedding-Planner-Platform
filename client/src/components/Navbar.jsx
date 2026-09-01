import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, LayoutDashboard, Menu, X, Bell } from 'lucide-react';
import WeddingRingIcon from './WeddingRingIcon';
import RoleSwitcher from './RoleSwitcher';
import { navigateToSection, goHome } from '../utils/scrollToSection';

const sectionLinks = [
  { label: 'Packages', id: 'packages' },
  { label: 'About Us', id: 'about' },
  { label: 'Contact', id: 'contact' },
];

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState(null);

  useEffect(() => {
    let timer;
    const fetchNotifications = async () => {
      if (!isAuthenticated) return;
      try {
        const res = await axios.get('/notifications/summary');
        setNotifications(res.data);
      } catch (e) {
        // quiet error handling in navbar
      }
    };

    fetchNotifications();
    if (isAuthenticated) {
      timer = setInterval(fetchNotifications, 10000);
    }
    return () => clearInterval(timer);
  }, [isAuthenticated, location.pathname, user?.role]);

  const handleLogout = () => {
    setMobileOpen(false);
    logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'ADMIN':
        return '/admin';
      case 'PLANNER':
        return '/planner';
      case 'VENDOR':
        return '/vendor';
      default:
        return '/client';
    }
  };

  const handleGoHome = () => {
    setMobileOpen(false);
    goHome(navigate, location);
  };

  const handleSectionNav = (sectionId) => {
    setMobileOpen(false);
    navigateToSection(sectionId, { pathname: location.pathname, navigate });
  };

  const navLinkClass = 'hover:text-rose-600 transition-colors';

  return (
    <nav className="sticky top-0 z-50 border-b border-rose-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-rose-600" onClick={(e) => { e.preventDefault(); handleGoHome(); }}>
              <WeddingRingIcon className="h-8 w-8" />
              <span>Wedding Planner</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
            <button type="button" onClick={handleGoHome} className={navLinkClass}>Home</button>
            <Link to="/vendors" className={navLinkClass}>Vendors</Link>
            {sectionLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => handleSectionNav(link.id)}
                className={navLinkClass}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Quick 1-Click Role Switcher */}
            <RoleSwitcher />

            {isAuthenticated ? (
              <div className="flex items-center gap-2.5">
                <Link
                  to={getDashboardPath()}
                  className="relative flex items-center gap-1.5 rounded-full bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-100 transition"
                  onClick={() => setMobileOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                  {notifications && notifications.total > 0 && (
                    <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-extrabold bg-rose-600 text-white rounded-full animate-pulse shadow-sm">
                      {notifications.total}
                    </span>
                  )}
                </Link>
                <div className="hidden lg:block text-xs font-semibold text-gray-500">
                  Hi, {user.name.split(' ')[0]}
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-full p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
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

            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className="md:hidden rounded-lg p-2 text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-rose-100 py-4 space-y-1">
            <button
              type="button"
              onClick={handleGoHome}
              className="block w-full text-left rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-rose-50 hover:text-rose-600"
            >
              Home
            </button>
            <Link
              to="/vendors"
              onClick={() => setMobileOpen(false)}
              className="block w-full text-left rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-rose-50 hover:text-rose-600"
            >
              Vendors
            </Link>
            {sectionLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => handleSectionNav(link.id)}
                className="block w-full text-left rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-rose-50 hover:text-rose-600"
              >
                {link.label}
              </button>
            ))}
            {!isAuthenticated && (
              <div className="border-t border-rose-100 pt-3 mt-3 space-y-1">
                <Link
                  to="/login"
                  className="block rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-rose-50 hover:text-rose-600"
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block rounded-xl px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                  onClick={() => setMobileOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

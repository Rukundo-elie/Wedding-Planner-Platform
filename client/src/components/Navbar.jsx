import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import WeddingRingIcon from './WeddingRingIcon';
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
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to={getDashboardPath()}
                  className="flex items-center gap-1.5 rounded-full bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-100 transition"
                  onClick={() => setMobileOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <div className="hidden sm:block text-xs font-semibold text-gray-500">
                  Hi, {user.name.split(' ')[0]} ({user.role})
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

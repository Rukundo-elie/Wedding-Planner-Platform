import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import WeddingRingIcon from './WeddingRingIcon';
import { navigateToSection } from '../utils/scrollToSection';

const footerLinks = [
  { label: 'Wedding Packages', id: 'packages' },
  { label: 'Vendor Directory', id: 'marketplace' },
  { label: 'About Us', id: 'about' },
  { label: 'Contact Us', id: 'contact' },
];

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSectionNav = (sectionId) => {
    navigateToSection(sectionId, { pathname: location.pathname, navigate });
  };

  return (
    <footer className="bg-gray-950 text-gray-400 py-12 border-t border-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-4">
              <WeddingRingIcon className="h-7 w-7" />
              <span>Wedding Planner & Budget Management Platform</span>
            </div>
            <p className="text-sm max-w-xs leading-relaxed">
              Making your special day seamless, beautiful, and completely stress-free. Plan your wedding packages and budget all in one place.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {footerLinks.map((link) => (
                <li key={link.id}>
                  <button
                    type="button"
                    onClick={() => handleSectionNav(link.id)}
                    className="hover:text-white transition"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Contact Us</h3>
            <ul className="space-y-2 text-sm">
              <li>Email: contact@weddingplanner.rw</li>
              <li>Phone: +250 788 001 001</li>
              <li>Office: KN 4 Rd, Kigali, Rwanda</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-900 text-center text-xs flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} Wedding Planner & Budget Management Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <WeddingRingIcon className="h-3 w-3 fill-rose-500 text-rose-500" /> for couples worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

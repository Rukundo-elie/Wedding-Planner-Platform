import React from 'react';
import { BellRingIcon, Heart } from 'lucide-react';
import WeddingRingIcon from './WeddingRingIcon';

const Footer = () => {
  return (
    <footer className="bg-gray-950 text-gray-400 py-12 border-t border-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-4">
              <WeddingRingIcon className="h-7 w-7" />
              <span>Wedding Planner & Budget Management Platform</span>
            </div>
            <p className="text-sm max-w-xs leading-relaxed">
              Making your special day seamless, beautiful, and completely stress-free. Plan your wedding packages and budget all in one place.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#packages" className="hover:text-white transition">Wedding Packages</a></li>
              <li><a href="#marketplace" className="hover:text-white transition">Vendor Directory</a></li>
              <li><a href="#calculator" className="hover:text-white transition">Budget Calculator</a></li>
            </ul>
          </div>

          {/* Contact */}
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

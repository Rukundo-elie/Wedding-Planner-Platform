import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Heart, Sparkles, ShieldCheck, BadgeDollarSign, Compass, Calendar, ArrowRight, Star, Plus } from 'lucide-react';
import WeddingRingIcon from '../components/WeddingRingIcon';
import { useAuth } from '../contexts/AuthContext';
import { scrollToSection } from '../utils/scrollToSection';
import { getPackageImage } from '../utils/packageImages';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [packages, setPackages] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pkgRes, vendorRes] = await Promise.all([
          axios.get('/packages'),
          axios.get('/vendors'),
        ]);
        setPackages(pkgRes.data);
        setVendors(vendorRes.data.slice(0, 4)); // Show first 4
      } catch (err) {
        console.error('Error fetching landing page data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (location.pathname !== '/') return undefined;

    if (location.hash) {
      const id = location.hash.substring(1);
      const timer = setTimeout(() => scrollToSection(id), loading ? 300 : 100);
      return () => clearTimeout(timer);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    return undefined;
  }, [location.pathname, location.hash, loading]);

  return (
    <div className="bg-rose-50/20 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Text column */}
            <div className="lg:col-span-7 space-y-8">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3.5 py-1.5 text-sm font-semibold text-rose-600">
                <Sparkles className="h-4 w-4" />
                <span>Seamless Wedding Planning & Budgeting</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1]">
                Your Dream Wedding, <br />
                <span className="bg-gradient-to-r from-rose-600 to-amber-500 bg-clip-text text-transparent">
                  Planned Within Budget.
                </span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
                Choose a wedding package or tell us your budget. Our certified planners will handle the rest—from booking premium vendors to managing schedules on your behalf.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/register"
                  className="rounded-full bg-rose-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-rose-200 hover:bg-rose-500 hover:shadow-xl transition-all flex items-center gap-2 hover:scale-[1.03]"
                >
                  <span>Start Planning Free</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => scrollToSection('packages')}
                  className="rounded-full bg-white border border-gray-200 px-8 py-3.5 text-base font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition flex items-center"
                >
                  View Packages
                </button>
              </div>
            </div>

            {/* Visual banner column */}
            <div className="lg:col-span-5 relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white transform hover:rotate-1 transition duration-500">
                <img
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800"
                  alt="Wedding celebration"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Badge Overlay */}
              <div className="absolute -bottom-6 -left-6 bg-white p-5 rounded-2xl shadow-xl border border-rose-50 flex items-center gap-3">
                <div className="rounded-full bg-rose-100 p-2.5 text-rose-600">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-sm">100% Managed</div>
                  <div className="text-xs text-gray-500 font-medium">Stress-free preparation</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white border-y border-rose-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">How It Works</h2>
            <p className="text-gray-500 text-sm">We take the hassle out of wedding vendor scouting and schedule coordinating.</p>
          </div>

          <div className="mx-auto mt-16 max-w-5xl grid grid-cols-1 gap-8 sm:grid-cols-3">
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center p-6 bg-rose-50/30 rounded-2xl border border-rose-100/55">
              <div className="rounded-2xl bg-rose-600 p-4 text-white shadow-lg mb-6">
                <BadgeDollarSign className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Estimate & Allocate</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Enter your total budget in our Budget Calculator. We immediately divide it into venue, caterer, decor, and emergency allocations.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center p-6 bg-rose-50/30 rounded-2xl border border-rose-100/55">
              <div className="rounded-2xl bg-rose-600 p-4 text-white shadow-lg mb-6">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Select Your Package</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Browse our curated, pre-made packages (Silver, Gold, Diamond) with predefined vendor inclusions, or design a custom plan.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center p-6 bg-rose-50/30 rounded-2xl border border-rose-100/55">
              <div className="rounded-2xl bg-rose-600 p-4 text-white shadow-lg mb-6">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Track & Celebrate</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Once paid, track task deadlines on your live timeline. Chat directly with your planner while our experts handle negotiations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="py-24 sm:py-32 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center space-y-4 mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Curated Wedding Packages</h2>
            <p className="text-gray-600 leading-relaxed">
              Unlock professional planning services and complete vendor packages with a single, clear payment.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
            </div>
          ) : (
            <div className="mx-auto grid max-w-md grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
              {packages.map((pkg) => {
                const packageImage = getPackageImage(pkg);

                return (
                <div key={pkg.id} className="flex flex-col justify-between overflow-hidden rounded-3xl bg-white shadow-xl shadow-gray-100 border border-gray-100 transform hover:scale-[1.02] transition duration-300">
                  <div>
                    {packageImage ? (
                      <div className="h-52 w-full overflow-hidden bg-gradient-to-br from-slate-800 via-purple-900 to-rose-900">
                        <img
                          src={packageImage}
                          alt={pkg.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            if (pkg.name.toLowerCase().includes('diamond')) {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800';
                            } else {
                              e.currentTarget.style.display = 'none';
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className="h-52 w-full bg-gradient-to-br from-rose-100 via-rose-50 to-amber-50 flex items-center justify-center border-b border-rose-100/50">
                        <WeddingRingIcon className="h-20 w-20 text-rose-400" />
                      </div>
                    )}
                    <div className="p-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                      <p className="text-sm text-gray-500 mb-6 leading-relaxed min-h-[72px]">{pkg.description}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold tracking-tight text-gray-950">
                          {pkg.price.toLocaleString()}
                        </span>
                        <span className="text-sm font-semibold text-gray-500">RWF</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-8 pt-0">
                    <Link
                      to={isAuthenticated ? `/client?selectPackage=${pkg.id}` : `/login?redirect=${encodeURIComponent(`/client?selectPackage=${pkg.id}`)}`}
                      className="block w-full text-center rounded-full bg-rose-600 py-3 text-sm font-bold text-white shadow hover:bg-rose-500 transition-colors"
                    >
                      Book Package
                    </Link>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Vendor marketplace preview */}
      <section id="marketplace" className="py-20 bg-rose-50/40 border-t border-rose-100 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center space-y-4 mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900">Featured Vendors</h2>
            <p className="text-gray-600 text-sm">We partner only with the most trusted venues, decorators, and caterers in Rwanda.</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {vendors.map((vendor) => (
                <div key={vendor.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
                  <div className="inline-flex rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600 mb-3">
                    {vendor.service}
                  </div>
                  <h4 className="font-bold text-gray-900 text-base mb-1">{vendor.name}</h4>
                  <p className="text-xs text-gray-500 mb-3">{vendor.location || 'Kigali, Rwanda'}</p>
                  <div className="flex justify-between items-center text-sm font-bold pt-2 border-t border-gray-50">
                    <span className="text-gray-500 text-xs font-normal">Pricing starts at</span>
                    <span className="text-gray-950">{vendor.price.toLocaleString()} RWF</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-24 sm:py-32 bg-white scroll-mt-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800"
                  alt="Wedding planners organizing details"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">About IDA Technology Planners</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                At IDA Technology, we believe that planning your wedding should be as joyous and magical as the day itself. Our dedicated team of professional coordinators, designers, and logistics experts are committed to simplifying the entire preparation timeline on your behalf.
              </p>
              <p className="text-gray-500 leading-relaxed text-sm">
                Instead of dealing with dozens of vendors, negotiating contracts, and tracking task completions manually, you can simply select one of our curated packages or declare your target budget. We manage all preparations, leaving you free to focus on celebrating your love.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-rose-50/20 border-t border-rose-100 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center space-y-4 mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Get In Touch</h2>
            <p className="text-gray-600 text-sm">Have questions about our packages or custom budget planning? Send us a message.</p>
          </div>

          <div className="mx-auto max-w-xl bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <form onSubmit={(e) => { e.preventDefault(); alert('Message sent successfully! Our planners will contact you shortly.'); }} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Name</label>
                <input
                  type="text"
                  required
                  className="block w-full rounded-2xl border border-gray-300 bg-white py-3 px-4 text-gray-950 focus:border-rose-500 focus:outline-none"
                  placeholder="Elie Elie"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  className="block w-full rounded-2xl border border-gray-300 bg-white py-3 px-4 text-gray-950 focus:border-rose-500 focus:outline-none"
                  placeholder="elie@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message / Inquiry</label>
                <textarea
                  required
                  rows={4}
                  className="block w-full rounded-2xl border border-gray-300 bg-white py-3 px-4 text-gray-950 focus:border-rose-500 focus:outline-none"
                  placeholder="Tell us about your wedding plans..."
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-2xl bg-rose-600 py-3.5 px-4 text-sm font-bold text-white shadow-lg shadow-rose-200 hover:bg-rose-505 transition"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

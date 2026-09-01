import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Search, MapPin, Phone, Mail, Sparkles, Building2, Utensils, 
  Palette, Camera, Music, Car, Sparkle, Cake, CheckCircle2, 
  ArrowRight, MessageCircle, ExternalLink, X, Heart
} from 'lucide-react';
import WeddingRingIcon from '../components/WeddingRingIcon';

const CATEGORIES = [
  { id: 'All', label: 'All Services', icon: Sparkles },
  { id: 'Venue', label: 'Venues & Halls', icon: Building2 },
  { id: 'Caterer', label: 'Catering & Food', icon: Utensils },
  { id: 'Decorator', label: 'Decor & Florals', icon: Palette },
  { id: 'Photographer', label: 'Photography & Film', icon: Camera },
  { id: 'DJ', label: 'DJ & Sound System', icon: Music },
  { id: 'Transport', label: 'Transport & Cars', icon: Car },
  { id: 'Makeup Artist', label: 'Makeup & Beauty', icon: Sparkle },
  { id: 'Cake & Pastry', label: 'Wedding Cakes', icon: Cake },
];

const categoryDefaultImages = {
  Venue: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800',
  Caterer: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=800',
  Decorator: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&q=80&w=800',
  Photographer: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&q=80&w=800',
  DJ: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=800',
  Transport: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800',
  'Makeup Artist': 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=800',
  'Cake & Pastry': 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&q=80&w=800',
};

const Vendors = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contactModalVendor, setContactModalVendor] = useState(null);

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl && categoryFromUrl !== selectedCategory) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchVendors();
  }, [selectedCategory]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory && selectedCategory !== 'All') {
        params.service = selectedCategory;
      }
      const res = await axios.get('/vendors', { params });
      setVendors(res.data);
    } catch (err) {
      console.error('Error fetching vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    if (categoryId === 'All') {
      setSearchParams({});
    } else {
      setSearchParams({ category: categoryId });
    }
  };

  // Filter vendors in frontend for immediate search & location responsiveness
  const filteredVendors = vendors.filter((v) => {
    const matchesSearch = searchQuery
      ? v.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.service?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesLocation = locationQuery
      ? v.location?.toLowerCase().includes(locationQuery.toLowerCase())
      : true;

    return matchesSearch && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-rose-50/20 py-10 sm:py-16">
      {/* Header Banner */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-100/70 px-4 py-1.5 text-xs font-bold text-rose-700 tracking-wide uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Verified Wedding Marketplace</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
            Find the Best Wedding Vendors in Rwanda
          </h1>
          <p className="text-base text-gray-600 leading-relaxed">
            Explore venues, photographers, decorators, caterers, transport rentals, and DJs verified by our certified planners.
          </p>
        </div>

        {/* Search & Location Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-rose-100/80 shadow-lg shadow-rose-100/40 max-w-4xl mx-auto mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            {/* Keyword Search */}
            <div className="sm:col-span-6 relative">
              <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vendor name, service, or keyword..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:border-rose-500 focus:outline-none transition"
              />
            </div>

            {/* Location Search */}
            <div className="sm:col-span-4 relative">
              <MapPin className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Location (e.g. Kigali, Rubavu)..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:border-rose-500 focus:outline-none transition"
              />
            </div>

            {/* Reset / Action */}
            <div className="sm:col-span-2">
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setLocationQuery(''); }}
                className="w-full py-3 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-sm transition"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                  isSelected
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-200 scale-105'
                    : 'bg-white text-gray-700 hover:bg-rose-50 hover:text-rose-600 border border-gray-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Vendors Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center max-w-xl mx-auto space-y-4 my-8 shadow-sm">
            <div className="h-16 w-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500">
              <Building2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No approved vendors found</h3>
            <p className="text-sm text-gray-500">
              {searchQuery || locationQuery 
                ? 'Try adjusting your search keywords or location filter.' 
                : `We are currently onboarding top-tier providers for "${selectedCategory}".`}
            </p>
            <div className="pt-2">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-full bg-rose-600 text-white px-6 py-2.5 text-sm font-bold hover:bg-rose-500 transition shadow-md shadow-rose-100"
              >
                <span>Register as a Vendor</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVendors.map((vendor) => {
              const imageSrc = vendor.image || categoryDefaultImages[vendor.service] || categoryDefaultImages.Venue;
              return (
                <div
                  key={vendor.id}
                  className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col group"
                >
                  {/* Photo Banner */}
                  <div className="h-52 w-full relative overflow-hidden bg-gray-100">
                    <img
                      src={imageSrc}
                      alt={vendor.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-md px-3 py-1 text-xs font-bold text-rose-600 shadow-sm">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span>{vendor.service}</span>
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col space-y-4">
                    <div>
                      <h3 className="text-xl font-extrabold text-gray-900 line-clamp-1">{vendor.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mt-1">
                        <MapPin className="h-3.5 w-3.5 text-rose-500" />
                        <span>{vendor.location || 'Kigali, Rwanda'}</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed flex-1">
                      {vendor.description || `Certified professional ${vendor.service.toLowerCase()} providing premium wedding services in Rwanda.`}
                    </p>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <span className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Pricing Starts At</span>
                        <span className="text-lg font-extrabold text-gray-950">
                          {vendor.price ? `${vendor.price.toLocaleString()} RWF` : 'Custom Quote'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setContactModalVendor(vendor)}
                        className="rounded-full bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white px-4 py-2 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        <span>Contact</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Call to Action for new Vendors */}
        <div className="mt-20 bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="space-y-3 max-w-xl">
            <span className="bg-rose-500/20 text-rose-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-rose-500/30">
              For Businesses & Providers
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold">Are you a Wedding Vendor or Service Provider?</h2>
            <p className="text-rose-100/80 text-sm leading-relaxed">
              List your venue, catering, decor, or transport business on our platform. Get verified by administrators and connect with hundreds of wedding couples.
            </p>
          </div>
          <Link
            to="/register"
            className="rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold px-8 py-4 text-sm shadow-xl shadow-rose-900/50 transition shrink-0 hover:scale-105"
          >
            Register Your Business
          </Link>
        </div>
      </div>

      {/* Vendor Contact Dialog Modal */}
      {contactModalVendor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-rose-600 to-rose-700 p-6 text-white relative">
              <button
                onClick={() => setContactModalVendor(null)}
                className="absolute top-5 right-5 text-white/80 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
              <span className="text-xs uppercase font-bold text-rose-200 tracking-wider">Direct Vendor Contact</span>
              <h3 className="text-xl font-bold mt-1">{contactModalVendor.name}</h3>
              <p className="text-xs text-rose-100">{contactModalVendor.service} • {contactModalVendor.location || 'Rwanda'}</p>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <Phone className="h-5 w-5 text-rose-600 shrink-0" />
                  <div className="flex-1">
                    <span className="block text-[10px] uppercase font-bold text-gray-400">Phone / WhatsApp</span>
                    <a href={`tel:${contactModalVendor.phone}`} className="font-bold text-gray-900 hover:text-rose-600">
                      {contactModalVendor.phone || 'Contact via platform planner'}
                    </a>
                  </div>
                  {contactModalVendor.phone && (
                    <a
                      href={`https://wa.me/${contactModalVendor.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full hover:bg-emerald-100 transition"
                    >
                      WhatsApp
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <Mail className="h-5 w-5 text-rose-600 shrink-0" />
                  <div className="flex-1">
                    <span className="block text-[10px] uppercase font-bold text-gray-400">Email Address</span>
                    <a href={`mailto:${contactModalVendor.email}`} className="font-bold text-gray-900 hover:text-rose-600 truncate block">
                      {contactModalVendor.email || 'info@weddingplanner.rw'}
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-rose-50/40 rounded-2xl border border-rose-100/60 text-xs text-gray-600 space-y-1">
                <p className="font-bold text-rose-700">Want full package coordination?</p>
                <p>You can book a complete wedding package with this vendor included through our budget planners!</p>
              </div>

              <button
                onClick={() => setContactModalVendor(null)}
                className="w-full rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 text-sm transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vendors;

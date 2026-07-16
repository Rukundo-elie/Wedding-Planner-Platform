import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowLeft } from 'lucide-react';

const ContactSuccess = () => {
  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-16 sm:px-6 lg:px-8 bg-rose-50/5">
      <div className="mx-auto max-w-md w-full text-center space-y-8 bg-white p-10 rounded-3xl border border-gray-100 shadow-xl relative overflow-hidden">
        
        {/* Decorative corner glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-200/30 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-pink-200/30 rounded-full blur-2xl"></div>

        <div className="flex flex-col items-center">
          {/* Animated pulsing success checkmark */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-75"></div>
            <div className="relative rounded-full bg-emerald-50 p-4 border border-emerald-100">
              <CheckCircle className="h-16 w-16 text-emerald-600" />
            </div>
          </div>
          
          <h2 className="mt-8 text-3xl font-extrabold tracking-tight text-gray-900">Message Received!</h2>
          <p className="mt-4 text-sm text-gray-500 leading-relaxed">
            Thank you! Your message has been received. Our professional wedding coordinators will review your inquiries and contact you shortly.
          </p>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <Link
            to="/"
            className="inline-flex w-full justify-center items-center gap-2 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white py-3.5 px-4 text-sm font-bold shadow-lg shadow-rose-200 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ContactSuccess;

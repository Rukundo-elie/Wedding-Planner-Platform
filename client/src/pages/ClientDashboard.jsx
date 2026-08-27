import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import {
  Calculator, Calendar, CreditCard, CheckSquare,
  MessageSquare, Send, Bell, Award, Smile, Download, CheckCircle, RefreshCw
} from 'lucide-react';
import { readImageFile } from '../utils/cropCoverImage';
import CoverPhotoEditor from '../components/CoverPhotoEditor';

const ClientDashboard = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [packages, setPackages] = useState([]);
  const [bookingDate, setBookingDate] = useState('');
  const [selectedPkgId, setSelectedPkgId] = useState('');
  const [targetBudget, setTargetBudget] = useState('5000000');
  
  // Payments state
  const [payments, setPayments] = useState([]);
  const [showManualPayModal, setShowManualPayModal] = useState(false);
  const [payBooking, setPayBooking] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('BANK');
  
  // Bank transfer details state (for manual pay fallback)
  const [bankReference, setBankReference] = useState('');
  const [bankSlipBase64, setBankSlipBase64] = useState('');
  
  // Gateway status overlays
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [newlyCreatedPayment, setNewlyCreatedPayment] = useState(null);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatPartnerId, setChatPartnerId] = useState(2); // Hardcoded Default Planner ID

  // Loading/error
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [coverEditor, setCoverEditor] = useState(null);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Dynamically inject Flutterwave Checkout Inline script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://checkout.flutterwave.com/v3.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    fetchDashboardData();
    
    const selectPkg = searchParams.get('selectPackage');
    if (selectPkg) {
      setSelectedPkgId(selectPkg);
      setActiveTab('book');
    }
  }, [searchParams]);

  useEffect(() => {
    let interval;
    if (activeTab === 'chat' && chatPartnerId) {
      fetchMessages();
      interval = setInterval(fetchMessages, 4000); // Poll chat
    }
    return () => clearInterval(interval);
  }, [activeTab, chatPartnerId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const fetchResource = async (url) => {
        try {
          const res = await axios.get(url);
          return res.data;
        } catch (e) {
          console.error(`Error loading ${url}:`, e);
          return null;
        }
      };

      const [bookingsData, pkgsData, paymentsData] = await Promise.all([
        fetchResource('/bookings'),
        fetchResource('/packages'),
        fetchResource('/payments')
      ]);

      if (bookingsData) setBookings(bookingsData);
      if (pkgsData) setPackages(pkgsData);
      if (paymentsData) setPayments(paymentsData);
    } catch (err) {
      console.error(err);
      showNotification('error', 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!chatPartnerId) return;
    try {
      const res = await axios.get(`/messages/history/${chatPartnerId}`);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const showNotification = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 5000);
  };

  // Budget Calculator Formula
  const calculateBudgetBreakdown = (total) => {
    const parsedTotal = parseFloat(total) || 0;
    return [
      { name: 'Wedding Venue', percentage: 30, amount: parsedTotal * 0.30, color: 'bg-rose-500' },
      { name: 'Food & Catering', percentage: 24, amount: parsedTotal * 0.24, color: 'bg-amber-500' },
      { name: 'Decoration & Florals', percentage: 16, amount: parsedTotal * 0.16, color: 'bg-purple-500' },
      { name: 'Photography & Video', percentage: 10, amount: parsedTotal * 0.10, color: 'bg-emerald-500' },
      { name: 'Transport & Cars', percentage: 6, amount: parsedTotal * 0.06, color: 'bg-blue-500' },
      { name: 'DJ & Sound System', percentage: 4, amount: parsedTotal * 0.04, color: 'bg-indigo-500' },
      { name: 'Emergency/Other', percentage: 10, amount: parsedTotal * 0.10, color: 'bg-gray-500' },
    ];
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!bookingDate) {
      return showNotification('error', 'Please select a wedding date.');
    }
    
    try {
      const selectedPkg = packages.find(p => p.id === parseInt(selectedPkgId));
      const budgetValue = selectedPkg ? selectedPkg.price : parseFloat(targetBudget);
      
      const response = await axios.post('/bookings', {
        packageId: selectedPkgId || null,
        budget: budgetValue,
        date: bookingDate
      });
      
      showNotification('success', response.data.message);
      setBookingDate('');
      setSelectedPkgId('');
      fetchDashboardData();
      setActiveTab('overview');
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Booking failed.');
    }
  };

  // Launch Flutterwave Payment Gateway (MoMo / Airtel / Visa)
  const handleOnlinePaymentCheckout = (booking) => {
    if (typeof window.FlutterwaveCheckout === 'undefined') {
      return showNotification('error', 'Online Payment gateway is still loading. Please try again in 5 seconds.');
    }

    const publicKey = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_TEST-e02fb57ad519f727c62b2e811e513812-X';

    window.FlutterwaveCheckout({
      public_key: publicKey,
      tx_ref: `BOOK-${booking.id}-TXN-${Date.now()}`,
      amount: booking.budget,
      currency: 'RWF',
      payment_options: 'card,mobilemoneyrwanda',
      customer: {
        email: user.email,
        phone_number: user.phone || '',
        name: user.name,
      },
      customizations: {
        title: 'Wedding Planner Platform',
        description: `Wedding Inclusions Plan Payment - Booking #${booking.id}`,
        logo: 'https://cdn-icons-png.flaticon.com/512/3656/3656836.png',
      },
      callback: async (response) => {
        console.log('[Flutterwave Transaction Finished]:', response);
        
        if (response.status === 'successful' || response.status === 'completed') {
          // Open modal to display verification step
          setPayBooking(booking);
          setNewlyCreatedPayment(null);
          setPaymentSuccess(false);
          setPaymentProcessing(true);
          setShowManualPayModal(false); // make sure BK modal is closed
          setProcessingStep('Securing real-time verified transaction status with payment gateway...');

          try {
            const verifyRes = await axios.post('/payments/verify-flutterwave', {
              transactionId: String(response.transaction_id || response.id),
              bookingId: booking.id,
              amount: booking.budget
            });

            setNewlyCreatedPayment(verifyRes.data.payment);
            setPaymentProcessing(false);
            setPaymentSuccess(true);
            fetchDashboardData();
            showNotification('success', verifyRes.data.message);
          } catch (err) {
            setPaymentProcessing(false);
            showNotification('error', err.response?.data?.message || 'Verification failed.');
          }
        } else {
          showNotification('error', 'Online payment checkout failed.');
        }
      },
      onClose: () => {
        console.log('Online checkout sheet dismissed');
      }
    });
  };

  // Launch manual uploader modal (Fallback BK slip deposit)
  const startManualCheckout = (booking) => {
    setPayBooking(booking);
    setBankReference('');
    setBankSlipBase64('');
    setPaymentProcessing(false);
    setPaymentSuccess(false);
    setNewlyCreatedPayment(null);
    setShowManualPayModal(true);
  };

  const handleProofSlipUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      return showNotification('error', 'Please upload a valid image (PNG/JPG) of the transaction slip.');
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setBankSlipBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleManualPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!payBooking) return;

    if (!bankReference || !bankSlipBase64) {
      return showNotification('error', 'Transaction reference and slip image upload are required.');
    }

    setPaymentProcessing(true);
    setProcessingStep('Saving Bank Transfer slip details...');

    try {
      await new Promise(resolve => setTimeout(resolve, 1200));

      const response = await axios.post('/payments', {
        bookingId: payBooking.id,
        amount: payBooking.budget,
        method: 'BankTransfer',
        transactionId: bankReference,
        slipImage: bankSlipBase64
      });

      setNewlyCreatedPayment(response.data.payment);
      setPaymentProcessing(false);
      setPaymentSuccess(true);
      fetchDashboardData();
    } catch (err) {
      setPaymentProcessing(false);
      showNotification('error', err.response?.data?.message || 'Payment submission failed.');
    }
  };

  // Print receipt locally in the browser
  const downloadReceipt = (payment) => {
    const printWindow = window.open('', '_blank');
    const receiptNo = `REC-${new Date(payment.createdAt).getFullYear()}-${String(payment.id).padStart(4, '0')}`;
    const formattedDate = new Date(payment.createdAt).toLocaleDateString(undefined, {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    
    const htmlContent = `
      <html>
        <head>
          <title>Receipt ${receiptNo}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 0; padding: 40px; line-height: 1.5; }
            .receipt-box { max-width: 800px; margin: auto; border: 1px solid #eee; padding: 40px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #fce7f3; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #db2777; }
            .title { font-size: 20px; text-transform: uppercase; letter-spacing: 1px; font-weight: 800; color: #4b5563; }
            .details { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .details div { flex: 1; }
            .details .right { text-align: right; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .table th { background-color: #f9fafb; font-weight: bold; text-align: left; padding: 12px; border-bottom: 1px solid #e5e7eb; }
            .table td { padding: 12px; border-bottom: 1px solid #f3f4f6; }
            .total-section { display: flex; justify-content: flex-end; font-size: 18px; font-weight: bold; border-top: 2px solid #e5e7eb; padding-top: 15px; }
            .paid-seal { display: inline-block; border: 3px double #059669; color: #059669; font-weight: bold; text-transform: uppercase; padding: 8px 16px; border-radius: 8px; font-size: 20px; transform: rotate(-8deg); opacity: 0.85; margin-top: 20px; }
            .footer { text-align: center; font-size: 12px; color: #9ca3af; margin-top: 50px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="receipt-box">
            <div class="header">
              <div class="logo">💍 Wedding Planner</div>
              <div class="title">Official Payment Receipt</div>
            </div>
            
            <div class="details">
              <div>
                <strong>Billed To:</strong><br>
                ${user.name}<br>
                ${user.email}<br>
                ${user.phone || ''}
              </div>
              <div class="right">
                <strong>Receipt Details:</strong><br>
                Receipt No: ${receiptNo}<br>
                Transaction ID: ${payment.transactionId}<br>
                Payment Date: ${formattedDate}<br>
                Method: ${payment.method}
              </div>
            </div>
            
            <table class="table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="text-align: right;">Amount (RWF)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Wedding Planning & Coordination Services Plan: <strong>${payment.booking?.package?.name || 'Custom Budget Plan'}</strong></td>
                  <td style="text-align: right;">${payment.amount.toLocaleString()} RWF</td>
                </tr>
              </tbody>
            </table>
            
            <div class="total-section">
              <span>Total Paid: &nbsp; &nbsp; &nbsp; &nbsp; <strong>${payment.amount.toLocaleString()} RWF</strong></span>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center;">
               <div class="paid-seal">PAID &amp; VERIFIED</div>
               <div style="font-size: 11px; text-align: right; color: #6b7280;">
                 Wedding Planner Platform Ltd<br>
                 Kigali, Rwanda
               </div>
            </div>
            
            <div class="footer">
              Thank you for choosing our services. Wishing you a beautiful wedding preparation journey!
            </div>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const saveCoverPhoto = async (bookingId, imageData) => {
    setUploadingImage(true);

    try {
      const response = await axios.put(`/bookings/${bookingId}/image`, {
        image: imageData,
      });

      const savedImage = response.data.booking?.image || imageData;
      setBookings((prev) => prev.map((b) => (
        b.id === bookingId ? { ...b, image: savedImage } : b
      )));
      setCoverEditor(null);
      showNotification('success', response.data.message || 'Cover photo updated successfully!');
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Failed to upload cover photo.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageSelect = async (e, bookingId) => {
    const file = e.target.files?.[0];
    if (!file || !bookingId) return;

    if (!file.type.startsWith('image/')) {
      e.target.value = '';
      return showNotification('error', 'Please select a valid image file (JPG, PNG, or WebP).');
    }

    if (file.size > 8 * 1024 * 1024) {
      e.target.value = '';
      return showNotification('error', 'File size exceeds 8MB limit.');
    }

    try {
      const imageSrc = await readImageFile(file);
      setCoverEditor({ bookingId, imageSrc });
    } catch {
      showNotification('error', 'Unable to open the selected photo.');
    } finally {
      e.target.value = '';
    }
  };

  const openCoverEditor = (bookingId, imageSrc) => {
    setCoverEditor({ bookingId, imageSrc });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    try {
      const response = await axios.post('/messages', {
        receiverId: chatPartnerId,
        content: chatInput
      });
      setMessages([...messages, response.data]);
      setChatInput('');
    } catch (err) {
      showNotification('error', 'Failed to send message.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
      </div>
    );
  }

  const activeBooking = bookings[0]; // Simple single booking flow for demo

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {coverEditor && (
        <CoverPhotoEditor
          imageSrc={coverEditor.imageSrc}
          saving={uploadingImage}
          onCancel={() => !uploadingImage && setCoverEditor(null)}
          onSave={(imageData) => saveCoverPhoto(coverEditor.bookingId, imageData)}
        />
      )}
      {/* Alert Notification */}
      {msg.text && (
        <div className={`mb-6 p-4 rounded-xl text-sm border flex items-center gap-2.5 ${
          msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
        }`}>
          <span>{msg.text}</span>
        </div>
      )}

      {/* Online Verification Status / Success Modal Overlay */}
      {((paymentProcessing || paymentSuccess) && payBooking) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100 p-8 text-center animate-in fade-in zoom-in-95 duration-200">
            {paymentProcessing && (
              <div className="space-y-4 py-6">
                <RefreshCw className="h-12 w-12 animate-spin text-rose-600 mx-auto" />
                <h4 className="font-extrabold text-gray-800 text-lg">Transaction Processing</h4>
                <p className="text-sm text-gray-500">{processingStep}</p>
              </div>
            )}
            
            {paymentSuccess && (
              <div className="space-y-6 py-4">
                <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-emerald-600" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-2xl font-bold text-gray-900">Payment Processed!</h4>
                  <p className="text-sm text-gray-500">
                    {newlyCreatedPayment?.status === 'PAID' 
                      ? 'Congratulations! Your online payment has been verified successfully. Your booking is now confirmed.' 
                      : 'Your bank slip has been uploaded successfully. The planners will verify it against their accounts shortly.'}
                  </p>
                </div>
                {newlyCreatedPayment && newlyCreatedPayment.status === 'PAID' && (
                  <button
                    onClick={() => downloadReceipt(newlyCreatedPayment)}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-4 text-sm shadow-md transition"
                  >
                    <Download className="h-4 w-4" />
                    Print / Download Receipt
                  </button>
                )}
                <button
                  onClick={() => {
                    setPaymentSuccess(false);
                    setPaymentProcessing(false);
                  }}
                  className="w-full rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3.5 px-4 text-sm transition"
                >
                  Close Confirmation
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual BK Slip Deposit Modal Fallback */}
      {showManualPayModal && payBooking && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-rose-500 to-rose-600 p-6 text-white relative">
              <h3 className="text-xl font-bold">Bank Slip Verification</h3>
              <p className="text-rose-100 text-xs mt-1">Upload your direct deposit BK slip</p>
              <button 
                onClick={() => setShowManualPayModal(false)}
                className="absolute top-6 right-6 text-white/80 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleManualPaymentSubmit} className="p-6 space-y-6">
              <div className="bg-rose-50/40 border border-rose-100/50 p-4 rounded-2xl space-y-2 text-xs text-gray-700">
                <p className="font-bold text-rose-700 uppercase tracking-wide">Bank details for manual deposit:</p>
                <p><strong>Bank:</strong> Bank of Kigali (BK)</p>
                <p><strong>Account Name:</strong> Wedding Planner Platform Ltd</p>
                <p><strong>Account Number:</strong> 00095-07712345-88</p>
                <p className="font-bold text-gray-900 mt-2">Deposit Amount: {payBooking.budget.toLocaleString()} RWF</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                    Deposit Transaction ID / Reference
                  </label>
                  <input
                    type="text"
                    required
                    value={bankReference}
                    onChange={(e) => setBankReference(e.target.value)}
                    placeholder="e.g. BK-TX-xxxx"
                    className="block w-full rounded-2xl border border-gray-300 bg-white py-3.5 px-4 text-gray-950 focus:border-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                    Upload Bank Deposit Slip Receipt Photo
                  </label>
                  <input
                    type="file"
                    required
                    accept="image/*"
                    onChange={handleProofSlipUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-rose-50 file:text-rose-700 hover:file:bg-rose-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!bankReference || !bankSlipBase64}
                className="w-full rounded-2xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold py-4 px-4 text-sm shadow-lg shadow-rose-200 transition"
              >
                Submit Bank Slip
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Welcome, {user.name}</h1>
        <p className="text-gray-500 text-sm">Here is your wedding planning control board.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-fit space-y-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition ${
              activeTab === 'overview' ? 'bg-rose-50 text-rose-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Smile className="h-5 w-5" />
            <span>My Wedding</span>
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition ${
              activeTab === 'calculator' ? 'bg-rose-50 text-rose-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Calculator className="h-5 w-5" />
            <span>Budget Planner</span>
          </button>
          <button
            onClick={() => setActiveTab('book')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition ${
              activeTab === 'book' ? 'bg-rose-50 text-rose-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Calendar className="h-5 w-5" />
            <span>Book Services</span>
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition ${
              activeTab === 'billing' ? 'bg-rose-50 text-rose-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <CreditCard className="h-5 w-5" />
            <span>Billing & Receipts</span>
          </button>
          {activeBooking && (
            <button
              onClick={() => setActiveTab('tasks')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition ${
                activeTab === 'tasks' ? 'bg-rose-50 text-rose-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <CheckSquare className="h-5 w-5" />
              <span>Planning Tasks</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('chat')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition ${
              activeTab === 'chat' ? 'bg-rose-50 text-rose-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <MessageSquare className="h-5 w-5" />
            <span>Chat with Planner</span>
          </button>
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-3 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm min-h-[500px]">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-4">My Wedding Details</h2>
              {activeBooking ? (
                <div className="space-y-6">
                  {/* Cover Photo */}
                  {activeBooking.image ? (
                    <div className="relative h-64 w-full rounded-2xl overflow-hidden shadow-sm group border border-gray-100 mb-6">
                      <img src={activeBooking.image} alt="Wedding cover" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => openCoverEditor(activeBooking.id, activeBooking.image)}
                          disabled={uploadingImage}
                          className="rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-gray-800 hover:bg-white transition shadow"
                        >
                          Adjust Photo
                        </button>
                        <label className={`cursor-pointer rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-gray-800 hover:bg-white transition flex items-center gap-1.5 shadow ${uploadingImage ? 'opacity-60 pointer-events-none' : ''}`}>
                          <span>Change Photo</span>
                          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => handleImageSelect(e, activeBooking.id)} className="hidden" disabled={uploadingImage} />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-rose-50/20 border-2 border-dashed border-rose-200 p-8 rounded-2xl text-center space-y-3 mb-6">
                      <p className="text-sm font-semibold text-rose-600">Add a Wedding Cover Photo or Decoration Inspiration Image!</p>
                      <label className={`inline-flex cursor-pointer rounded-full bg-rose-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-rose-500 shadow-md shadow-rose-200 transition ${uploadingImage ? 'opacity-60 pointer-events-none' : ''}`}>
                        <span>{uploadingImage ? 'Saving...' : 'Add Cover Photo'}</span>
                        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => handleImageSelect(e, activeBooking.id)} className="hidden" disabled={uploadingImage} />
                      </label>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-rose-50/30 p-5 rounded-2xl border border-rose-100/50">
                      <div className="text-xs text-rose-500 font-bold uppercase tracking-wider mb-1">Wedding Date</div>
                      <div className="text-lg font-bold text-gray-900">
                        {new Date(activeBooking.date).toLocaleDateString(undefined, {
                          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                        })}
                      </div>
                    </div>
                    <div className="bg-rose-50/30 p-5 rounded-2xl border border-rose-100/50">
                      <div className="text-xs text-rose-500 font-bold uppercase tracking-wider mb-1">Package Plan</div>
                      <div className="text-lg font-bold text-gray-900">
                        {activeBooking.package ? activeBooking.package.name : 'Custom Plan'}
                      </div>
                    </div>
                    <div className="bg-rose-50/30 p-5 rounded-2xl border border-rose-100/50">
                      <div className="text-xs text-rose-500 font-bold uppercase tracking-wider mb-1">Planning Budget</div>
                      <div className="text-lg font-bold text-gray-900">
                        {activeBooking.budget.toLocaleString()} RWF
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="flex gap-2 items-center">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status:</span>
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          activeBooking.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {activeBooking.status}
                        </span>
                      </div>
                      <div className="flex gap-2 items-center mt-2">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment:</span>
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          activeBooking.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 font-bold'
                        }`}>
                          {activeBooking.paymentStatus}
                        </span>
                      </div>
                    </div>

                    {activeBooking.paymentStatus !== 'PAID' && (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => handleOnlinePaymentCheckout(activeBooking)}
                          className="rounded-2xl bg-rose-600 hover:bg-rose-500 text-white px-6 py-3.5 text-sm font-bold shadow-md shadow-rose-200 transition hover:scale-[1.01]"
                        >
                          💳 Pay Online Now (MoMo/Card)
                        </button>
                        <button
                          onClick={() => startManualCheckout(activeBooking)}
                          className="rounded-2xl border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 px-6 py-3.5 text-sm font-bold transition hover:scale-[1.01]"
                        >
                          🏛️ Upload BK Deposit Slip
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 space-y-4">
                  <p className="text-gray-500 text-sm">You do not have any active wedding bookings yet.</p>
                  <button
                    onClick={() => setActiveTab('book')}
                    className="rounded-full bg-rose-600 text-white px-6 py-2.5 text-sm font-semibold hover:bg-rose-500 transition"
                  >
                    Select a Package & Date
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: BUDGET CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-4">Wedding Budget Calculator</h2>
              <div className="max-w-md">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Enter Target Wedding Budget (RWF)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={targetBudget}
                    onChange={(e) => setTargetBudget(e.target.value)}
                    className="block w-full rounded-2xl border border-gray-300 bg-white py-3 px-4 text-gray-950 placeholder-gray-400 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 sm:text-sm"
                    placeholder="5,000,000"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Suggested Allocations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {calculateBudgetBreakdown(targetBudget).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`h-3 w-3 rounded-full ${item.color}`}></span>
                          <span className="font-bold text-sm text-gray-800">{item.name}</span>
                        </div>
                        <span className="text-xs text-gray-400 font-semibold">{item.percentage}% Allocation</span>
                      </div>
                      <span className="font-extrabold text-gray-900 text-sm">{item.amount.toLocaleString()} RWF</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BOOK SERVICES */}
          {activeTab === 'book' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-4">Book Services / Packages</h2>
              <form onSubmit={handleCreateBooking} className="space-y-6 max-w-lg">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select a Package Inclusions Plan
                  </label>
                  <select
                    value={selectedPkgId ? selectedPkgId.toString() : ''}
                    onChange={(e) => setSelectedPkgId(e.target.value)}
                    className="block w-full rounded-2xl border border-gray-300 bg-white py-3 px-4 text-gray-950 focus:border-rose-500 focus:outline-none focus:ring-1"
                  >
                    <option value="">-- Custom Package (Specify Budget Below) --</option>
                    {packages.map(p => (
                      <option key={p.id} value={p.id.toString()}>{p.name} - {p.price.toLocaleString()} RWF</option>
                    ))}
                  </select>
                </div>

                {!selectedPkgId && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Custom Wedding Budget (RWF)
                    </label>
                    <input
                      type="number"
                      value={targetBudget}
                      onChange={(e) => setTargetBudget(e.target.value)}
                      className="block w-full rounded-2xl border border-gray-300 bg-white py-3 px-4 text-gray-950 placeholder-gray-400 focus:border-rose-500 focus:outline-none focus:ring-1"
                      placeholder="5,000,000"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Wedding Date
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="block w-full rounded-2xl border border-gray-300 bg-white py-3 px-4 text-gray-950 focus:border-rose-500 focus:outline-none focus:ring-1"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-rose-600 py-3.5 px-4 text-sm font-bold text-white shadow-lg shadow-rose-200 hover:bg-rose-500 transition hover:scale-[1.01]"
                >
                  Book Wedding Package
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: BILLING & RECEIPTS */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-4">Billing & Receipt Ledger</h2>
              {payments.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <p className="text-gray-500 text-sm">No payment records found.</p>
                  {activeBooking && activeBooking.paymentStatus !== 'PAID' && (
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => handleOnlinePaymentCheckout(activeBooking)}
                        className="rounded-full bg-rose-600 text-white px-6 py-2.5 text-sm font-bold hover:bg-rose-500 transition"
                      >
                        Pay Online Now (MoMo/Card)
                      </button>
                      <button
                        onClick={() => startManualCheckout(activeBooking)}
                        className="rounded-full border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 px-6 py-2.5 text-sm font-bold transition"
                      >
                        Submit Bank Slip
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100 text-sm">
                    <thead>
                      <tr className="text-left font-semibold text-gray-400 bg-gray-50/50">
                        <th className="py-3 px-4">Receipt Ref</th>
                        <th className="py-3 px-4">Method</th>
                        <th className="py-3 px-4">Transaction ID</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-center">Receipt Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 font-medium">
                      {payments.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50/30 transition text-gray-700">
                          <td className="py-4 px-4 font-bold text-gray-900">
                            REC-{new Date(p.createdAt).getFullYear()}-{String(p.id).padStart(4, '0')}
                          </td>
                          <td className="py-4 px-4 text-xs font-bold text-gray-500">{p.method}</td>
                          <td className="py-4 px-4 font-mono text-xs">{p.transactionId}</td>
                          <td className="py-4 px-4 font-extrabold text-gray-950">{p.amount.toLocaleString()} RWF</td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              p.status === 'PAID' 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : p.status === 'FAILED'
                                ? 'bg-red-50 text-red-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            {p.status === 'PAID' ? (
                              <button
                                onClick={() => downloadReceipt(p)}
                                className="inline-flex items-center gap-1 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-3 py-1.5 rounded-full transition"
                              >
                                <Download className="h-3 w-3" />
                                Download Receipt
                              </button>
                            ) : p.status === 'PENDING' ? (
                              <span className="text-xs text-amber-500 font-semibold italic">Awaiting Admin Verification</span>
                            ) : (
                              <span className="text-xs text-red-500 font-semibold">Payment Declined</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: TASKS */}
          {activeTab === 'tasks' && activeBooking && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-4">Wedding Planning Checklist</h2>
              <div className="space-y-3">
                {activeBooking.tasks && activeBooking.tasks.map((task) => (
                  <div key={task.id} className="flex justify-between items-center p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                    <span className="text-sm font-semibold text-gray-700">{task.task}</span>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      task.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: CHAT */}
          {activeTab === 'chat' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-4">Chat with Wedding Planner</h2>
              
              {/* Message History */}
              <div className="h-96 border border-gray-100 rounded-2xl p-4 overflow-y-auto space-y-4 bg-gray-50/50">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm text-gray-400">
                    No messages yet. Say hi to your planner!
                  </div>
                ) : (
                  messages.map((m) => (
                    <div 
                      key={m.id} 
                      className={`flex flex-col max-w-[70%] rounded-2xl p-3.5 text-sm ${
                        m.senderId === user.id 
                          ? 'bg-rose-600 text-white ml-auto rounded-tr-none shadow-sm' 
                          : 'bg-white text-gray-800 mr-auto rounded-tl-none border border-gray-200'
                      }`}
                    >
                      <span className="text-xs font-bold mb-1 opacity-75">{m.sender.name}</span>
                      <span>{m.content}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message to your planner..."
                  className="block w-full rounded-2xl border border-gray-300 bg-white py-3 px-4 text-gray-950 focus:border-rose-500 focus:outline-none focus:ring-1"
                />
                <button
                  type="submit"
                  className="rounded-2xl bg-rose-600 px-5 text-white hover:bg-rose-500 transition flex items-center justify-center shrink-0"
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;

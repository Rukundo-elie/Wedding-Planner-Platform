import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calculator, Calendar, CreditCard, CheckSquare, 
  MessageSquare, Send, Bell, Award, Smile 
} from 'lucide-react';

const ClientDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [packages, setPackages] = useState([]);
  const [bookingDate, setBookingDate] = useState('');
  const [selectedPkgId, setSelectedPkgId] = useState('');
  const [targetBudget, setTargetBudget] = useState('5000000');
  
  // Payment state
  const [payMethod, setPayMethod] = useState('MoMo');
  const [payingBookingId, setPayingBookingId] = useState(null);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatPartnerId, setChatPartnerId] = useState(2); // Hardcoded Default Planner ID

  // Loading/error
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
      const [bookingsRes, pkgsRes] = await Promise.all([
        axios.get('/bookings'),
        axios.get('/packages')
      ]);
      setBookings(bookingsRes.data);
      setPackages(pkgsRes.data);
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

  const handlePayment = async (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    try {
      const response = await axios.post('/payments', {
        bookingId,
        amount: booking.budget,
        method: payMethod
      });
      showNotification('success', response.data.message);
      setPayingBookingId(null);
      fetchDashboardData();
    } catch (err) {
      showNotification('error', err.response?.data?.message || 'Payment failed.');
    }
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
      {/* Alert Notification */}
      {msg.text && (
        <div className={`mb-6 p-4 rounded-xl text-sm border flex items-center gap-2.5 ${
          msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
        }`}>
          <span>{msg.text}</span>
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
                          activeBooking.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {activeBooking.paymentStatus}
                        </span>
                      </div>
                    </div>

                    {activeBooking.paymentStatus !== 'PAID' && (
                      <div>
                        {payingBookingId === activeBooking.id ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={payMethod}
                              onChange={(e) => setPayMethod(e.target.value)}
                              className="rounded-xl border border-gray-300 py-2 px-3 text-sm focus:border-rose-500 focus:outline-none"
                            >
                              <option value="MoMo">MTN MoMo</option>
                              <option value="AirtelMoney">Airtel Money</option>
                              <option value="Card">Visa/Mastercard</option>
                            </select>
                            <button
                              onClick={() => handlePayment(activeBooking.id)}
                              className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-500 transition"
                            >
                              Confirm Pay
                            </button>
                            <button
                              onClick={() => setPayingBookingId(null)}
                              className="text-sm font-bold text-gray-500 hover:text-gray-700 px-2"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setPayingBookingId(activeBooking.id);
                              setPayMethod('MoMo');
                            }}
                            className="rounded-2xl bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 text-sm font-bold shadow-md shadow-rose-200 transition"
                          >
                            Pay Online Now
                          </button>
                        )}
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
                    value={selectedPkgId}
                    onChange={(e) => setSelectedPkgId(e.target.value)}
                    className="block w-full rounded-2xl border border-gray-300 bg-white py-3 px-4 text-gray-950 focus:border-rose-500 focus:outline-none focus:ring-1"
                  >
                    <option value="">-- Custom Package (Specify Budget Below) --</option>
                    {packages.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - {p.price.toLocaleString()} RWF</option>
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

          {/* TAB 4: TASKS */}
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

          {/* TAB 5: CHAT */}
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

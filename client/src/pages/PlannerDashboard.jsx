import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { 
  Calendar, CheckSquare, Plus, MessageSquare, 
  Send, User, Clock, CheckCircle2, ChevronRight 
} from 'lucide-react';

const PlannerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings');
  
  // Dashboard state
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [tasks, setTasks] = useState([]);
  
  // New task form state
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');

  // Chat contacts and messages state
  const [chatContacts, setChatContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  // Loading/error status
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchPlannerData();
  }, []);

  useEffect(() => {
    let interval;
    if (activeTab === 'chat' && selectedContact) {
      fetchMessages();
      interval = setInterval(fetchMessages, 4000);
    }
    return () => clearInterval(interval);
  }, [activeTab, selectedContact]);

  const fetchPlannerData = async () => {
    try {
      setLoading(true);
      const bookingsRes = await axios.get('/bookings');
      setBookings(bookingsRes.data);
      
      const contactsRes = await axios.get('/messages/partners');
      setChatContacts(contactsRes.data);
    } catch (err) {
      console.error(err);
      showNotification('error', 'Failed to retrieve planner records.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingTasks = async (bookingId) => {
    try {
      const res = await axios.get(`/tasks/booking/${bookingId}`);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
      showNotification('error', 'Failed to retrieve checklist tasks.');
    }
  };

  const fetchMessages = async () => {
    if (!selectedContact) return;
    try {
      const res = await axios.get(`/messages/history/${selectedContact.id}`);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const showNotification = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 5000);
  };

  const handleBookingSelect = async (booking) => {
    setSelectedBooking(booking);
    await fetchBookingTasks(booking.id);
    setActiveTab('tasks');
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    try {
      const response = await axios.post(`/tasks/booking/${selectedBooking.id}`, {
        task: newTaskText,
        deadline: newTaskDeadline || null
      });
      setTasks([...tasks, response.data.task]);
      setNewTaskText('');
      setNewTaskDeadline('');
      showNotification('success', 'Task added to wedding checklist!');
    } catch (err) {
      showNotification('error', 'Failed to append task.');
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const response = await axios.put(`/tasks/${taskId}`, {
        status: newStatus,
        plannerId: user.id
      });
      
      setTasks(tasks.map(t => t.id === taskId ? response.data.task : t));
      showNotification('success', 'Task status updated.');
    } catch (err) {
      showNotification('error', 'Failed to modify task status.');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedContact) return;

    try {
      const response = await axios.post('/messages', {
        receiverId: selectedContact.id,
        content: chatInput
      });
      setMessages([...messages, response.data]);
      setChatInput('');
    } catch (err) {
      showNotification('error', 'Failed to deliver message.');
    }
  };

  const startChatWithClient = (clientUser) => {
    // Check if client is already in contacts
    const existing = chatContacts.find(c => c.id === clientUser.id);
    const contactObj = existing || { id: clientUser.id, name: clientUser.name, role: clientUser.role };
    
    if (!existing) {
      setChatContacts([contactObj, ...chatContacts]);
    }
    
    setSelectedContact(contactObj);
    setMessages([]);
    setActiveTab('chat');
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {msg.text && (
        <div className={`mb-6 p-4 rounded-xl text-sm border flex items-center gap-2.5 ${
          msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
        }`}>
          <span>{msg.text}</span>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Planner Workspace</h1>
        <p className="text-gray-500 text-sm">Manage scheduled weddings, assign tasks, and message clients.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-fit space-y-2">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition ${
              activeTab === 'bookings' ? 'bg-rose-50 text-rose-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Calendar className="h-5 w-5" />
            <span>Wedding Bookings</span>
          </button>
          
          <button
            onClick={() => {
              if (selectedBooking) {
                setActiveTab('tasks');
              } else {
                showNotification('error', 'Select a booking from the booking tab first.');
              }
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition ${
              !selectedBooking ? 'opacity-40 cursor-not-allowed text-gray-400' : 
              activeTab === 'tasks' ? 'bg-rose-50 text-rose-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <CheckSquare className="h-5 w-5" />
            <span>Task Checklist</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition ${
              activeTab === 'chat' ? 'bg-rose-50 text-rose-600' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <MessageSquare className="h-5 w-5" />
            <span>Client Message Board</span>
          </button>
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-3 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm min-h-[500px]">
          
          {/* TAB 1: BOOKINGS LIST */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-4">Customer Wedding Bookings</h2>
              {bookings.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No wedding bookings assigned yet.</p>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div 
                      key={booking.id} 
                      className="border border-gray-100 rounded-2xl p-5 hover:bg-gray-50/50 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer"
                      onClick={() => handleBookingSelect(booking)}
                    >
                      <div>
                        <h3 className="font-extrabold text-gray-900 text-lg">{booking.user.name}</h3>
                        <p className="text-sm text-gray-500">{booking.user.email} | {booking.user.phone || 'No Phone'}</p>
                        
                        <div className="flex gap-4 mt-3 text-xs text-gray-500 font-semibold">
                          <span>Package: <strong className="text-gray-700">{booking.package ? booking.package.name : 'Custom'}</strong></span>
                          <span>Budget: <strong className="text-gray-700">{booking.budget.toLocaleString()} RWF</strong></span>
                          <span>Date: <strong className="text-gray-700">{new Date(booking.date).toLocaleDateString()}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            booking.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {booking.status}
                          </span>
                          <span className="text-[10px] text-gray-400 font-semibold mt-1">Payment: {booking.paymentStatus}</span>
                        </div>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startChatWithClient(booking.user);
                          }}
                          className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Message Client"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                        
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TASKS CHECKLIST BOARD */}
          {activeTab === 'tasks' && selectedBooking && (
            <div className="space-y-6">
              <div className="border-b pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Checklist: {selectedBooking.user.name}'s Wedding</h2>
                  <p className="text-xs text-gray-500">Scheduled Date: {new Date(selectedBooking.date).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className="text-sm font-semibold text-rose-600 hover:underline"
                >
                  Change Booking
                </button>
              </div>

              {/* Add Custom Task Form */}
              <form onSubmit={handleAddTask} className="flex flex-wrap gap-2 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <input
                  type="text"
                  required
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  placeholder="Create custom task (e.g. Schedule dress fitting)"
                  className="flex-1 min-w-[200px] rounded-xl border border-gray-300 bg-white py-2 px-3 text-sm focus:border-rose-500 focus:outline-none"
                />
                <input
                  type="date"
                  value={newTaskDeadline}
                  onChange={(e) => setNewTaskDeadline(e.target.value)}
                  className="rounded-xl border border-gray-300 bg-white py-2 px-3 text-sm focus:border-rose-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-505 transition flex items-center gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Task</span>
                </button>
              </form>

              {/* Task list rendering */}
              <div className="space-y-3 pt-2">
                {tasks.map((task) => (
                  <div key={task.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div>
                      <div className="text-sm font-bold text-gray-800">{task.task}</div>
                      {task.deadline && (
                        <div className="text-[10px] text-gray-400 font-semibold flex items-center gap-1 mt-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {task.status !== 'COMPLETED' ? (
                        <>
                          <button
                            onClick={() => handleUpdateTaskStatus(task.id, 'COMPLETED')}
                            className="text-xs bg-emerald-100 text-emerald-800 rounded-xl px-3 py-1.5 font-bold hover:bg-emerald-200 transition"
                          >
                            Mark Done
                          </button>
                          {task.status !== 'IN_PROGRESS' && (
                            <button
                              onClick={() => handleUpdateTaskStatus(task.id, 'IN_PROGRESS')}
                              className="text-xs bg-amber-100 text-amber-800 rounded-xl px-3 py-1.5 font-bold hover:bg-amber-200 transition"
                            >
                              Start
                            </button>
                          )}
                        </>
                      ) : (
                        <span className="text-emerald-600 flex items-center gap-1 text-sm font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Completed</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CHAT ROOM */}
          {activeTab === 'chat' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-4">Client Message Board</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Contacts column */}
                <div className="border border-gray-100 rounded-2xl p-4 space-y-2 h-96 overflow-y-auto bg-gray-50/50">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Active Conversations</h3>
                  {chatContacts.length === 0 ? (
                    <div className="text-xs text-gray-400 text-center py-8">No active chats. Message a client from the bookings tab.</div>
                  ) : (
                    chatContacts.map(contact => (
                      <button
                        key={contact.id}
                        onClick={() => {
                          setSelectedContact(contact);
                          setMessages([]);
                        }}
                        className={`w-full text-left p-3 rounded-xl border transition flex flex-col ${
                          selectedContact && selectedContact.id === contact.id
                            ? 'border-rose-500 bg-rose-50 text-rose-600'
                            : 'border-transparent hover:bg-white text-gray-700'
                        }`}
                      >
                        <span className="font-bold text-sm">{contact.name}</span>
                        <span className="text-[10px] uppercase font-semibold text-gray-400 mt-1">{contact.role}</span>
                      </button>
                    ))
                  )}
                </div>

                {/* Message column */}
                <div className="md:col-span-2 flex flex-col justify-between h-96">
                  {selectedContact ? (
                    <>
                      {/* History */}
                      <div className="flex-1 border border-gray-100 rounded-2xl p-4 overflow-y-auto space-y-4 bg-gray-50/50 mb-3">
                        {messages.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-xs text-gray-400">
                            Say hello to {selectedContact.name}!
                          </div>
                        ) : (
                          messages.map(m => (
                            <div
                              key={m.id}
                              className={`flex flex-col max-w-[75%] rounded-2xl p-3 text-xs ${
                                m.senderId === user.id
                                  ? 'bg-rose-600 text-white ml-auto rounded-tr-none'
                                  : 'bg-white text-gray-800 mr-auto rounded-tl-none border border-gray-200'
                              }`}
                            >
                              <span className="text-[10px] font-bold opacity-75 mb-0.5">{m.sender.name}</span>
                              <span>{m.content}</span>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Input */}
                      <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder={`Message ${selectedContact.name}...`}
                          className="block w-full rounded-2xl border border-gray-300 bg-white py-2.5 px-4 text-sm focus:border-rose-500 focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="rounded-2xl bg-rose-600 px-4 text-white hover:bg-rose-500 transition flex items-center justify-center shrink-0"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="h-full flex items-center justify-center border border-dashed border-gray-200 rounded-2xl text-sm text-gray-400">
                      Select a contact from the left list to begin messaging.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlannerDashboard;

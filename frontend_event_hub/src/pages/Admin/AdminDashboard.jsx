import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [adminSecret, setAdminSecret] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [requests, setRequests] = useState([]);
  const [clubsWithEvents, setClubsWithEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('approvals'); // 'approvals' or 'clubs'

  // Load admin secret from localStorage on mount
  useEffect(() => {
    const savedSecret = localStorage.getItem('adminSecret');
    if (savedSecret) {
      setAdminSecret(savedSecret);
      setIsAuthenticated(true);
      fetchPending();
      fetchClubsWithEvents();
    }
  }, []);

  const handleAdminSecretSubmit = async (e) => {
    e.preventDefault();
    if (!adminSecret.trim()) {
      toast.error('Please enter admin secret');
      return;
    }

    // Test authentication by fetching pending approvals
    try {
      const res = await axios.get('/admin/pending-approvals', { 
        headers: { 'x-admin-secret': adminSecret } 
      });
      
      if (res.data.success || res.data.error === 'Unauthorized: Invalid admin credentials') {
        if (res.data.error) {
          toast.error('Invalid admin secret');
          setIsAuthenticated(false);
          localStorage.removeItem('adminSecret');
        } else {
          setIsAuthenticated(true);
          localStorage.setItem('adminSecret', adminSecret);
          toast.success('Admin authenticated successfully');
          fetchPending();
          fetchClubsWithEvents();
        }
      }
    } catch (err) {
      toast.error('Failed to authenticate. Please check your admin secret.');
      setIsAuthenticated(false);
      localStorage.removeItem('adminSecret');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminSecret('');
    localStorage.removeItem('adminSecret');
    setRequests([]);
    setClubsWithEvents([]);
    toast.success('Logged out successfully');
  };

  const fetchPending = async () => {
    if (!adminSecret) return;
    setLoading(true);
    try {
      const res = await axios.get('/admin/pending-approvals', { headers: { 'x-admin-secret': adminSecret } });
      if (res.data.success) {
        setRequests(res.data.requests);
      } else {
        toast.error(res.data.error || 'Failed to fetch requests');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const fetchClubsWithEvents = async () => {
    if (!adminSecret) return;
    setLoading(true);
    try {
      const res = await axios.get('/admin/clubs-events', { headers: { 'x-admin-secret': adminSecret } });
      if (res.data.success) {
        setClubsWithEvents(res.data.clubs);
      } else {
        toast.error(res.data.error || 'Failed to fetch clubs and events');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch clubs and events');
    } finally {
      setLoading(false);
    }
  };

  const approve = async (approvalToken) => {
    try {
      const res = await axios.post(`/admin/approve/${approvalToken}`, {}, { headers: { 'x-admin-secret': adminSecret } });
      if (res.data.success) {
        toast.success(res.data.message || 'Approved');
        fetchPending();
        fetchClubsWithEvents(); // Refresh clubs list
      } else {
        toast.error(res.data.error || 'Approval failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Approval failed');
    }
  };

  const reject = async (approvalToken, shouldDelete = false) => {
    try {
      const res = await axios.post(`/admin/reject/${approvalToken}`, { deleteClub: shouldDelete }, { headers: { 'x-admin-secret': adminSecret } });
      if (res.data.success) {
        toast.success(res.data.message || 'Rejected');
        fetchPending();
        fetchClubsWithEvents(); // Refresh clubs list
      } else {
        toast.error(res.data.error || 'Reject failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Reject failed');
    }
  };

  const handleDeleteClub = async (clubId, clubName) => {
    if (!window.confirm(`Are you sure you want to delete the club "${clubName}"? This will also delete all associated events, registrations, and data. This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await axios.delete(`/admin/club/${clubId}`, { headers: { 'x-admin-secret': adminSecret } });
      if (res.data.success) {
        toast.success(res.data.message || 'Club deleted successfully');
        fetchClubsWithEvents();
      } else {
        toast.error(res.data.error || 'Failed to delete club');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete club');
    }
  };

  const handleDeleteEvent = async (eventId, eventName) => {
    if (!window.confirm(`Are you sure you want to delete the event "${eventName}"? This will send cancellation emails to all users. This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await axios.delete(`/admin/event/${eventId}`, { headers: { 'x-admin-secret': adminSecret } });
      if (res.data.success) {
        toast.success(res.data.message || 'Event deleted successfully');
        fetchClubsWithEvents();
      } else {
        toast.error(res.data.error || 'Failed to delete event');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete event');
    }
  };

  const maskSecret = (secret) => {
    if (!secret) return '';
    return '•'.repeat(secret.length);
  };

  // Filter upcoming events (events with date >= today)
  const getUpcomingEvents = (events) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return events.filter(event => {
      const eventDate = new Date(event.edate);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= today;
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          )}
        </div>

        {!isAuthenticated ? (
          <form onSubmit={handleAdminSecretSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Admin Secret</label>
              <div className="flex gap-2">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={adminSecret}
                  onChange={(e) => setAdminSecret(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter admin secret to access dashboard"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  {showSecret ? 'Hide' : 'Show'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Authenticate
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-green-600 font-semibold">✓ Authenticated</span>
              <span className="text-sm text-gray-600">
                Secret: {maskSecret(adminSecret)}
              </span>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('approvals')}
                className={`px-4 py-2 font-semibold transition ${
                  activeTab === 'approvals'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Pending Approvals
              </button>
              <button
                onClick={() => {
                  setActiveTab('clubs');
                  fetchClubsWithEvents();
                }}
                className={`px-4 py-2 font-semibold transition ${
                  activeTab === 'clubs'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Clubs & Events
              </button>
            </div>
          </div>
        )}
      </div>

      {isAuthenticated && (
        <>
          {/* Pending Approvals Tab */}
          {activeTab === 'approvals' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Pending Approvals</h2>
                <button
                  onClick={fetchPending}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
              </div>

              {loading && <p className="text-gray-600">Loading...</p>}

              {!loading && requests && requests.length === 0 && (
                <p className="text-gray-600">No pending approvals.</p>
              )}

              <div className="space-y-4">
                {requests.map((r) => (
                  <div key={r._id} className="p-4 border border-gray-200 rounded-lg flex justify-between items-start hover:shadow-md transition">
                    <div className="flex-1">
                      <div className="font-semibold text-lg text-gray-900 mb-2">
                        {r.requestType.replace('_', ' ').toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Name: {r.name || r.requestData?.uname || r.requestData?.cname}</div>
                        <div>Dept: {r.department}</div>
                        <div>Created: {new Date(r.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => approve(r.approvalToken)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => reject(r.approvalToken, false)}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-sm"
                      >
                        Reject (Keep)
                      </button>
                      <button
                        onClick={() => reject(r.approvalToken, true)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                      >
                        Reject & Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clubs & Events Tab */}
          {activeTab === 'clubs' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Clubs & Events</h2>
                <button
                  onClick={fetchClubsWithEvents}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
              </div>

              {loading && <p className="text-gray-600">Loading clubs and events...</p>}

              {!loading && clubsWithEvents.length === 0 && (
                <p className="text-gray-600">No clubs found in the database.</p>
              )}

              <div className="space-y-6">
                {clubsWithEvents.map((club) => {
                  const upcomingEvents = getUpcomingEvents(club.events);
                  return (
                    <div key={club._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{club.cname}</h3>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              club.registrationStatus === 'approved'
                                ? 'bg-green-100 text-green-700'
                                : club.registrationStatus === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {club.registrationStatus}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Club ID: {club.cid}</div>
                            <div>Department: {club.cdepartment}</div>
                            <div>Created: {new Date(club.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteClub(club._id, club.cname)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm ml-4"
                        >
                          Remove Club
                        </button>
                      </div>

                      <div className="mt-4">
                        <h4 className="font-semibold text-gray-800 mb-3">
                          Upcoming Events ({upcomingEvents.length})
                        </h4>
                        {upcomingEvents.length === 0 ? (
                          <p className="text-gray-500 text-sm">No upcoming events</p>
                        ) : (
                          <div className="space-y-3">
                            {upcomingEvents.map((event) => (
                              <div
                                key={event._id}
                                className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-start"
                              >
                                <div className="flex-1">
                                  <div className="font-semibold text-gray-900 mb-2">{event.ename}</div>
                                  <div className="text-sm text-gray-600 space-y-1">
                                    <div>Date: {new Date(event.edate).toLocaleDateString()}</div>
                                    <div>Venue: {event.evenue}</div>
                                    <div>Type: {event.etype}</div>
                                    {event.eprmsg && <div>Message: {event.eprmsg}</div>}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDeleteEvent(event._id, event.ename)}
                                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm ml-4"
                                >
                                  Remove Event
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;

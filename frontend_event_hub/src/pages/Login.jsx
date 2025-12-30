
import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { UserContext } from '../context/UserContext';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [isVisible, setVisible] = useState(false);
  const userloginForm = () => {
    setVisible(!isVisible);
  }
  const { user, setUser, loading } = useContext(UserContext);
  const [clubVisible, setCVisible] = useState(false);
  const clubForm = () => {
    setCVisible(!clubVisible);
  }

  useEffect(() => {
    if (!loading && user) {

      if (user.role === 'club') {
        navigate('/clubdash');
      } else if (user.role === 'user') {
        navigate('/userdash');
      }
    }
  }, [user, loading, navigate]); // Rerun if user or loading changes



  const [form, setForm] = useState({ email: '', password: '', sapid: '' });
  const [busy, setBusy] = useState(false);
  const [memberships, setMemberships] = useState([]);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [view, setView] = useState('user');

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);

    try {

      const res = await axios.post('/ulogin', { uemail: form.email, upassword: form.password, usapid: form.sapid }, { withCredentials: true });

      if (res.data?.error) {
        toast.error(res.data.error);
      } else {

        setUser(res.data.user);
        setForm({ email: '', password: '', sapid: '' });

        // Check if user has club memberships
        if (res.data.memberships && res.data.memberships.length > 0) {
          setMemberships(res.data.memberships);
          setShowRoleModal(true);
          // Don't navigate yet, wait for user choice
        } else {
          toast.success('Login successful!');
          navigate('/userdash');
        }
      }
    } catch (err) {
      console.error('login failed', err);
      toast.error('Login failed — check console.');
    } finally {
      setBusy(false);
    }
  };


  const [cform, setcForm] = useState({ Cname: '', Cpassword: '', cid: '' });

  const submitClub = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);

    try {

      const res = await axios.post('/clogin', { cname: cform.Cname, cpassword: cform.Cpassword, cid: cform.cid }, { withCredentials: true });

      if (res.data?.error) {
        toast.error(res.data.error);
      } else {
        // Store club info in localStorage for the dashboard
        if (res.data.user) {
          localStorage.setItem('club', JSON.stringify({
            id: res.data.user.id,
            cname: res.data.user.cname,
            cid: res.data.user.cid,
            registrationStatus: res.data.user.registrationStatus
          }));
          setUser(res.data.user);
        }
        setcForm({ Cname: '', Cpassword: '', cid: '' });
        toast.success('Login successful!');
        navigate('/clubdash');
      }
    } catch (err) {
      console.error('login failed', err);
      toast.error('Login failed — check console.');
    } finally {
      setBusy(false);
    }
  };

  const handleRoleSelection = async (type, clubId = null) => {
    if (type === 'user') {
      setShowRoleModal(false);
      navigate('/userdash');
    } else if (type === 'club' && clubId) {
      try {
        setBusy(true);
        const res = await axios.post('/user/switch-to-club', { target_club_id: clubId });
        if (res.data.success) {
          // Update local storage with club info
          localStorage.setItem('club', JSON.stringify({
            id: res.data.club.id,
            cname: res.data.club.cname,
            cid: res.data.club.cid,
            role: 'club'
          }));
          setUser({ ...res.data.club }); // Update context to reflect club role
          setShowRoleModal(false);
          toast.success(res.data.message);
          navigate('/clubdash');
        } else {
          toast.error(res.data.error || "Failed to switch to club profile");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error switching profile");
      } finally {
        setBusy(false);
      }
    }
  };

  const RoleSelectionModal = () => {
    if (!showRoleModal) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Select Profile</h2>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => handleRoleSelection('user')}
              className="p-4 border-2 border-blue-500 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-between group"
            >
              <span className="font-semibold text-gray-700 group-hover:text-blue-700">Continue as User</span>
              <span className="text-2xl">👤</span>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or Login as Club Member</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {memberships.map((m) => (
                <button
                  key={m.club_db_id}
                  onClick={() => handleRoleSelection('club', m.club_db_id)}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-gray-800">{m.cname}</span>
                  <span className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-600">Committee</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => handleRoleSelection('user')} // Default to user if they cancel? Or strict? Let's allow closing to mean 'User'
              className="mt-4 text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading || (!loading && user)) {
    return <div>Loading...</div>;
  }
  return (
    <>
      <RoleSelectionModal />
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* The main form card */}
          <div className="bg-white p-8 rounded-xl shadow-lg">
            {/* Tab buttons */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => setView('user')}
                className={`flex-1 py-3 text-center font-semibold ${view === 'user'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Login as User
              </button>
              <button
                onClick={() => setView('club')}
                className={`flex-1 py-3 text-center font-semibold ${view === 'club'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Login as Club
              </button>
            </div>

            {/* User Login Form */}
            <div className={view === 'user' ? 'block' : 'hidden'}>
              <form onSubmit={submit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">SAP ID</label>
                  <input
                    type="password"
                    value={form.sapid}
                    onChange={(e) => setForm({ ...form, sapid: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={busy}
                  className="mt-4 w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:opacity-50"
                >
                  {busy ? 'Signing in…' : 'Login'}
                </button>
              </form>
            </div>

            {/* Club Login Form */}
            <div className={view === 'club' ? 'block' : 'hidden'}>
              <form onSubmit={submitClub} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Club Name</label>
                  <input
                    type="text"
                    value={cform.Cname}
                    // --- CRITICAL BUG FIX: Was setForm and ...form ---
                    onChange={(e) => setcForm({ ...cform, Cname: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Club ID</label>
                  <input
                    type="password"
                    value={cform.cid}
                    // --- CRITICAL BUG FIX: Was setForm and ...form ---
                    onChange={(e) => setcForm({ ...cform, cid: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    value={cform.Cpassword}
                    // --- CRITICAL BUG FIX: Was setForm and ...form ---
                    onChange={(e) => setcForm({ ...cform, Cpassword: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={busy}
                  className="mt-4 w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:opacity-50"
                >
                  {busy ? 'Signing in…' : 'Login'}
                </button>
              </form>
            </div>
          </div>

          {/* Links below the card */}
          <div className="text-center mt-4 text-sm">
            <Link to="/" className="text-blue-600 hover:underline">
              Go home..
            </Link>
            <span className="text-gray-500 mx-2">|</span>
            <Link to="/register" className="text-blue-600 hover:underline">
              Don't have an account? Register
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
import { useState, useEffect, useContext } from "react";
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate, Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";
export default function Register() {
  const [view, setView] = useState('user');
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOTP] = useState('');
  const [pendingClubId, setPendingClubId] = useState(null);
  const navigate = useNavigate();
  const { user, loading } = useContext(UserContext);
  const [udata, setuData] = useState({
    uname: '',
    uemail: '',
    upassword: '',
    usapid: '',
    uphonenumber: '',
    udepartment: ''
  });

  const [cdata, setcData] = useState({
    cname: '',
    cdepartment: '',
    cpassword: '',
    cid: ''
  });

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'club') {
        navigate('/clubdash');
      } else if (user.role === 'user') {
        navigate('/userdash');
      }
    }
  }, [user, loading, navigate]);
  
  const registerUser = async (e) => {
    e.preventDefault();
    const { uname, uemail, upassword, usapid, uphonenumber, udepartment } = udata;
    try {
      const { data: responseuData } = await axios.post('/uregister', { uname, uemail, upassword, usapid, uphonenumber, udepartment });
      if (responseuData.error) {
        toast.error(responseuData.error);
      } else {
        setuData({ uname: '', uemail: '', upassword: '', usapid: '', uphonenumber: '', udepartment: '' });
        toast.success('Registration successful. Please login.');
        navigate('/login');
      }
    } catch (error) {
      console.error(' error:', error);
      toast.error(error.response?.data?.error || 'Registration failed.');
    }
  };

  const registerClub = async (e) => {
    e.preventDefault();
    const { cname, cdepartment, cpassword, cid } = cdata;
    try {
      const { data: responseData } = await axios.post('/cregister', { cname, cdepartment, cpassword, cid });
      if (responseData.error) {
        toast.error(responseData.error);
      } else if (responseData.requiresOTP) {
        setPendingClubId(responseData.cid);
        setShowOTPModal(true);
        toast.success('OTP has been sent to the admin email.');
      }
    } catch (error) {
      console.error('error:', error);
      toast.error(error.response?.data?.error || 'Registration failed.');
    }
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    try {
      const { data: responseData } = await axios.post('/verify-club-otp', { 
        cid: pendingClubId, 
        otp: otp 
      });
      
      if (responseData.error) {
        toast.error(responseData.error);
      } else {
        setcData({ cname: '', cpassword: '', cid: '', cdepartment: '' });
        setShowOTPModal(false);
        setOTP('');
        setPendingClubId(null);
        toast.success('Registration successful. Please login.');
        navigate('/login');
      }
    } catch (error) {
      console.error('error:', error);
      toast.error(error.response?.data?.error || 'OTP verification failed.');
    }
  };

 
    // OTP Modal component
  const OTPModal = () => {
    if (!showOTPModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">OTP Verification</h2>
        <form onSubmit={verifyOTP} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
            <div className="flex gap-2 justify-center">
              {[...Array(6)].map((_, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  value={otp[index] || ''}
                  onChange={(e) => {
                    const newOtp = otp.split('');
                    newOtp[index] = e.target.value;
                    const newOtpString = newOtp.join('');
                    setOTP(newOtpString);
                    
                    // Auto-focus next input if a digit was entered
                    if (e.target.value && index < 5) {
                      const nextInput = e.target.parentElement.nextElementSibling?.querySelector('input');
                      if (nextInput) nextInput.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    // Handle backspace
                    if (e.key === 'Backspace' && !otp[index] && index > 0) {
                      const prevInput = e.target.parentElement.previousElementSibling?.querySelector('input');
                      if (prevInput) {
                        prevInput.focus();
                        e.preventDefault();
                      }
                    }
                  }}
                  className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
            >
              Verify OTP
            </button>
            <button
              type="button"
              onClick={() => {
                setShowOTPModal(false);
                setOTP('');
                setPendingClubId(null);
              }}
              className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
    );
  };

  // Helper component for radio buttons
  const RadioInput = ({ label, value, checked, onChange, name }) => (
    <label className="flex items-center gap-2 text-sm text-gray-700">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
      />
      {label}
    </label>
  );

  return (
    <>
      <OTPModal />
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-xl shadow-lg">
        
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setView('user')}
              className={`flex-1 py-3 text-center font-semibold ${
                view === 'user'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Register as User
            </button>
            <button
              onClick={() => setView('club')}
              className={`flex-1 py-3 text-center font-semibold ${
                view === 'club'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Register as Club
            </button>
          </div>

          {/* User Registration Form */}
          <div className={view === 'user' ? 'block' : 'hidden'}>
            <form onSubmit={registerUser} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input type='text' placeholder='Your full name' value={udata.uname} onChange={(e) => setuData({ ...udata, uname: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type='email' placeholder='you@example.com' value={udata.uemail} onChange={(e) => setuData({ ...udata, uemail: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">SAP ID</label>
                <input type='text' placeholder='11-digit SAP ID' value={udata.usapid} onChange={(e) => setuData({ ...udata, usapid: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input type='text' placeholder='Your phone number' value={udata.uphonenumber} onChange={(e) => setuData({ ...udata, uphonenumber: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <div className="flex items-center gap-4">
                  <RadioInput label="Comps" value="COMPS" name="udepartment" checked={udata.udepartment === 'COMPS'} onChange={(e) => { setuData({ ...udata, udepartment: e.target.value }) }} />
                  <RadioInput label="IT" value="IT" name="udepartment" checked={udata.udepartment === 'IT'} onChange={(e) => { setuData({ ...udata, udepartment: e.target.value }) }} />
                  <RadioInput label="AIDS" value="AIDS" name="udepartment" checked={udata.udepartment === 'AIDS'} onChange={(e) => { setuData({ ...udata, udepartment: e.target.value }) }} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input type='password' placeholder='Min 6 characters' value={udata.upassword} onChange={(e) => setuData({ ...udata, upassword: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <button type='submit' className="mt-4 w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75">
                Register
              </button>
            </form>
          </div>

          {/* Club Registration Form */}
          <div className={view === 'club' ? 'block' : 'hidden'}>
            <form onSubmit={registerClub} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Club Name</label>
                <input type='text' placeholder='Your club name' value={cdata.cname} onChange={(e) => setcData({ ...cdata, cname: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Club ID</label>
                <input type='text' placeholder='Your club ID' value={cdata.cid} onChange={(e) => setcData({ ...cdata, cid: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Club Department</label>
                <div className="flex items-center gap-4">
                  <RadioInput label="Comps" value="COMPS" name="cdepartment" checked={cdata.cdepartment === 'COMPS'} onChange={(e) => { setcData({ ...cdata, cdepartment: e.target.value }) }} />
                  <RadioInput label="IT" value="IT" name="cdepartment" checked={cdata.cdepartment === 'IT'} onChange={(e) => { setcData({ ...cdata, cdepartment: e.target.value }) }} />
                  <RadioInput label="AIDS" value="AIDS" name="cdepartment" checked={cdata.cdepartment === 'AIDS'} onChange={(e) => { setcData({ ...cdata, cdepartment: e.target.value }) }} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input type='password' placeholder='Min 6 characters' value={cdata.cpassword} onChange={(e) => setcData({ ...cdata, cpassword: e.target.value })}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <button type='submit' className="mt-4 w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75">
                Register
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
          <Link to="/login" className="text-blue-600 hover:underline">
            Already have an account? Login
          </Link>
          </div>
        </div>
      </div>
    </>
  );
}
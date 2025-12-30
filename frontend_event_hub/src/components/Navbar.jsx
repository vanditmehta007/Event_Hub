import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Navbar = () => {
  const { user, setUser, loading } = useContext(UserContext);
  const navigate = useNavigate();


  const handleLogout = async () => {
    try {
      await axios.post('/logout');
      setUser(null);
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed. Please try again.');
    }
  };


  const navLinkClass = "px-6 py-2.5 text-gray-700 font-bold rounded-full transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] hover:scale-105 active:scale-95 border border-transparent hover:bg-white/40 hover:backdrop-blur-md hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:border-white/60 hover:text-cyan-600";
  const logoutButtonClass = "px-6 py-2.5 text-red-600 font-bold rounded-full transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] hover:scale-105 active:scale-95 border border-transparent hover:bg-red-50/50 hover:backdrop-blur-md hover:shadow-[0_4px_12px_rgba(239,68,68,0.2)] hover:border-red-100/60";

  return (
    <div className="w-full flex justify-center pb-6 sticky top-4 z-50">
      <nav className="flex items-center space-x-2 bg-white/90 backdrop-blur-md shadow-2xl rounded-full px-6 py-3 border border-white/50 ring-1 ring-black/5">

        <Link to={'/'} className={navLinkClass}>Home</Link>
        <Link to={'/about'} className={navLinkClass}>About</Link>

        {loading ? (
          <span className="px-5 py-2 text-gray-400 font-medium">Loading...</span>
        ) : user ? (

          <>
            {user.role === 'user' && (
              <Link to={'/userdash'} className={navLinkClass}>User Dashboard</Link>
            )}
            {user.role === 'club' && (
              <Link to={'/clubdash'} className={navLinkClass}>Club Dashboard</Link>
            )}

            <button onClick={handleLogout} className={logoutButtonClass}>
              Sign Out
            </button>
          </>
        ) : (

          <>
            <Link to={'/login'} className={navLinkClass}>Login</Link>
            <Link to={'/register'} className={navLinkClass}>Register</Link>
          </>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
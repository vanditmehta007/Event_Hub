import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import { UserContext } from '../context/UserContext';
import axios from 'axios'; // 2. Import axios
import { toast } from 'react-hot-toast'; // 3. Import toast for feedback

const Navbar = () => {
  const { user, setUser, loading } = useContext(UserContext); // 4. Get setUser
  const navigate = useNavigate(); // 5. Initialize navigate

  // 6. Create the handleLogout function
  const handleLogout = async () => {
    try {
      await axios.post('/logout'); // Call the backend endpoint
      setUser(null); // Clear the user state in the context
      toast.success('Logged out successfully');
      navigate('/login'); // Redirect to login page
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed. Please try again.');
    }
  };

  // Helper function for consistent link styling
  const navLinkClass = "px-5 py-2 text-gray-700 font-medium hover:bg-cyan-100 rounded-full transition-colors duration-200 ease-in-out";
  // Style for the logout button (looks similar to links)
  const logoutButtonClass = "px-5 py-2 text-gray-700 font-medium hover:bg-red-100 rounded-full transition-colors duration-200 ease-in-out cursor-pointer";


  return (
    <div className="w-full flex justify-center py-6">
      <nav className="flex items-center space-x-2 bg-white shadow-lg rounded-full px-4 py-2">
        
        <Link to={'/'} className={navLinkClass}>Home</Link>
        <Link to={'/about'} className={navLinkClass}>About</Link>

        {loading ? (
          <span className="px-5 py-2 text-gray-400 font-medium">Loading...</span>
        ) : user ? (
          // --- If User is Logged In ---
          <>
            {user.role === 'user' && (
              <Link to={'/userdash'} className={navLinkClass}>User Dashboard</Link>
            )}
            {user.role === 'club' && (
              <Link to={'/clubdash'} className={navLinkClass}>Club Dashboard</Link>
            )}
            {/* 7. Add the Logout button */}
            <button onClick={handleLogout} className={logoutButtonClass}>
              Sign Out
            </button>
          </>
        ) : (
          // --- If User is NOT Logged In ---
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
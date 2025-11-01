// frontend/src/components/Navbar.jsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { useAuth } from '../AuthContext'; 

const Navbar = () => {
  const navigate = useNavigate();
 
  const { user, logout } = useAuth(); 

 
  const isLoggedIn = !!user; 

  const handleLogout = () => {
    logout(); 
    navigate('/login'); 
  };

  return (
    <nav className="bg-indigo-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          Connecting 🐾
        </Link>
        <div className="flex gap-6 items-center">
          {/* Home is always visible */}
          <Link to="/" className="hover:text-indigo-200">Home</Link>

          {/* Show these links always; ProtectedRoute will block access if not logged in */}
          <Link to="/add-pet" className="hover:text-indigo-200">Add Pet</Link>
          <Link to="/my-posts" className="hover:text-indigo-200">My Posts</Link>
          {isLoggedIn ? (
            <button 
              onClick={handleLogout} 
              className="bg-red-500 px-4 py-2 rounded font-semibold hover:bg-red-600"
            >
              Logout ({user.name})
            </button>
          ) : (
            <Link 
              to="/login" 
              className="bg-white text-indigo-600 px-4 py-2 rounded font-semibold hover:bg-gray-100"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
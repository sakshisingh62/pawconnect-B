// frontend/src/pages/LoginPage.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const navigate = useNavigate();
  
  const { user, loading, error, login } = useAuth(); 


  useEffect(() => {
    if (user) {
      navigate('/');
    }
   
    return () => login && login.error && (login.error = null); 
  }, [user, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    
    try {
    
      await login(email, password);
      
    } catch (err) {
      console.error(err.message); 
      // alert(`Login Failed: ${err.message}`); //
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-3xl font-bold text-center mb-6">Sign In</h1>
     
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>} 
      
      <form onSubmit={submitHandler} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
     
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        {/* Password Input */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3"
            id="password"
            type="password"
            placeholder="******************"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <div className="flex items-center justify-between">
          <button
            className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            type="submit"
            disabled={loading} 
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
          
          <Link
            className="inline-block align-baseline font-bold text-sm text-indigo-600 hover:text-indigo-800"
            to="/signup"
          >
            Don't have an account? Sign Up
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
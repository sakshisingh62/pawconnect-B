// frontend/src/AuthContext.jsx

import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';


const AuthContext = createContext();


const API_URL = import.meta.env.VITE_API_BASE_URL + '/auth';


export const AuthProvider = ({ children }) => {
  
  const initialUser = localStorage.getItem('userInfo') 
    ? JSON.parse(localStorage.getItem('userInfo')) 
    : null;
    
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

 
  const register = async (name, email, password, phone) => {
    setLoading(true);
    setError(null);
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const { data } = await axios.post(
        `${API_URL}/register`,
        { name, email, password, phone },
        config
      );

    
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      setLoading(false);
      return data;

    } catch (err) {
      const errorMessage = err.response && err.response.data.message 
        ? err.response.data.message 
        : err.message;
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);    }
  };


  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const { data } = await axios.post(
        `${API_URL}/login`,
        { email, password },
        config
      );

      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      setLoading(false);
      return data;
    } catch (err) {
      const errorMessage = err.response && err.response.data.message 
        ? err.response.data.message 
        : err.message;
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };
  

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
  };


  return (
    <AuthContext.Provider value={{ user, loading, error, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. Custom Hook
export const useAuth = () => {
  return useContext(AuthContext);
};
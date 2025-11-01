

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AddPetPage from './pages/AddPetPage';
import MyPostsPage from './pages/MyPostsPage';
import PetDetailsPage from './pages/PetDetailsPage';
import EditPetPage from './pages/EditPetPage';


function App() {
  return (
   
    <div className="flex flex-col min-h-screen"> 
      <Navbar />
      <main className="grow container mx-auto px-4 py-8">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/pet/:id" element={<PetDetailsPage />} />
          
         
          <Route 
            path="/add-pet" 
            element={<ProtectedRoute><AddPetPage /></ProtectedRoute>} 
          />
           <Route 
            path="/my-posts" 
            element={<ProtectedRoute><MyPostsPage /></ProtectedRoute>} 
          /> 
          <Route 
            path="/edit-pet/:id" 
            element={<ProtectedRoute><EditPetPage /></ProtectedRoute>} 
          />
        </Routes>
        
      </main>
      <Footer /> 
    </div>
  );
}

export default App;
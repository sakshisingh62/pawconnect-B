// frontend/src/pages/HomePage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const HomePage = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  

  const [keyword, setKeyword] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [searchLocation, setSearchLocation] = useState('');

 
  const fetchPets = async () => {
    try {
      setLoading(true);
      setError(null);
      
   
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (selectedType !== 'All') params.append('type', selectedType);
      if (searchLocation) params.append('location', searchLocation);

  const url = `${API_BASE_URL}/pets${params.toString() ? '?' + params.toString() : ''}`;
  console.log('Fetching pets from URL:', url);
  const { data } = await axios.get(url);
      
      setPets(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching pets', err);
      // Log additional response details when available to help debugging
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
      } else {
        console.error('Request error:', err.message);
      }
      setError('Failed to fetch pets. Please check the server connection or open the devtools network tab for details.');
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchPets();
  
  }, [keyword, selectedType, searchLocation]); 
  
 
  const handleSearchSubmit = (e) => {
      e.preventDefault();
     
      fetchPets(); 
  };
  
 
  const handleTypeChange = (e) => {
      setSelectedType(e.target.value);
    
  };


  return (
    <div className="py-8">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">
        Find your new best friend
      </h1>
      
      {/* 🔍 Search Bar Component */}
      <form onSubmit={handleSearchSubmit} className="max-w-4xl mx-auto mb-10 p-6 bg-white shadow-lg rounded-xl flex flex-col md:flex-row gap-4">
        
        {/* Keyword Search */}
        <input 
          type="text"
          placeholder="Search by name, breed, or description..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="grow border border-gray-300 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500"
        />
        
        {/* Type Filter */}
        <select 
          value={selectedType}
          onChange={handleTypeChange}
          className="border border-gray-300 rounded-lg p-3 md:w-40 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="All">All Types</option>
          <option value="Dog">Dog</option>
          <option value="Cat">Cat</option>
          <option value="Other">Other</option>
        </select>
        
        {/* Location Filter */}
        <input 
          type="text"
          placeholder="Location (City/Area)"
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
          className="border border-gray-300 rounded-lg p-3 md:w-48 focus:ring-indigo-500 focus:border-indigo-500"
        />

        <button type="submit" className="bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700 transition md:w-32">
          Search
        </button>
      </form>
      {/* End Search Bar */}

      {loading ? (
        <p className="text-center text-indigo-600 text-lg">Loading pets...</p>
      ) : error ? (
        <p className="text-center text-red-600 text-lg">{error}</p>
      ) : pets.length === 0 ? (
        <p className="text-center text-gray-500 text-xl p-10">
          No pets found matching your criteria. Try adjusting your search filters.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {pets.map((pet) => (
            <Link key={pet._id} to={`/pet/${pet._id}`}>
              <div className="border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden bg-white">
                <img 
                  src={pet.imageUrl || 'https://via.placeholder.com/300/e0e0e0?text=No+Image'} 
                  alt={pet.name} 
                  className="w-full h-48 object-cover" 
                />
                <div className="p-4">
                  <h3 className="text-2xl font-bold text-indigo-700 truncate">{pet.name}</h3>
                  <p className="text-gray-600 mt-1">
                    {pet.type} ({pet.breed})
                  </p>
                  <p className="text-sm text-gray-500 mt-2 flex items-center">
                    📍 {pet.location} | Age: {pet.age}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
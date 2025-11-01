// frontend/src/pages/MyPostsPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext'; 

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const MyPostsPage = () => {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null); 


  const fetchMyPets = async () => {
    
    if (!user || !user.token) {
        setError('Authorization failed. Please log in.');
        setLoading(false);
        return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`${API_BASE_URL}/pets/mypets`, config);
      setPets(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching my pets:", err);
      setError(err.response?.data?.message || 'Failed to fetch your posts.');
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchMyPets();
  }, [user]); 

 
  const handleDelete = async (petId) => {
    if (window.confirm('Are you sure you want to delete this pet post? This action cannot be undone.')) {
        try {
            setDeletingId(petId);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
      console.log('Requesting delete for petId:', petId);

      if (!petId) {
        throw new Error('Invalid pet id');
      }

      const { data } = await axios.delete(`${API_BASE_URL}/pets/${petId}`, config);
      console.log('Delete response:', data);

      // Try to re-fetch the user's pets to ensure UI matches server state
      try {
        await fetchMyPets();
      } catch (fetchErr) {
        console.error('Failed to re-fetch pets after delete:', fetchErr);
        // fallback: remove locally so UI stays responsive
        setPets((prev) => prev.filter((p) => p._id !== petId));
      }

      alert('Pet post deleted successfully!');
        } catch (err) {
            console.error("Error deleting pet:", err);
            setError(err.response?.data?.message || 'Failed to delete pet.');
        } finally {
            setDeletingId(null);
        }
    }
  };

  return (
    <div className="py-8">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">
        My Posts ({pets.length})
      </h1>
      
      {loading ? (
        <p className="text-center text-indigo-600 text-lg">Loading your posts...</p>
      ) : error ? (
        <p className="text-center text-red-600 text-lg">{error}</p>
      ) : pets.length === 0 ? (
        <div className="text-center text-gray-600 text-lg p-10 border rounded-lg max-w-xl mx-auto">
            <p className="mb-4">You haven't posted any pets yet.</p>
            <Link to="/add-pet" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                Post Your First Pet
            </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <div key={pet._id} className="border border-indigo-100 rounded-xl shadow-md overflow-hidden bg-white relative">
              
              {/* Pet Image and Details */}
              <img 
                src={pet.imageUrl || 'https://via.placeholder.com/300/e0e0e0?text=No+Image'} 
                alt={pet.name} 
                className="w-full h-48 object-cover" 
              />
              <div className="p-4">
                <h3 className="text-xl font-bold text-indigo-700 truncate">{pet.name}</h3>
                <p className="text-gray-600 mt-1">{pet.type} ({pet.breed})</p>
                
                <div className="mt-4 flex justify-between space-x-2">
                    {/* Update/Edit Button */}
                    <Link to={`/edit-pet/${pet._id}`} 
                          className="flex-1 text-center py-2 text-sm border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition">
                        Edit
                    </Link>
                    
                 
                    <button 
                        onClick={() => handleDelete(pet._id)} 
                        disabled={deletingId === pet._id} // डिलीट होने पर डिसेबल करें
                        className={`flex-1 py-2 text-sm text-white rounded-lg transition ${
                            deletingId === pet._id 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-red-500 hover:bg-red-600'
                        }`}
                    >
                        {deletingId === pet._id ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPostsPage;
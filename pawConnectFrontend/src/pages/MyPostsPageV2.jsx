import { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit, Trash2, Eye, EyeOff, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function MyPostsPageV2() {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, available, adopted, pending
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (user) {
      fetchMyPets();
    }
  }, [user]);

  const fetchMyPets = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/pets/mypets`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setPets(response.data || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch your pets. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deletePet = async (petId) => {
    try {
      setDeletingId(petId);
      await axios.delete(`${API_BASE_URL}/pets/${petId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setPets(prev => prev.filter(p => p._id !== petId));
      setDeleteConfirm(null);
    } catch (err) {
      alert('Failed to delete pet. Please try again.');
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredPets = pets.filter(pet => {
    if (filter === 'all') return true;
    return pet.adoptionStatus === filter;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'available': return 'bg-green-100 text-green-700 border-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'adopted': return 'bg-blue-100 text-blue-700 border-blue-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'available': return <CheckCircle size={16} />;
      case 'adopted': return <Eye size={16} />;
      case 'pending': return <EyeOff size={16} />;
      default: return null;
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <AlertCircle size={48} className="text-yellow-600 mx-auto mb-4" />
          <p className="text-xl text-gray-600">Please login to view your posts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">My Pet Listings</h1>
          <p className="text-blue-100 text-lg">Manage your posted pets and track adoption progress</p>
          <a
            href="/add-pet"
            className="inline-block mt-4 px-6 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition font-bold"
          >
            + Add New Pet
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Filter Buttons */}
        <div className="mb-8 flex flex-wrap gap-3">
          {['all', 'available', 'pending', 'adopted'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-600'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              <span className="ml-2 bg-gray-300 px-2 py-1 rounded-full text-sm">
                {pets.filter(p => p.adoptionStatus === (status === 'all' ? p.adoptionStatus : status)).length}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <Loader size={48} className="animate-spin text-blue-600" />
          </div>
        ) : filteredPets.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl">
            <AlertCircle size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600 mb-4">
              {filter === 'all' ? 'You haven\'t posted any pets yet' : `No ${filter} pets`}
            </p>
            <a
              href="/add-pet"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Post Your First Pet
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredPets.map(pet => (
              <div key={pet._id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
                  {/* Pet Image */}
                  <div className="relative h-48 md:h-auto rounded-lg overflow-hidden bg-gray-200">
                    <img
                      src={pet.imageUrl || pet.images?.[0] || '/placeholder-pet.jpg'}
                      alt={pet.name}
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 ${getStatusColor(pet.adoptionStatus)}`}>
                      {getStatusIcon(pet.adoptionStatus)}
                      {pet.adoptionStatus?.toUpperCase()}
                    </div>
                  </div>

                  {/* Pet Details */}
                  <div className="md:col-span-2 flex flex-col justify-center">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{pet.name}</h3>
                    <div className="space-y-2 text-gray-600">
                      <p><span className="font-semibold">Breed:</span> {pet.breed}</p>
                      <p><span className="font-semibold">Age:</span> {pet.age} years</p>
                      <p><span className="font-semibold">Type:</span> {pet.type?.toUpperCase()}</p>
                      <p><span className="font-semibold">Location:</span> {pet.location?.city}</p>
                    </div>
                    {pet.tags && pet.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {pet.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-semibold">
                            {tag}
                          </span>
                        ))}
                        {pet.tags.length > 3 && (
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-semibold">
                            +{pet.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Stats & Actions */}
                  <div className="flex flex-col justify-between">
                    {/* Stats */}
                    <div className="space-y-3 mb-6">
                      <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <p className="text-xs text-blue-600 font-semibold mb-1">VIEWS</p>
                        <p className="text-2xl font-bold text-blue-700">{pet.views || 0}</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg text-center">
                        <p className="text-xs text-green-600 font-semibold mb-1">FAVORITES</p>
                        <p className="text-2xl font-bold text-green-700">{pet.favoriteCount || 0}</p>
                      </div>
                      {pet.adoptionStatus === 'pending' && (
                        <div className="bg-yellow-50 p-3 rounded-lg text-center">
                          <p className="text-xs text-yellow-600 font-semibold mb-1">REQUESTS</p>
                          <p className="text-2xl font-bold text-yellow-700">{pet.adoptionRequests || 0}</p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      <a
                        href={`/pet-details/${pet._id}`}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-center text-sm"
                      >
                        View
                      </a>
                      <a
                        href={`/edit-pet/${pet._id}`}
                        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold text-center text-sm flex items-center justify-center gap-2"
                      >
                        <Edit size={18} />
                        Edit
                      </a>
                      <button
                        onClick={() => setDeleteConfirm(pet._id)}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold text-sm flex items-center justify-center gap-2"
                      >
                        <Trash2 size={18} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Delete Pet Listing?</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this pet listing? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => deletePet(deleteConfirm)}
                disabled={deletingId === deleteConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:bg-gray-400"
              >
                {deletingId === deleteConfirm ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

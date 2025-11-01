import { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, MapPin, Filter, X, Loader } from 'lucide-react';
import { useAuth } from '../AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function HomePageV2() {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState(new Set());

  // Filter state
  const [filters, setFilters] = useState({
    type: '',
    city: '',
    breed: '',
    minAge: '',
    maxAge: '',
    size: '',
    vaccinated: false,
  });

  // Fetch pets
  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async (appliedFilters = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const response = await axios.get(`${API_BASE_URL}/pets?${params.toString()}`);
      setPets(response.data || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch pets. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const applyFilters = () => {
    fetchPets(filters);
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFilters({
      type: '',
      city: '',
      breed: '',
      minAge: '',
      maxAge: '',
      size: '',
      vaccinated: false,
    });
    fetchPets({});
  };

  const toggleFavorite = async (petId) => {
    if (!user) {
      alert('Please login to add favorites');
      return;
    }
    try {
      const newFavorites = new Set(favorites);
      if (newFavorites.has(petId)) {
        await axios.delete(`${API_BASE_URL}/pets/${petId}/favorite`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        newFavorites.delete(petId);
      } else {
        await axios.post(`${API_BASE_URL}/pets/${petId}/favorite`, {}, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        newFavorites.add(petId);
      }
      setFavorites(newFavorites);
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl font-bold mb-4">Find Your Perfect Pet</h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Connect with loving pets in your community. Adopt, rehome, and build lasting bonds.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="sticky top-0 z-40 bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-xs">
              <input
                type="text"
                placeholder="Search pet name or location..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Filter size={20} />
              Filters
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Pet Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Pet Type</label>
                  <select
                    name="type"
                    value={filters.type}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Types</option>
                    <option value="dog">🐕 Dog</option>
                    <option value="cat">🐈 Cat</option>
                    <option value="rabbit">🐰 Rabbit</option>
                    <option value="bird">🦜 Bird</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Size */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Size</label>
                  <select
                    name="size"
                    value={filters.size}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Sizes</option>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                {/* Age Range */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Age (Years)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="minAge"
                      placeholder="Min"
                      value={filters.minAge}
                      onChange={handleFilterChange}
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="number"
                      name="maxAge"
                      placeholder="Max"
                      value={filters.maxAge}
                      onChange={handleFilterChange}
                      className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                {/* Vaccinated */}
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="vaccinated"
                      checked={filters.vaccinated}
                      onChange={handleFilterChange}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm font-semibold text-gray-700">Vaccinated Only</span>
                  </label>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={applyFilters}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Apply Filters
                </button>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition font-semibold"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <Loader size={48} className="animate-spin text-blue-600" />
          </div>
        ) : pets.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-2xl text-gray-600 mb-4">No pets found matching your criteria</p>
            <button
              onClick={resetFilters}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              View All Pets
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-8">
              Available Pets ({pets.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pets.map(pet => (
                <div
                  key={pet._id}
                  className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
                >
                  {/* Pet Image */}
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    <img
                      src={pet.imageUrl || pet.images?.[0] || '/placeholder-pet.jpg'}
                      alt={pet.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(pet._id)}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition"
                    >
                      <Heart
                        size={24}
                        className={favorites.has(pet._id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}
                      />
                    </button>
                    {/* Pet Type Badge */}
                    <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {pet.type?.toUpperCase() || 'PET'}
                    </div>
                  </div>

                  {/* Pet Info */}
                  <div className="p-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{pet.name}</h3>
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Breed:</span> {pet.breed || 'Not specified'}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Age:</span> {pet.age || '?'} years
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin size={16} />
                        {pet.location?.city || 'Location unknown'}
                      </p>
                      {pet.vaccinated && (
                        <p className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded inline-block font-semibold">
                          ✓ Vaccinated
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => window.location.href = `/pet-details/${pet._id}`}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
                      >
                        View Details
                      </button>
                      {user && user._id !== pet.owner && (
                        <button
                          onClick={() => window.location.href = `/pet-details/${pet._id}#contact`}
                          className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-sm"
                        >
                          Contact
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

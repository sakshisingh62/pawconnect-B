import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Star, MapPin, Phone, Mail, AlertCircle, Loader, Heart } from 'lucide-react';
import { useAuth } from '../AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function PetDetailsPageV2() {
  const { id } = useParams();
  const { user } = useAuth();
  const [pet, setPet] = useState(null);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    fetchPetDetails();
  }, [id]);

  const fetchPetDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/pets/${id}`);
      setPet(response.data);
      setReviews(response.data.reviews || []);
      // Fetch owner details
      if (response.data.owner) {
        const ownerResponse = await axios.get(`${API_BASE_URL}/users/${response.data.owner}`);
        setOwner(ownerResponse.data);
      }
    } catch (err) {
      console.error('Error fetching pet details:', err);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to submit a review');
      return;
    }
    try {
      setSubmittingReview(true);
      await axios.post(
        `${API_BASE_URL}/pets/${id}/review`,
        { rating, comment: reviewText },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setReviewText('');
      setRating(5);
      fetchPetDetails();
    } catch (err) {
      alert('Failed to submit review');
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      alert('Please login to add favorites');
      return;
    }
    try {
      if (isFavorited) {
        await axios.delete(`${API_BASE_URL}/pets/${id}/favorite`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
      } else {
        await axios.post(`${API_BASE_URL}/pets/${id}/favorite`, {}, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
      }
      setIsFavorited(!isFavorited);
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader size={48} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-600 mx-auto mb-4" />
          <p className="text-xl text-gray-600">Pet not found</p>
        </div>
      </div>
    );
  }

  const images = pet.images && pet.images.length > 0 ? pet.images : ['/placeholder-pet.jpg'];
  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold">{pet.name}</h1>
          <p className="text-blue-100 text-lg mt-2">{pet.breed} • {pet.age} years old</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image Gallery & Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="relative h-96 bg-gray-200">
                <img
                  src={images[currentImageIndex]}
                  alt={`${pet.name} image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white px-3 py-2 rounded-full"
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white px-3 py-2 rounded-full"
                    >
                      Next →
                    </button>
                  </>
                )}
                <button
                  onClick={toggleFavorite}
                  className="absolute top-4 right-4 p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition"
                >
                  <Heart
                    size={28}
                    className={isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}
                  />
                </button>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 p-4 bg-gray-100 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                        idx === currentImageIndex ? 'border-blue-600' : 'border-gray-300'
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Pet Details */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">About {pet.name}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-gray-600 text-sm font-semibold">Type</p>
                  <p className="text-lg font-bold text-gray-800">{pet.type?.charAt(0).toUpperCase() + pet.type?.slice(1)}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-gray-600 text-sm font-semibold">Size</p>
                  <p className="text-lg font-bold text-gray-800">{pet.size?.charAt(0).toUpperCase() + pet.size?.slice(1)}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-gray-600 text-sm font-semibold">Gender</p>
                  <p className="text-lg font-bold text-gray-800">{pet.gender?.charAt(0).toUpperCase() + pet.gender?.slice(1)}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-gray-600 text-sm font-semibold">Color</p>
                  <p className="text-lg font-bold text-gray-800">{pet.color || 'N/A'}</p>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed mb-6">{pet.description || 'No description available'}</p>

              {/* Health Info */}
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-6">
                <h3 className="font-bold text-gray-800 mb-2">Health Status</h3>
                <div className="flex gap-6">
                  <div>
                    <p className="text-sm text-gray-600">Vaccinated</p>
                    <p className="font-bold text-lg text-green-600">{pet.healthInfo?.vaccinated ? '✓ Yes' : '✗ No'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Neutered</p>
                    <p className="font-bold text-lg text-green-600">{pet.healthInfo?.neutered ? '✓ Yes' : '✗ No'}</p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {pet.tags && pet.tags.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-800 mb-3">Personality Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {pet.tags.map(tag => (
                      <span key={tag} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Reviews ({reviews.length})</h2>

              {/* Rating Summary */}
              {reviews.length > 0 && (
                <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={24}
                          className={i < Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <span className="text-2xl font-bold text-gray-800">{avgRating}</span>
                    <span className="text-gray-600">out of 5</span>
                  </div>
                </div>
              )}

              {/* Add Review Form */}
              {user && user._id !== pet.owner && (
                <form onSubmit={submitReview} className="mb-8 p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-4">Leave a Review</h3>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setRating(val)}
                          className="transition transform hover:scale-110"
                        >
                          <Star
                            size={32}
                            className={val <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Your Review</label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Share your experience..."
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-400"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-gray-600">No reviews yet. Be the first to review!</p>
                ) : (
                  reviews.map((review, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">{review.rating}/5</span>
                      </div>
                      <p className="text-gray-700 mb-2">{review.comment}</p>
                      <p className="text-xs text-gray-500">{review.reviewer || 'Anonymous'}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Owner Info & Contact */}
          <div className="lg:col-span-1 space-y-6">
            {/* Owner Card */}
            {owner && (
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-20">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Contact Pet Owner</h3>

                {/* Owner Profile */}
                <div className="text-center mb-6 pb-6 border-b border-gray-200">
                  {owner.profilePicture && (
                    <img
                      src={owner.profilePicture}
                      alt={owner.name}
                      className="w-16 h-16 rounded-full mx-auto mb-3 object-cover"
                    />
                  )}
                  <h4 className="text-lg font-bold text-gray-800">{owner.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{owner.userType}</p>

                  {/* Owner Rating */}
                  <div className="flex justify-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < Math.round(owner.ratings?.average || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{owner.ratings?.count || 0} reviews</p>
                </div>

                {/* Contact Info */}
                <div className="space-y-3">
                  {owner.location && (
                    <div className="flex items-center gap-3">
                      <MapPin size={20} className="text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-600">Location</p>
                        <p className="text-sm font-semibold text-gray-800">
                          {owner.location.city}, {owner.location.state}
                        </p>
                      </div>
                    </div>
                  )}

                  {owner.email && (
                    <div className="flex items-center gap-3">
                      <Mail size={20} className="text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-600">Email</p>
                        <a href={`mailto:${owner.email}`} className="text-sm font-semibold text-blue-600 hover:underline">
                          {owner.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {owner.phone && (
                    <div className="flex items-center gap-3">
                      <Phone size={20} className="text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-600">Phone</p>
                        <a href={`tel:${owner.phone}`} className="text-sm font-semibold text-blue-600 hover:underline">
                          {owner.phone}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Contact Buttons */}
                <div className="mt-6 space-y-2">
                  <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
                    Send Message
                  </button>
                  <button className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold">
                    Request Adoption
                  </button>
                </div>
              </div>
            )}

            {/* Status Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Adoption Status</h3>
              <div className={`p-4 rounded-lg text-center font-bold text-lg ${
                pet.adoptionStatus === 'available' ? 'bg-green-100 text-green-700' :
                pet.adoptionStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {pet.adoptionStatus?.toUpperCase() || 'AVAILABLE'}
              </div>
              {pet.adoptionRequirements && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs font-semibold text-blue-900 mb-2">Adoption Requirements:</p>
                  <p className="text-sm text-blue-800">{pet.adoptionRequirements}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AddPetPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [type, setType] = useState('Dog');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  // 🌍 Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setGettingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );
          const data = await response.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.display_name?.split(',')[0];
          setLocation(city || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } catch (err) {
          console.error('Error getting location:', err);
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } finally {
          setGettingLocation(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Unable to get location. Please enter manually.';
        if (error.code === error.PERMISSION_DENIED)
          errorMessage = 'Location access denied. Please allow location permission.';
        else if (error.code === error.POSITION_UNAVAILABLE)
          errorMessage = 'Location unavailable.';
        else if (error.code === error.TIMEOUT)
          errorMessage = 'Location request timed out.';
        setError(errorMessage);
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  // 🖼️ Image upload handler
  const uploadFileHandler = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  // 🐾 Submit pet form
  const submitHandler = async (e) => {
    e.preventDefault();
    setError(null);

    // 🔐 Check login
    if (!user || !user.token) {
      setError('Please log in to post a pet.');
      return;
    }

    // 🧾 Check required fields
    if (!name || !type || !breed || !age || !location || !description || !imageFile) {
      setError('Please fill all required fields and upload an image.');
      return;
    }

    let imageUrl = '';

    try {
      // 📤 Step 1: Upload image
      setUploading(true);

      const formData = new FormData();
      formData.append('image', imageFile);

      const uploadConfig = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data: uploadData } = await axios.post(
        `${API_BASE_URL}/upload`,
        formData,
        uploadConfig
      );

      console.log('Upload response:', uploadData);

      imageUrl = uploadData.imageUrl;
      // show preview so user can confirm the uploaded image
      if (imageUrl) setImagePreview(imageUrl);
      setUploading(false);

      // 📝 Step 2: Post pet data
      setLoading(true);

      const petData = {
        name,
        type,
        breed,
        age: parseInt(age),
        location,
        description,
        imageUrl,
        contact: user.phone || user.email || 'Not provided',
      };

      const petConfig = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };

      await axios.post(`${API_BASE_URL}/pets`, petData, petConfig);

      setLoading(false);
      alert('🎉 Pet posted successfully!');
      navigate('/my-posts');
    } catch (err) {
      console.error('Error posting pet:', err);

      // 📛 Handle upload or post error
      setUploading(false);
      setLoading(false);

      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError(err.response?.data?.message || 'Failed to post pet. Try again later.');
      }
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-xl rounded-lg">
      <h1 className="text-3xl font-bold text-center mb-8">🐶 Post a Pet for Adoption</h1>

      {(error || uploading) && (
        <div
          className={`p-3 mb-4 rounded ${
            uploading
              ? 'bg-blue-100 text-blue-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {uploading ? 'Uploading Image...' : error}
        </div>
      )}

      <form onSubmit={submitHandler} className="space-y-4">
        {/* Preview of uploaded image (if any) */}
        {imagePreview && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Uploaded image preview:</p>
            <img src={imagePreview} alt="Preview" className="w-full h-56 object-cover rounded-md" />
          </div>
        )}
        {/* Pet Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Pet Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          >
            <option value="Dog">Dog</option>
            <option value="Cat">Cat</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Breed */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Breed</label>
          <input
            type="text"
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>

        {/* Age */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Age (Years)</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1 block flex-1 border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={gettingLocation}
              className={`mt-1 px-3 py-2 text-sm font-medium rounded-md ${
                gettingLocation
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {gettingLocation ? 'Getting...' : '📍 Current'}
            </button>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Pet Image (Max 5MB)</label>
          <input
            type="file"
            accept="image/*"
            onChange={uploadFileHandler}
            className="mt-1 block w-full text-sm text-gray-500 
                       file:mr-4 file:py-2 file:px-4 file:rounded-full 
                       file:border-0 file:text-sm file:font-semibold 
                       file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || uploading}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            loading || uploading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {loading ? 'Posting Pet...' : uploading ? 'Uploading...' : 'Post Pet'}
        </button>
      </form>
    </div>
  );
};

export default AddPetPage;

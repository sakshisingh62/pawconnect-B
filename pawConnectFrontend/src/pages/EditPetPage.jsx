import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const EditPetPage = () => {
    const navigate = useNavigate();
    const { id: petId } = useParams(); 
    const { user } = useAuth();
    
   
    const [name, setName] = useState('');
    const [type, setType] = useState('Dog');
    const [breed, setBreed] = useState('');
    const [age, setAge] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [adopted, setAdopted] = useState(false); 
    const [currentImageUrl, setCurrentImageUrl] = useState(''); 
    const [imageFile, setImageFile] = useState(null); 
    
  
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true); 
    const [submitting, setSubmitting] = useState(false); 
    const [error, setError] = useState(null);

   
    useEffect(() => {
        const fetchPet = async () => {
            if (!user || !user.token) {
                navigate('/login');
                return;
            }
            try {
                setLoading(true);
                const { data } = await axios.get(`${API_BASE_URL}/pets/${petId}`);
                
             
                if (data.user._id !== user._id) {
                    setError('You are not authorized to edit this pet.');
                    setLoading(false);
                    return;
                }

               
                setName(data.name);
                setType(data.type);
                setBreed(data.breed || '');
                setAge(data.age);
                setLocation(data.location);
                setDescription(data.description);
                setAdopted(data.adopted);
                setCurrentImageUrl(data.imageUrl);
                setLoading(false);

            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch pet data.');
                setLoading(false);
            }
        };

        if (petId) {
            fetchPet();
        }
    }, [petId, user, navigate]);

    
    const uploadFileHandler = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
        }
    };

   
    const submitHandler = async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        let finalImageUrl = currentImageUrl;

        try {
           
            if (imageFile) {
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
                
                finalImageUrl = uploadData.imageUrl;
                setUploading(false);
            }

         
            const updateConfig = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const petData = {
                name,
                type,
                breed,
                age,
                location,
                description,
                adopted, 
                imageUrl: finalImageUrl,
            };

            await axios.put(
                `${API_BASE_URL}/pets/${petId}`, 
                petData, 
                updateConfig
            );
            
            setSubmitting(false);
            alert('Pet updated successfully!');
            navigate('/my-posts'); 
            
        } catch (err) {
            console.error(err);
            setUploading(false);
            setSubmitting(false);
            setError(err.response?.data?.message || 'Failed to update pet.');
        }
    };

    if (loading) return <p className="text-center mt-10 text-xl text-indigo-600">Loading Pet Data...</p>;

    return (
        <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-xl rounded-lg">
            <h1 className="text-3xl font-bold text-center mb-8">Edit Pet: {name}</h1>
            
            {(error || uploading) && (
                <div className={`p-3 mb-4 rounded ${uploading ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                    {uploading ? 'Uploading New Image...' : error}
                </div>
            )}
            
            <form onSubmit={submitHandler} className="space-y-4">
                {/* Pet Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Pet Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                           className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
                </div>

                {/* Type (Dog/Cat) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select value={type} onChange={(e) => setType(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
                        <option value="Dog">Dog</option>
                        <option value="Cat">Cat</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                
                {/* Breed */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Breed (e.g., Labrador)</label>
                    <input type="text" value={breed} onChange={(e) => setBreed(e.target.value)}
                           className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
                </div>
                
                {/* Age (Number) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Age (Years)</label>
                    <input type="number" value={age} onChange={(e) => setAge(e.target.value)}
                           className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
                </div>
                
                {/* Location */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Location (City/Area)</label>
                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                           className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
                </div>
                
                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                           rows="4" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
                </div>
                
                {/* Status: Adopted Checkbox */}
                <div className="flex items-center space-x-2 border p-3 rounded-md bg-gray-50">
                    <input 
                        type="checkbox" 
                        id="adopted"
                        checked={adopted} 
                        onChange={(e) => setAdopted(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                    <label htmlFor="adopted" className="text-sm font-medium text-gray-700">
                        Mark as Adopted (This pet has found a new home)
                    </label>
                </div>

                {/* Current Image Preview */}
                <div className="pt-2">
                    <label className="block text-sm font-medium text-gray-700">Current Image</label>
                    {currentImageUrl ? (
                        <img src={currentImageUrl} alt="Current Pet" className="h-32 w-32 object-cover rounded-lg mt-2 border" />
                    ) : (
                        <p className="text-gray-500 text-sm mt-2">No current image.</p>
                    )}
                </div>

                {/* New Image Upload (Optional) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Upload New Image (Optional)</label>
                    <input type="file" onChange={uploadFileHandler}
                           className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={submitting || uploading}
                    className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                        submitting || uploading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                >
                    {submitting ? 'Updating Pet...' : (uploading ? 'Uploading...' : 'Update Pet')}
                </button>
            </form>
        </div>
    );
};

export default EditPetPage;
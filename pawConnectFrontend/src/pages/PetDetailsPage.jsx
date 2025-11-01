// frontend/src/pages/PetDetailsPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext'; 


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const PetDetailsPage = () => {
   
    const { id: petId } = useParams();
    const { user } = useAuth();
    
 
    const [pet, setPet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

  
    useEffect(() => {
        const fetchPet = async () => {
            try {
                setLoading(true);
              
                const { data } = await axios.get(`${API_BASE_URL}/pets/${petId}`); 
                setPet(data);
                setLoading(false);
            } catch (err) {
             
                console.error("Error fetching pet details:", err);
                setError(err.response?.data?.message || 'Failed to fetch pet details. Server might be down.');
                setLoading(false);
            }
        };

        if (petId) {
            fetchPet();
        }
       
    }, [petId]);

   
    if (loading) {
        return <p className="text-center text-indigo-600 text-xl mt-10">Loading Pet Details...</p>;
    }

    if (error) {
        return <p className="text-center text-red-600 text-xl mt-10">{error}</p>;
    }

    if (!pet) {
        return <p className="text-center text-gray-500 text-xl mt-10">Pet not found.</p>;
    }
    
   
    const owner = pet.user;
    
   
    const isOwner = user && owner && user._id === owner._id;


    return (
        <div className="max-w-4xl mx-auto my-10 bg-white p-8 shadow-2xl rounded-xl">
           
            {pet.adopted && (
                <div className="mb-6 text-center">
                     <span className="bg-red-500 text-white text-xl font-bold px-4 py-2 rounded-full shadow-lg">
                        ADOPTED - Not Available
                    </span>
                </div>
            )}
            
            <div className="md:flex md:space-x-8">
                {/* Pet Image */}
                <div className="md:w-1/2">
                    <img 
                        src={pet.imageUrl || 'https://via.placeholder.com/600x400?text=Pet+Image'} 
                        alt={pet.name} 
                        className="rounded-lg w-full h-auto object-cover shadow-lg"
                    />
                </div>
                
                {/* Pet Details */}
                <div className="md:w-1/2 mt-6 md:mt-0 space-y-4">
                    <h1 className="text-4xl font-extrabold text-indigo-700">{pet.name}</h1>
                    
                    <div className="flex space-x-4 text-lg">
                        <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-medium">
                            {pet.type} ({pet.breed})
                        </span>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                            Age: {pet.age} Years
                        </span>
                    </div>

                    <p className="text-lg text-gray-700 mt-4 leading-relaxed">
                        {pet.description}
                    </p>
                    
                    <div className="text-gray-600 text-md border-t pt-4">
                        <p className="font-semibold mb-2">Location: <span className="font-normal">{pet.location}</span></p>
                        <p className="font-semibold">Posted By: <span className="font-normal">{owner.name}</span></p>
                    </div>

                    {/* 📞 Contact Owner Section */}
                    <div className="pt-6 border-t mt-6">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Contact for Adoption</h3>
                        
                        {isOwner ? (
                            <p className="text-green-600 font-semibold">
                                This is your post. You can manage it from the "My Posts" page.
                            </p>
                        ) : pet.adopted ? (
                            <p className="text-red-500 font-semibold">
                                This pet has already been adopted and is no longer available for contact.
                            </p>
                        ) : (
                           
                            <>
                                <p className="text-lg mb-4">
                                    Interested in adopting {pet.name}? Contact the owner directly:
                                </p>
                                <div className="space-y-3">
                                    {/* Email Contact */}
                                    <a 
                                        href={`mailto:${owner.email}`}
                                        className="w-full flex items-center justify-center bg-pink-500 text-white py-3 rounded-lg text-lg font-semibold hover:bg-pink-600 transition"
                                    >
                                        📧 Email: {owner.email}
                                    </a>
                                    {/* Phone Contact */}
                                    <a 
                                        href={`tel:${owner.phone}`}
                                        className="w-full flex items-center justify-center bg-indigo-500 text-white py-3 rounded-lg text-lg font-semibold hover:bg-indigo-600 transition"
                                    >
                                        📞 Call: {owner.phone}
                                    </a>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PetDetailsPage;
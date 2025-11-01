// frontend/src/pages/AuthSuccessPage.jsx

import React, { useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const AuthSuccessPage = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { loginFromGoogle } = useContext(AuthContext);

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		const token = params.get('token');
		const name = params.get('name');
		const email = params.get('email');

		if (token && name && email) {
			// Save the received data to your AuthContext
			loginFromGoogle({ token, name, email });
			navigate('/'); // Redirect to the homepage
		} else {
			// Error case
			alert('Google authentication failed. No token received.');
			navigate('/login');
		}
	}, [location.search, navigate, loginFromGoogle]);

	return (
		<div className="text-center mt-20">
			<h1 className="text-2xl text-indigo-600">Completing Google Sign In...</h1>
			<p className="text-gray-500">You will be redirected shortly.</p>
		</div>
	);
};

export default AuthSuccessPage;
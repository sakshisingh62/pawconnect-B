// connectingfrontend/src/components/Footer.jsx

import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white p-4 mt-auto">
      <div className="container mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} Connecting. All rights reserved.</p>
        <p className="text-sm text-gray-400">Adopt a pet, save a life.</p>
      </div>
    </footer>
  );
};

export default Footer;
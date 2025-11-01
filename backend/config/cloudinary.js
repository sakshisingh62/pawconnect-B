const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

// Trim values to avoid accidental leading/trailing spaces from .env
const cloudName = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME.trim();
const apiKey = process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_KEY.trim();
const apiSecret = process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_API_SECRET.trim();

cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
});

module.exports = cloudinary;
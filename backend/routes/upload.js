// backend/routes/upload.js
const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { protect } = require('../middleware/authMiddleware');
const dotenv = require('dotenv');

// Load environment variables early
dotenv.config();

const router = express.Router();

// ⚙️ Cloudinary Configuration
cloudinary.config({
  cloud_name: (process.env.CLOUDINARY_CLOUD_NAME || '').trim(),
  api_key: (process.env.CLOUDINARY_API_KEY || '').trim(),
  api_secret: (process.env.CLOUDINARY_API_SECRET || '').trim(),
});

// Log which Cloudinary variables exist (don’t show real values)
console.log('✅ Cloudinary config presence:', {
  cloud_name: !!process.env.CLOUDINARY_CLOUD_NAME,
  api_key: !!process.env.CLOUDINARY_API_KEY,
  api_secret: !!process.env.CLOUDINARY_API_SECRET,
});

// 💾 Multer: Store file in memory (not disk)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// @desc    Upload Image to Cloudinary
// @route   POST /api/upload
// @access  Private
router.post('/', protect, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file provided.' });
  }

  try {
    // Upload to Cloudinary using base64 data
    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
      {
        folder: 'connecting_pets',
        resource_type: 'image',
      }
    );

    res.status(200).json({
      message: 'Image uploaded successfully',
      imageUrl: result.secure_url,
    });
  } catch (error) {
    console.error('❌ Cloudinary Upload Error:', error.message);

    // Fallback placeholder
    res.status(500).json({
      message: 'Image upload simulated (Cloudinary failed)',
      imageUrl: 'https://via.placeholder.com/300x200?text=Pet+Image',
    });
  }
});

module.exports = router;

// backend/routes/pets.js

const express = require('express');
const router = express.Router();
const {
  getPets,
  getPetById,
  createPet,
  getMyPets,
  updatePet,
  deletePet, // 👈 Import delete function
} = require('../controllers/petController');
const { protect } = require('../middleware/authMiddleware');

// ==========================
// 🟢 Public Routes
// ==========================

// @route   GET /api/pets
// @desc    Get all available pets
// @access  Public
router.get('/', getPets);

// @route   GET /api/pets/mypets
// @desc    Get all pets posted by the logged-in user
// @access  Private
router.get('/mypets', protect, getMyPets);

// @route   GET /api/pets/:id
// @desc    Get a single pet by ID
// @access  Public
router.get('/:id', getPetById);

// @route   PUT /api/pets/:id
// @desc    Update a pet
// @access  Private
router.put('/:id', protect, updatePet);

// @route   DELETE /api/pets/:id
// @desc    Delete a pet
// @access  Private
router.delete('/:id', protect, deletePet);

// Protected route: creating a pet requires authentication
router.post('/', protect, createPet);

module.exports = router;


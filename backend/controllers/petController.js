const Pet = require('../models/Pet.js');

// @desc    Fetch all pets
// @route   GET /api/pets
// @access  Public
const getPets = async (req, res, next) => {
  try {
    
    const pets = await Pet.find({ adopted: false }).populate('user', 'name email'); 
    res.json(pets);
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch single pet
// @route   GET /api/pets/:id
// @access  Public
const getPetById = async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.id).populate('user', 'name email phone');
    if (pet) {
      res.json(pet);
    } else {
      res.status(404);
      throw new Error('Pet not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a pet
// @route   POST /api/pets
// @access  Private
const createPet = async (req, res, next) => {
  try {
    const { name, type, breed, age, location, description, imageUrl, contact } = req.body;
    
    const pet = new Pet({
      name,
      type,
      breed,
      age,
      location,
      description,
      imageUrl, 
      contact,
      user: req.user._id, 
    });

    const createdPet = await pet.save();
    res.status(201).json(createdPet);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's pets (My Posts)
// @route   GET /api/pets/mypets
// @access  Private
const getMyPets = async (req, res, next) => {
  try {
    const pets = await Pet.find({ user: req.user._id });
    res.json(pets);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a pet
// @route   PUT /api/pets/:id
// @access  Private
const updatePet = async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      res.status(404);
      throw new Error('Pet not found');
    }

    // Only owner can update
    if (pet.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this pet');
    }

    const { name, type, breed, age, location, description, imageUrl, contact, adopted } = req.body;

    pet.name = name ?? pet.name;
    pet.type = type ?? pet.type;
    pet.breed = breed ?? pet.breed;
    pet.age = age ?? pet.age;
    pet.location = location ?? pet.location;
    pet.description = description ?? pet.description;
    pet.imageUrl = imageUrl ?? pet.imageUrl;
    pet.contact = contact ?? pet.contact;
    if (typeof adopted !== 'undefined') pet.adopted = adopted;

    const updatedPet = await pet.save();
    res.json(updatedPet);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a pet
// @route   DELETE /api/pets/:id
// @access  Private
const deletePet = async (req, res, next) => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      res.status(404);
      throw new Error('Pet not found');
    }

    // Only owner can delete
    if (pet.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this pet');
    }

    await pet.remove();
    res.json({ message: 'Pet removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPets,
  getPetById,
  createPet,
  getMyPets,
  updatePet,
  deletePet,
};
const Pet = require('../models/Pet');
const User = require('../models/User');

// Get all pets with advanced filtering
exports.getAllPets = async (req, res) => {
  try {
    const { type, city, breed, minAge, maxAge, size, vaccinated, page = 1, limit = 10 } = req.query;
    
    let filter = { adoptionStatus: 'available' };

    if (type) filter.type = type;
    if (city) filter['location.city'] = { $regex: city, $options: 'i' };
    if (breed) filter.breed = { $regex: breed, $options: 'i' };
    if (minAge || maxAge) {
      filter.age = {};
      if (minAge) filter.age.$gte = parseInt(minAge);
      if (maxAge) filter.age.$lte = parseInt(maxAge);
    }
    if (size) filter.size = size;
    if (vaccinated === 'true') filter['healthInfo.vaccinated'] = true;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const pets = await Pet.find(filter)
      .populate('owner', 'name email phone profilePicture location ratings')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Pet.countDocuments(filter);

    res.json({
      pets,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get pet by ID
exports.getPetById = async (req, res) => {
  try {
    const pet = await Pet.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('owner', 'name email phone profilePicture location ratings');

    if (!pet) return res.status(404).json({ error: 'Pet not found' });
    res.json(pet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get user's pets (protected route)
exports.getMyPets = async (req, res) => {
  try {
    const pets = await Pet.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(pets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new pet (protected route)
exports.createPet = async (req, res) => {
  try {
    const { name, type, breed, age, size, color, gender, description, location, images, tags, healthInfo, adoptionRequirements } = req.body;

    const imageUrl = images && images.length > 0 ? images[0] : '/placeholder-pet.jpg';

    const pet = new Pet({
      owner: req.user._id,
      name,
      type,
      breed,
      age,
      size,
      color,
      gender,
      description,
      imageUrl,
      images: images || [],
      location,
      tags: tags || [],
      healthInfo: healthInfo || {},
      adoptionRequirements,
    });

    await pet.save();
    res.status(201).json(pet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update pet (owner only)
exports.updatePet = async (req, res) => {
  try {
    let pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });

    // Check ownership
    if (pet.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this pet' });
    }

    pet = await Pet.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(pet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete pet (owner only)
exports.deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });

    // Check ownership
    if (pet.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this pet' });
    }

    await Pet.findByIdAndDelete(req.params.id);
    res.json({ message: 'Pet deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add pet to favorites (protected route)
exports.addToFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const pet = await Pet.findById(req.params.id);

    if (!pet) return res.status(404).json({ error: 'Pet not found' });

    if (user.favorites.includes(req.params.id)) {
      return res.status(400).json({ error: 'Already in favorites' });
    }

    user.favorites.push(req.params.id);
    pet.favoriteCount = (pet.favoriteCount || 0) + 1;

    await user.save();
    await pet.save();

    res.json({ message: 'Added to favorites' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Remove from favorites (protected route)
exports.removeFromFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const pet = await Pet.findById(req.params.id);

    if (!pet) return res.status(404).json({ error: 'Pet not found' });

    user.favorites = user.favorites.filter(id => id.toString() !== req.params.id);
    pet.favoriteCount = Math.max(0, (pet.favoriteCount || 0) - 1);

    await user.save();
    await pet.save();

    res.json({ message: 'Removed from favorites' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add review/rating to pet (protected route)
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ error: 'Rating and comment required' });
    }

    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ error: 'Pet not found' });

    const review = {
      reviewer: req.user._id,
      rating,
      comment,
    };

    pet.reviews = pet.reviews || [];
    pet.reviews.push(review);
    await pet.save();

    res.json(pet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get favorites (protected route)
exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    res.json(user.favorites || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Search pets
exports.searchPets = async (req, res) => {
  try {
    const { q } = req.query;
    const pets = await Pet.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { breed: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
      ],
      adoptionStatus: 'available',
    }).limit(20);

    res.json(pets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

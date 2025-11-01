const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const petSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['dog', 'cat', 'rabbit', 'bird', 'other'],
    required: true,
  },
  breed: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  size: {
    type: String,
    enum: ['small', 'medium', 'large'],
  },
  color: {
    type: String,
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
  },
  description: {
    type: String,
    required: true,
  },
  images: [{
    type: String,
  }],
  imageUrl: {
    type: String,
  },
  location: {
    city: String,
    state: String,
    country: {
      type: String,
      default: 'India',
    },
  },
  adoptionStatus: {
    type: String,
    enum: ['available', 'adopted', 'pending'],
    default: 'available',
  },
  adoptionRequirements: {
    type: String,
  },
  tags: [String],
  healthInfo: {
    vaccinated: {
      type: Boolean,
      default: false,
    },
    neutered: {
      type: Boolean,
      default: false,
    },
    medicalHistory: String,
  },
  reviews: [reviewSchema],
  views: {
    type: Number,
    default: 0,
  },
  favoriteCount: {
    type: Number,
    default: 0,
  },
  adoptionRequests: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

const Pet = mongoose.model('Pet', petSchema);
module.exports = Pet;
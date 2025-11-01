const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
 
  user: {
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
  location: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true, 
  },
  adopted: {
    type: Boolean,
    required: true,
    default: false,
  },
  contact: {
    type: String,
    required: true,
  }
}, {
  timestamps: true,
});

const Pet = mongoose.model('Pet', petSchema);
module.exports = Pet;
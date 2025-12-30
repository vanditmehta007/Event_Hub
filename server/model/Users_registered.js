const mongoose = require('mongoose');

const usersRegisteredSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users', // Links to your User model
    required: true,
  },
  event_name: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  sapid: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  about_yourself: {
    type: String,
  },
  custom_responses: {
    type: mongoose.Schema.Types.Mixed // Allows storing arbitrary key-value pairs
  }
}, { timestamps: true });

// Add a compound index to prevent duplicate entries
usersRegisteredSchema.index({ userId: 1, event_name: 1 }, { unique: true });

const UsersRegistered = mongoose.model('UsersRegistered', usersRegisteredSchema);
module.exports = UsersRegistered;
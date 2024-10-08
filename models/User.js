// models/User.js

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true, // Ensure usernames are unique
    },
    // Removed the email field as it's no longer needed
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    // Removed fields related to account activation
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);

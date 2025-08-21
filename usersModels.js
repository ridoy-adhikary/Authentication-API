const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    unique: true,
    minLength: [5, 'Email must have at least 5 characters'],
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Password must be provided'],
    trim: true,
    select: false
  },
  verified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String, // hashed code stored as string
    select: false
  },
  verificationCodeExpires: {
    type: Date, // expiration time
    select: false
  },
  forgotPasswordCode: {
    type: String, // hashed password reset code
    select: false
  },
  forgotPasswordCodeExpires: {
    type: Date, // expiration time for password reset code
    select: false
  },
  // Legacy fields for backward compatibility (deprecated)
  resetCode: {
    type: String,
    select: false
  },
  resetCodeExpires: {
    type: Date,
    select: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("User", userSchema);
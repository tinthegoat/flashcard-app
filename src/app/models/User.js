// src/app/models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  pin: {
    type: String, // Stores hashed PIN
    trim: true,
  },
  score: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

export default mongoose.models.User || mongoose.model("User", UserSchema);

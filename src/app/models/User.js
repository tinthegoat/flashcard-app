// src/app/models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  pin: { 
    type: String,
    trim: true
  },
  score: { 
    type: Number, 
    default: 0 
  },
}, {
  timestamps: true // Optional: adds createdAt and updatedAt
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
// src/app/models/Set.js
import mongoose from "mongoose";

const SetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  user_id: {
    type: String,
    required: true,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.models.Set || mongoose.model("Set", SetSchema);
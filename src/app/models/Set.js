// src/app/models/Set.js
import mongoose from "mongoose";

const SetSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  name: { type: String, required: true },
  isPublic: { type: Boolean, default: false },
});

export default mongoose.models.Set || mongoose.model("Set", SetSchema);
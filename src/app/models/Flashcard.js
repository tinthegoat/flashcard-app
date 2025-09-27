// src/app/models/Flashcard.js
import mongoose from "mongoose";

const FlashcardSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  set_id: { type: String, required: true },
  front: { type: String, required: true },
  back: { type: String, required: true },
  isPublic: { type: Boolean, default: false },
  tags: { type: [String], default: [] },
});

export default mongoose.models.Flashcard || mongoose.model("Flashcard", FlashcardSchema);
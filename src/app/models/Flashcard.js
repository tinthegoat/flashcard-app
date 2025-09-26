// src/app/models/Flashcard.js
import mongoose from "mongoose";

const FlashcardSchema = new mongoose.Schema({
  user_id: { type: String, required: true }, // Changed to String
  front: { type: String, required: true },
  back: { type: String, required: true },
  isPublic: { type: Boolean, default: false },
  tags: { type: Array, default: [] },
});

export default mongoose.models.Flashcard || mongoose.model("Flashcard", FlashcardSchema);

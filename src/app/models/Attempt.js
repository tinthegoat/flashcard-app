// src/app/models/Attempt.js
import mongoose from "mongoose";

const AttemptSchema = new mongoose.Schema({
  user_id: { type: String, required: true }, // Changed to String
  flashcards: [
    {
      flashcard_id: { type: mongoose.Schema.Types.ObjectId, ref: "Flashcard" },
      correct: Boolean,
      time_taken: Number,
    },
  ],
  date_time: { type: Date, default: Date.now },
});

export default mongoose.models.Attempt || mongoose.model("Attempt", AttemptSchema);

import mongoose from "mongoose";

const AttemptSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  set_id: { type: mongoose.Schema.Types.ObjectId, ref: "Set" },
  flashcards: [
    {
      flashcard_id: { type: mongoose.Schema.Types.ObjectId, ref: "Flashcard" },
      correct: Boolean,
    },
  ],
});

export default mongoose.models.Attempt || mongoose.model("Attempt", AttemptSchema);
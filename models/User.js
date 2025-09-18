import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  pin: { type: String },
  score: { type: Number, default: 0 },
  email: { type: String }
});

export default mongoose.models.User || mongoose.model("User", UserSchema);

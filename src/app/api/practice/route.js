// src/app/api/practice/route.js
import { connectToDB } from "@/lib/mongodb";
import Attempt from "@/models/Attempt";
import User from "@/models/User";

// Get Practice Attempts for a User
export async function GET(req) {
  await connectToDB();
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");

  if (!user_id) return new Response(JSON.stringify({ error: "user_id required" }), { status: 400 });

  const attempts = await Attempt.find({ user_id }).sort({ date_time: -1 });
  console.log("Fetched attempts for user:", user_id, JSON.stringify(attempts, null, 2));
  return new Response(JSON.stringify(attempts), { status: 200 });
}

// Create Practice Attempt and Update User Score
export async function POST(req) {
  await connectToDB();
  const { user_id, set_id, flashcards } = await req.json();

  if (!user_id || !flashcards || !Array.isArray(flashcards)) {
    return new Response(JSON.stringify({ error: "user_id and flashcards array required" }), { status: 400 });
  }

  const correctCount = flashcards.filter(f => f.correct).length;
  console.log("Processing attempt:", { user_id, set_id, flashcards, correctCount });

  const attempt = new Attempt({ user_id, set_id, flashcards });
  await attempt.save();

  await User.updateOne({ username: user_id }, { $inc: { score: correctCount } });

  console.log("Attempt saved and score updated:", { user_id, correctCount });
  return new Response(JSON.stringify(attempt), { status: 201 });
}
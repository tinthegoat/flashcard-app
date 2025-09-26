// src/app/api/sets/route.js
import { connectToDB } from "@/lib/mongodb";
import Set from "@/models/Set";
import Flashcard from "@/models/Flashcard";

// Get Sets
export async function GET(req) {
  await connectToDB();
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");

  let sets;
  if (user_id) {
    sets = await Set.find({ user_id });
  } else {
    sets = await Set.find({ isPublic: true });
  }

  return new Response(JSON.stringify(sets), { status: 200 });
}

// Create Set
export async function POST(req) {
  await connectToDB();
  const data = await req.json();

  if (!data.user_id || !data.name) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
  }

  const newSet = new Set({
    user_id: data.user_id,
    name: data.name,
    isPublic: data.isPublic || false,
  });

  await newSet.save();
  return new Response(JSON.stringify(newSet), { status: 201 });
}

// Update Set
export async function PATCH(req) {
  await connectToDB();
  const { set_id, name, isPublic } = await req.json();

  if (!set_id) return new Response(JSON.stringify({ error: "set_id required" }), { status: 400 });

  const updatedSet = await Set.findByIdAndUpdate(
    set_id,
    { ...(name && { name }), ...(isPublic !== undefined && { isPublic }) },
    { new: true }
  );

  return new Response(JSON.stringify(updatedSet), { status: 200 });
}

// Delete Set
export async function DELETE(req) {
  await connectToDB();
  const { set_id } = await req.json();

  if (!set_id) return new Response(JSON.stringify({ error: "set_id required" }), { status: 400 });

  // Delete associated flashcards
  await Flashcard.deleteMany({ set_id });
  await Set.findByIdAndDelete(set_id);

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
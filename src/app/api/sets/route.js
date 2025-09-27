import { connectToDB } from "@/lib/mongodb";
import Set from "@/models/Set";
import Flashcard from "@/models/Flashcard";

// Get Sets
export async function GET(req) {
  await connectToDB();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("user_id");
  const isPublic = searchParams.get("public");

  try {
    let query = {};
    if (userId) {
      query.user_id = userId;
    }
    if (isPublic === "true") {
      query.isPublic = true;
    }
    console.log("MongoDB sets query:", JSON.stringify(query, null, 2));
    const sets = await Set.find(query).lean();
    console.log("Sets found:", JSON.stringify(sets, null, 2));
    return new Response(JSON.stringify(sets), { status: 200 });
  } catch (err) {
    console.error("Sets API error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// Create Set
export async function POST(req) {
  await connectToDB();
  const { user_id, name } = await req.json();

  if (!user_id || !name) {
    return new Response(JSON.stringify({ error: "Missing user_id or name" }), { status: 400 });
  }

  try {
    const newSet = new Set({ user_id, name, isPublic: false });
    await newSet.save();
    console.log("Set created:", JSON.stringify(newSet, null, 2));
    return new Response(JSON.stringify(newSet), { status: 201 });
  } catch (err) {
    console.error("Sets API error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// Update Set
export async function PATCH(req) {
  await connectToDB();
  const { set_id, name, isPublic } = await req.json();

  if (!set_id) {
    return new Response(JSON.stringify({ error: "set_id required" }), { status: 400 });
  }

  try {
    const updateData = {};
    if (name) updateData.name = name;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const updatedSet = await Set.findByIdAndUpdate(set_id, updateData, { new: true }).lean();
    if (!updatedSet) {
      return new Response(JSON.stringify({ error: "Set not found" }), { status: 404 });
    }
    console.log("Set updated:", JSON.stringify(updatedSet, null, 2));
    return new Response(JSON.stringify(updatedSet), { status: 200 });
  } catch (err) {
    console.error("Sets API error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// Delete Set
export async function DELETE(req) {
  await connectToDB();
  const { set_id } = await req.json();

  if (!set_id) {
    return new Response(JSON.stringify({ error: "set_id required" }), { status: 400 });
  }

  try {
    const deletedSet = await Set.findByIdAndDelete(set_id).lean();
    if (!deletedSet) {
      return new Response(JSON.stringify({ error: "Set not found" }), { status: 404 });
    }
    // Delete associated flashcards
    await Flashcard.deleteMany({ set_id });
    console.log("Set deleted:", JSON.stringify(deletedSet, null, 2));
    console.log("Flashcards deleted for set_id:", set_id);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Sets API error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
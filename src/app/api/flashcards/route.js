// src/app/api/flashcards/route.js
import { connectToDB } from "@/lib/mongodb";
import Flashcard from "@/models/Flashcard";
import Set from "@/models/Set";

// Get Flashcards
export async function GET(req) {
  await connectToDB();
  const { searchParams } = new URL(req.url);
  const setIds = searchParams.get("set_ids");
  const setId = searchParams.get("set_id");
  const userId = searchParams.get("user_id");

  try {
    let query = {};
    if (setIds) {
      query.set_id = { $in: setIds.split(",") };
    } else if (setId) {
      query.set_id = setId;
    } else if (userId) {
      query.user_id = userId;
    } else {
      return new Response(JSON.stringify({ error: "Missing set_ids, set_id, or user_id" }), { status: 400 });
    }

    console.log("MongoDB flashcards query:", JSON.stringify(query, null, 2));
    const flashcards = await Flashcard.find(query).lean();
    console.log("Flashcards found:", JSON.stringify(flashcards, null, 2));
    return new Response(JSON.stringify(flashcards), { status: 200 });
  } catch (err) {
    console.error("Flashcards API error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// Create Flashcard
export async function POST(req) {
  await connectToDB();
  const data = await req.json();

  if (!data.user_id || !data.set_id || !data.front || !data.back) {
    return new Response(JSON.stringify({ error: "Missing required fields: user_id, set_id, front, or back" }), { status: 400 });
  }

  try {
    // Validate set_id exists and belongs to user
    const set = await Set.findById(data.set_id).lean();
    if (!set) {
      return new Response(JSON.stringify({ error: "Invalid set_id: Set not found" }), { status: 400 });
    }
    if (set.user_id !== data.user_id) {
      return new Response(JSON.stringify({ error: "Unauthorized: Set does not belong to user" }), { status: 403 });
    }

    const newCard = new Flashcard({
      user_id: data.user_id,
      set_id: data.set_id,
      front: data.front,
      back: data.back,
      isPublic: false,
      tags: data.tags || [],
    });

    await newCard.save();
    console.log("Flashcard created with set_id:", data.set_id, JSON.stringify(newCard, null, 2));
    return new Response(JSON.stringify(newCard), { status: 201 });
  } catch (err) {
    console.error("Flashcards API error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// Update Flashcard
export async function PATCH(req) {
  await connectToDB();
  const { flashcard_id, front, back, isPublic, tags, set_id, user_id } = await req.json();

  if (!flashcard_id) {
    return new Response(JSON.stringify({ error: "flashcard_id required" }), { status: 400 });
  }

  try {
    if (set_id) {
      const set = await Set.findById(set_id).lean();
      if (!set) {
        return new Response(JSON.stringify({ error: "Invalid set_id: Set not found" }), { status: 400 });
      }
      if (set.user_id !== user_id) {
        return new Response(JSON.stringify({ error: "Unauthorized: Set does not belong to user" }), { status: 403 });
      }
    }

    const updatedCard = await Flashcard.findByIdAndUpdate(
      flashcard_id,
      { ...(user_id && { user_id }), ...(set_id && { set_id }), ...(front && { front }), ...(back && { back }), ...(isPublic !== undefined && { isPublic }), ...(tags && { tags }) },
      { new: true }
    ).lean();

    if (!updatedCard) {
      return new Response(JSON.stringify({ error: "Flashcard not found" }), { status: 404 });
    }

    console.log("Flashcard updated with set_id:", set_id, JSON.stringify(updatedCard, null, 2));
    return new Response(JSON.stringify(updatedCard), { status: 200 });
  } catch (err) {
    console.error("Flashcards API error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

// Delete Flashcard
export async function DELETE(req) {
  await connectToDB();
  const { flashcard_id } = await req.json();

  if (!flashcard_id) {
    return new Response(JSON.stringify({ error: "flashcard_id required" }), { status: 400 });
  }

  try {
    const deletedCard = await Flashcard.findByIdAndDelete(flashcard_id).lean();
    if (!deletedCard) {
      return new Response(JSON.stringify({ error: "Flashcard not found" }), { status: 404 });
    }
    console.log("Flashcard deleted:", JSON.stringify(deletedCard, null, 2));
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("Flashcards API error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
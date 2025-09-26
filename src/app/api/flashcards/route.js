// src/app/api/flashcards/route.js
import { connectToDB } from "@/lib/mongodb";
import Flashcard from "@/models/Flashcard";
import Set from "@/models/Set";

// Get Flashcards
export async function GET(request) {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db("studyflash");
    const { searchParams } = new URL(request.url);
    const setIds = searchParams.get("set_ids");
    const userId = searchParams.get("user_id");

    let query = {};
    if (setIds) {
      query.set_id = { $in: setIds.split(",") };
    } else if (userId) {
      query.user_id = userId;
    } else {
      return new Response(JSON.stringify({ error: "Missing set_ids or user_id" }), { status: 400 });
    }

    console.log("MongoDB query:", query);
    const flashcards = await db.collection("flashcards").find(query).toArray();
    console.log("Flashcards found:", flashcards);
    return new Response(JSON.stringify(flashcards), { status: 200 });
  } catch (err) {
    console.error("API error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  } finally {
    await client.close();
  }
}
// Create Flashcard
export async function POST(req) {
  await connectToDB();
  const data = await req.json();

  if (!data.user_id || !data.front || !data.back || !data.set_id) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
  }

  const set = await Set.findById(data.set_id);
  if (!set || set.user_id !== data.user_id) {
    return new Response(JSON.stringify({ error: "Invalid set" }), { status: 404 });
  }

  const newCard = new Flashcard({
    user_id: data.user_id,
    set_id: data.set_id,
    front: data.front,
    back: data.back,
    isPublic: data.isPublic || false,
  });

  await newCard.save();
  return new Response(JSON.stringify(newCard), { status: 201 });
}

// Update Flashcard
export async function PATCH(req) {
  await connectToDB();
  const { flashcard_id, front, back, isPublic } = await req.json();

  if (!flashcard_id) return new Response(JSON.stringify({ error: "flashcard_id required" }), { status: 400 });

  const updatedCard = await Flashcard.findByIdAndUpdate(
    flashcard_id,
    { ...(front && { front }), ...(back && { back }), ...(isPublic !== undefined && { isPublic }) },
    { new: true }
  );

  return new Response(JSON.stringify(updatedCard), { status: 200 });
}

// Delete Flashcard
export async function DELETE(req) {
  await connectToDB();
  const { flashcard_id } = await req.json();

  if (!flashcard_id) return new Response(JSON.stringify({ error: "flashcard_id required" }), { status: 400 });

  await Flashcard.findByIdAndDelete(flashcard_id);
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
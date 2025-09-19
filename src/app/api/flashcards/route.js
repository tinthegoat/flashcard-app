import { connectToDB } from "@/lib/mongodb";
import Flashcard from "@/models/Flashcard";

// Get Flashcard
export async function GET(req) {
  await connectToDB();
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");

  let flashcards;
  if (user_id) {
    flashcards = await Flashcard.find({ user_id });
  } else {
    flashcards = await Flashcard.find({});
  }

  return new Response(JSON.stringify(flashcards), { status: 200 });
}

// Create Flashcard
export async function POST(req) {
  await connectToDB();
  const data = await req.json();

  if (!data.user_id || !data.front || !data.back) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
  }

  const newCard = new Flashcard({
    user_id: data.user_id,
    front: data.front,
    back: data.back,
    isPublic: data.isPublic || false,
    tags: data.tags || []
  });

  await newCard.save();
  return new Response(JSON.stringify(newCard), { status: 201 });
}

// Update Flashcard
export async function PATCH(req) {
  await connectToDB();
  const { flashcard_id, front, back, isPublic, tags } = await req.json();

  if (!flashcard_id) return new Response(JSON.stringify({ error: "flashcard_id required" }), { status: 400 });

  const updatedCard = await Flashcard.findByIdAndUpdate(
    flashcard_id,
    { ...(front && { front }), ...(back && { back }), ...(isPublic !== undefined && { isPublic }), ...(tags && { tags }) },
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

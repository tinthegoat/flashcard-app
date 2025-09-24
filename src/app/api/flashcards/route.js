// src/app/api/flashcards/route.js
import { connectToDB } from "@/lib/mongodb";
import Flashcard from "@/models/Flashcard";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  await connectToDB();
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");

  if (user_id !== session.user.username) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const flashcards = await Flashcard.find({ user_id });
  return new Response(JSON.stringify(flashcards), { status: 200 });
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  await connectToDB();
  const data = await req.json();

  if (!data.user_id || data.user_id !== session.user.username || !data.front || !data.back) {
    return new Response(JSON.stringify({ error: "Missing or unauthorized fields" }), { status: 400 });
  }

  const newCard = new Flashcard({
    user_id: data.user_id,
    front: data.front,
    back: data.back,
    isPublic: data.isPublic || false,
    tags: data.tags || [],
  });

  await newCard.save();
  return new Response(JSON.stringify(newCard), { status: 201 });
}

export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  await connectToDB();
  const { flashcard_id, front, back, isPublic, tags } = await req.json();

  const flashcard = await Flashcard.findById(flashcard_id);
  if (!flashcard || flashcard.user_id !== session.user.username) {
    return new Response(JSON.stringify({ error: "Unauthorized or flashcard not found" }), { status: 401 });
  }

  const updatedCard = await Flashcard.findByIdAndUpdate(
    flashcard_id,
    { ...(front && { front }), ...(back && { back }), ...(isPublic !== undefined && { isPublic }), ...(tags && { tags }) },
    { new: true }
  );

  return new Response(JSON.stringify(updatedCard), { status: 200 });
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  await connectToDB();
  const { flashcard_id } = await req.json();

  const flashcard = await Flashcard.findById(flashcard_id);
  if (!flashcard || flashcard.user_id !== session.user.username) {
    return new Response(JSON.stringify({ error: "Unauthorized or flashcard not found" }), { status: 401 });
  }

  await Flashcard.findByIdAndDelete(flashcard_id);
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}

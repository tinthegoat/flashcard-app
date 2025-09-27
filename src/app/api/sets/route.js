// src/app/api/sets/route.js
import { connectToDB } from "@/lib/mongodb";
import Set from "@/models/Set";

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
    } else if (isPublic === "true") {
      query.isPublic = true;
    } else {
      return new Response(JSON.stringify({ error: "Missing user_id or public parameter" }), { status: 400 });
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
  const data = await req.json();

  if (!data.user_id || !data.name) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
  }

  try {
    const newSet = new Set({
      user_id: data.user_id,
      name: data.name,
      isPublic: data.isPublic || false,
    });

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
  const { set_id, isPublic, name } = await req.json();

  if (!set_id) {
    return new Response(JSON.stringify({ error: "set_id required" }), { status: 400 });
  }

  try {
    const updatedSet = await Set.findByIdAndUpdate(
      set_id,
      { ...(name && { name }), ...(isPublic !== undefined && { isPublic }) },
      { new: true }
    ).lean();

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

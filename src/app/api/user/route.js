import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";

// Create User/ Sign Up
export async function POST(req) {
  await connectToDB();
  const data = await req.json();
  const { username, pin } = data;

  if (!username) {
    return new Response(JSON.stringify({ error: "Username is required" }), { status: 400 });
  }

  try {
    const newUser = new User({ username, pin });
    await newUser.save();
    return new Response(JSON.stringify(newUser), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Username already exists" }), { status: 409 });
  }
}

// Get User/ Login
export async function GET(req) {
  await connectToDB();
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  const pin = searchParams.get("pin");

  if (!username) return new Response(JSON.stringify({ error: "Username required" }), { status: 400 });

  const user = await User.findOne({ username });
  if (!user) return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });

  if (pin && user.pin !== pin) {
    return new Response(JSON.stringify({ error: "Incorrect PIN" }), { status: 401 });
  }

  return new Response(JSON.stringify(user), { status: 200 });
}

// Update User
export async function PATCH(req) {
  await connectToDB();
  const { user_id, username, pin } = await req.json();

  if (!user_id) return new Response(JSON.stringify({ error: "user_id required" }), { status: 400 });

  const updated = await User.findByIdAndUpdate(
    user_id,
    { ...(username && { username }), ...(pin && { pin }) },
    { new: true }
  );

  return new Response(JSON.stringify(updated), { status: 200 });
}

// Delete User
export async function DELETE(req) {
  await connectToDB();
  const { user_id } = await req.json();
  if (!user_id) return new Response(JSON.stringify({ error: "user_id required" }), { status: 400 });

  await User.findByIdAndDelete(user_id);
  return new Response(JSON.stringify({ success: true }), { status: 200 });
}

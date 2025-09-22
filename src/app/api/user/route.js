import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";
import crypto from "crypto";

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

// POST: Sign Up
export async function POST(req) {
  await connectToDB();
  const { username, pin } = await req.json();

  if (!username) return new Response(JSON.stringify({ error: "Username is required" }), { status: 400 });

  try {
    const token = generateToken();
    const newUser = new User({ username, pin, token });
    await newUser.save();
    return new Response(JSON.stringify({ username: newUser.username, token }), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.code === 11000 ? "Username already exists" : err.message }), { status: err.code === 11000 ? 409 : 500 });
  }
}

// GET: Login
export async function GET(req) {
  await connectToDB();
  const { searchParams } = new URL(req.url);
  const username = (searchParams.get("username") || "").trim();
  const pin = (searchParams.get("pin") || "").trim();

  if (!username) return new Response(JSON.stringify({ error: "Username required" }), { status: 400 });

  const user = await User.findOne({ username });
  if (!user) return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
  if (pin && user.pin !== pin) return new Response(JSON.stringify({ error: "Incorrect PIN" }), { status: 401 });

  const token = generateToken();
  user.token = token;
  await user.save();

  return new Response(JSON.stringify({ username: user.username, token }), { status: 200 });
}

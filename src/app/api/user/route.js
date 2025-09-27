import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";
import Set from "@/models/Set";
import Flashcard from "@/models/Flashcard";
import crypto from "crypto";

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

// POST: Sign Up
export async function POST(req) {
  await connectToDB();
  const { username, password } = await req.json();

  if (!username) return NextResponse.json({ error: "Username is required" }, { status: 400 });

  try {
    const token = generateToken();
    const newUser = new User({ username, password, token });
    await newUser.save();
    return NextResponse.json({ username: newUser.username, token }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err.code === 11000 ? "Username already exists" : err.message },
      { status: err.code === 11000 ? 409 : 500 }
    );
  }
}

// GET: Login
export async function GET(req) {
  await connectToDB();
  const { searchParams } = new URL(req.url);
  const username = (searchParams.get("username") || "").trim();
  const password = (searchParams.get("password") || "").trim();

  if (!username) return NextResponse.json({ error: "Username required" }, { status: 400 });

  const user = await User.findOne({ username });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (password && user.password !== password) return NextResponse.json({ error: "Incorrect password" }, { status: 401 });

  const token = generateToken();
  user.token = token;
  await user.save();

  return NextResponse.json({ username: user.username, token }, { status: 200 });
}

// PATCH: Update Username or Password
export async function PATCH(req) {
  await connectToDB();
  const { user_id, username, oldPassword, password } = await req.json();

  if (!user_id) {
    return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
  }

  try {
    const user = await User.findOne({ username: user_id });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updates = {};
    let usernameChanged = false;

    if (username) {
      const existingUser = await User.findOne({ username });
      if (existingUser && existingUser.username !== user_id) {
        return NextResponse.json({ error: "Username already exists" }, { status: 409 });
      }
      updates.username = username;
      usernameChanged = true;
    }

    if (password) {
      if (!oldPassword || user.password !== oldPassword) {
        return NextResponse.json({ error: "Incorrect current password" }, { status: 401 });
      }
      updates.password = password;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 });
    }

    await User.updateOne({ username: user_id }, { $set: updates });

    // If username was changed, update Sets and Flashcards too
    if (usernameChanged) {
      await Set.updateMany({ user_id: user_id }, { $set: { user_id: username } });
      await Flashcard.updateMany({ user_id: user_id }, { $set: { user_id: username } });
    }

    return NextResponse.json({ username: updates.username || user.username }, { status: 200 });
  } catch (error) {
    console.error("User update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

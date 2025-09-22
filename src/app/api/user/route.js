// src/app/api/user/route.js
import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";

// POST: Sign Up
export async function POST(req) {
  console.log("POST /api/user - Sign up request received");

  try {
    await connectToDB();
    const data = await req.json();
    const username = (data.username || "").trim();
    const pin = (data.pin || "").trim();

    console.log("Sign up attempt:", { username, pin: pin ? "***" : "empty" });

    if (!username) {
      return new Response(JSON.stringify({ error: "Username is required" }), { status: 400 });
    }

    const newUser = new User({ username, pin });
    await newUser.save();
    console.log("User created successfully:", newUser._id);

    return new Response(JSON.stringify(newUser), { status: 201 });
  } catch (err) {
    console.error("Signup error:", err);
    return new Response(
      JSON.stringify({
        error: err.code === 11000 ? "Username already exists" : `Database error: ${err.message}` 
      }),
      { status: err.code === 11000 ? 409 : 500 }
    );
  }
}

// GET: Login
export async function GET(req) {
  console.log("GET /api/user - Login request received");

  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const username = (searchParams.get("username") || "").trim();
    const pin = (searchParams.get("pin") || "").trim();

    console.log("Login attempt:", { username, pin: pin ? "***" : "empty" });

    if (!username) {
      return new Response(JSON.stringify({ error: "Username required" }), { status: 400 });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    if (pin && user.pin !== pin) {
      return new Response(JSON.stringify({ error: "Incorrect PIN" }), { status: 401 });
    }

    console.log("Login successful for user:", user._id);
    return new Response(JSON.stringify(user), { status: 200 });
  } catch (err) {
    console.error("Login error:", err);
    return new Response(JSON.stringify({ error: `Login error: ${err.message}` }), { status: 500 });
  }
}

// PATCH: Update partially
export async function PATCH(req) {
  try {
    await connectToDB();
    const { user_id, username, pin, score } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id required" }), { status: 400 });
    }

    const updated = await User.findByIdAndUpdate(
      user_id,
      {
        ...(username && { username: username.trim() }),
        ...(pin && { pin: pin.trim() }),
        ...(score != null && { score })
      },
      { new: true }
    );

    return new Response(JSON.stringify(updated), { status: 200 });
  } catch (err) {
    console.error("PATCH error:", err);
    return new Response(JSON.stringify({ error: `Update error: ${err.message}` }), { status: 500 });
  }
}

// PUT: Replace entire user
export async function PUT(req) {
  try {
    await connectToDB();
    const { user_id, username, pin, score } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id required" }), { status: 400 });
    }

    const replaced = await User.findByIdAndUpdate(
      user_id,
      { username: username.trim(), pin: pin.trim(), score: score || 0 },
      { new: true, overwrite: true }
    );

    return new Response(JSON.stringify(replaced), { status: 200 });
  } catch (err) {
    console.error("PUT error:", err);
    return new Response(JSON.stringify({ error: `Replace error: ${err.message}` }), { status: 500 });
  }
}

// DELETE: Remove user
export async function DELETE(req) {
  try {
    await connectToDB();
    const { user_id } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id required" }), { status: 400 });
    }

    await User.findByIdAndDelete(user_id);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    console.error("DELETE error:", err);
    return new Response(JSON.stringify({ error: `Delete error: ${err.message}` }), { status: 500 });
  }
}
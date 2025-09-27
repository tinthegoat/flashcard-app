import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";

// PATCH: Increment User Score
export async function PATCH(req) {
  await connectToDB();
  const { username, increment } = await req.json();

  if (!username || !increment) {
    return new Response(JSON.stringify({ error: "Username and increment required" }), { status: 400 });
  }

  try {
    const user = await User.findOneAndUpdate(
      { username },
      { $inc: { score: increment } },
      { new: true, select: "username score" }
    );
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }
    console.log("Score updated for user:", JSON.stringify({ username, score: user.score }, null, 2));
    return new Response(JSON.stringify({ username, score: user.score }), { status: 200 });
  } catch (err) {
    console.error("Score update error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
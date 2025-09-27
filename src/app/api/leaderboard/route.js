import { connectToDB } from "@/lib/mongodb";
import User from "@/models/User";

// Get Practice Leaderboard
export async function GET(req) {
  await connectToDB();

  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "all"; // "all", "day", "week"

  let users;

  if (period === "all") {
    // All-time leaderboard: sort by total score, filter score > 0
    users = await User.find({ score: { $gt: 0 } }).sort({ score: -1 }).limit(50); // top 50
  } else {
    return new Response(JSON.stringify({ error: "Day/week filter not implemented yet" }), { status: 400 });
  }

  // Send only username and score
  const leaderboard = users.map(u => ({
    username: u.username,
    score: u.score
  }));

  console.log("Leaderboard users fetched:", JSON.stringify(leaderboard, null, 2));
  return new Response(JSON.stringify(leaderboard), { status: 200 });
}
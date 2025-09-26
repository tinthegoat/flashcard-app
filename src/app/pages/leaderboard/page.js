"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import toast from "react-hot-toast";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/leaderboard?period=all")
      .then((res) => res.json())
      .then((data) => setLeaderboard(data))
      .catch(() => toast.error("Failed to load leaderboard"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-5 font-roboto-mono">
        <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>
        {loading ? (
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        ) : leaderboard.length === 0 ? (
          <p>No leaderboard data available.</p>
        ) : (
          <div className="glass-effect p-6 rounded-2xl">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-2">Rank</th>
                  <th className="text-left p-2">Username</th>
                  <th className="text-left p-2">Score</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((user, index) => (
                  <tr key={user.username} className="border-t border-white/20">
                    <td className="p-2">{index + 1}</td>
                    <td className="p-2">{user.username}</td>
                    <td className="p-2">{user.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
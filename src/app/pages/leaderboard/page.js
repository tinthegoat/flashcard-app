"use client";

import { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const url = `/studyflash/api/leaderboard?period=all`;
    fetch(url)
      .then((res) => {
        if (!res.ok) {
          return res.json().then((data) => {
            throw new Error(`Failed to fetch leaderboard: ${res.status} ${data.error || res.statusText}`);
          });
        }
        return res.json();
      })
      .then((data) => {
        setLeaderboard(data);
      })
      .catch((err) => {
        console.error("Leaderboard fetch error:", err.message);
        if (toast && toast.error) {
          toast.error(err.message);
        } else {
          console.warn("Toast not initialized, skipping leaderboard error toast");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-5 font-roboto-mono">
        <Toaster />
        <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>
        <div className="glass-effect p-6 rounded-2xl">
          <h2 className="text-xl font-semibold mb-4">Top Users</h2>
          {loading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          ) : leaderboard.length === 0 ? (
            <p>No users with scores yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th className="px-4 py-2">Rank</th>
                    <th className="px-4 py-2">Username</th>
                    <th className="px-4 py-2">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((user, index) => (
                    <tr key={user.username} className="border-t border-white/20">
                      <td className="px-4 py-2">{index + 1}</td>
                      <td className="px-4 py-2">{user.username}</td>
                      <td className="px-4 py-2">{user.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
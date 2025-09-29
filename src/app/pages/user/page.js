"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import toast, { Toaster } from "react-hot-toast";

export default function UserPage() {
  const [userData, setUserData] = useState({ username: "", score: 0 });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("flashUser") || "{}");
    if (!storedUser.username) {
      toast.error("Please login to view user profile");
      router.push("/pages/login");
      return;
    }
    setLoading(true);
    fetch(`/studyflash/api/user?username=${encodeURIComponent(storedUser.username)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user data");
        return res.json();
      })
      .then((data) => setUserData({ username: data.username, score: data.score || 0 }))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("flashUser");
    toast.success("Logged out successfully");
    router.push("/pages/login");
  };

  // Generate avatar initials
  const getInitials = (username) => {
    return username ? username.slice(0, 2).toUpperCase() : "??";
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col items-center justify-center min-h-screen px-5 py-10 bg-gradient-to-b from-black/40 to-blue-900/40">
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <div className="glass-effect rounded-2xl p-8 w-full max-w-md text-center shadow-lg transition-all duration-300">
          <h1 className="text-4xl font-bold font-roboto-mono mb-8 text-blue-100">User Profile</h1>
          {loading ? (
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* Avatar */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-2xl font-bold text-white font-roboto-mono">
                  {getInitials(userData.username)}
                </div>
              </div>
              {/* User Info */}
              <div className="mb-8">
                <p className="text-lg font-roboto-mono text-blue-100 mb-2">
                  Username: <span className="font-semibold">{userData.username}</span>
                </p>
                <p className="text-lg font-roboto-mono text-blue-100">
                  Score: <span className="font-semibold">{userData.score}</span>
                </p>
              </div>
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="btn glass-effect px-6 py-3 font-semibold font-roboto-mono text-red-100 bg-red-600 hover:bg-red-700 transition-all duration-200 hover:scale-105 rounded-xl w-full max-w-xs disabled:opacity-50"
                disabled={loading}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
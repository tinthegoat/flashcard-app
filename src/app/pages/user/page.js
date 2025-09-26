"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import toast from "react-hot-toast";

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
    fetch(`/api/user?username=${storedUser.username}`)
      .then((res) => res.json())
      .then((data) => setUserData({ username: data.username, score: data.score }))
      .catch(() => toast.error("Failed to load user data"))
      .finally(() => setLoading(false));
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("flashUser"); // remove the correct key
    router.push("/pages/login");
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col items-center justify-center min-h-screen px-5">
        <div className="glass-effect rounded-2xl p-8 w-full max-w-md text-center">
          <h1 className="text-3xl font-bold font-roboto-mono mb-6">User Page</h1>
          {loading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          ) : (
            <>
              <p className="text-lg font-roboto-mono mb-5">
                Logged in as: <span className="font-semibold">{userData.username}</span>
              </p>
              <p className="text-lg font-roboto-mono mb-5">
                Score: <span className="font-semibold">{userData.score}</span>
              </p>
              <button
                onClick={handleLogout}
                className="btn glass-effect px-5 py-2 font-semibold font-roboto-mono transition-transform duration-200 hover:scale-105"
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
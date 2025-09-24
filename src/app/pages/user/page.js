// src/app/pages/user/page.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function UserPage() {
  const [username, setUsername] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("flashUser");
    if (storedUser) {
      const { username } = JSON.parse(storedUser);
      setUsername(username);
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("flashUser"); // remove the correct key
    router.push("/pages/login");
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col items-center justify-center min-h-screen px-5">
        <div className="glass-effect rounded-2xl p-8 w-full max-w-md text-center">
          <h1 className="text-3xl font-bold font-roboto-mono mb-6">User Page</h1>
          <p className="text-lg font-roboto-mono mb-5">
            Logged in as: <span className="font-semibold">{username}</span>
          </p>
          <button
            onClick={handleLogout}
            className="btn glass-effect px-5 py-2 font-semibold font-roboto-mono transition-transform duration-200 hover:scale-105"
          >
            Logout
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}

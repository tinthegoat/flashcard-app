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
      .then((data) => setUserData({
        username: data.username,
        score: data.score || 0
      }))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  const handleEditUsername = async () => {
    const newUsername = prompt("Enter new username:", userData.username);
    if (!newUsername || newUsername === userData.username) return;
    setLoading(true);
    const storedUser = JSON.parse(localStorage.getItem("flashUser") || "{}");
    try {
      const res = await fetch("/studyflash/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: storedUser.username, username: newUsername }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed to update username: ${res.status}`);
      }
      const data = await res.json();
      setUserData({ ...userData, username: data.username });
      localStorage.setItem("flashUser", JSON.stringify({ ...storedUser, username: data.username }));
      toast.success("Username updated!");
    } catch (err) {
      console.error("Username update error:", err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    const oldPassword = prompt("Enter current password:");
    if (!oldPassword || oldPassword.trim() === "") return;
    const newPassword = prompt("Enter new password:");
    if (!newPassword || newPassword.trim() === "") return;
    setLoading(true);
    const storedUser = JSON.parse(localStorage.getItem("flashUser") || "{}");
    try {
      const res = await fetch("/studyflash/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: storedUser.username, oldPassword: oldPassword.trim(), password: newPassword.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed to update password: ${res.status}`);
      }
      toast.success("Password updated!");
    } catch (err) {
      console.error("Password update error:", err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("flashUser");
    toast.success("Logged out successfully");
    router.push("/pages/login");
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col items-center justify-center min-h-screen px-5">
        <Toaster />
        <div className="glass-effect rounded-2xl p-8 w-full max-w-md text-center">
          <h1 className="text-3xl font-bold font-roboto-mono mb-6">User Profile</h1>
          {loading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          ) : (
            <>
              <p className="text-lg font-roboto-mono mb-5">
                Logged in as: <span className="font-semibold">{userData.username}</span>
              </p>
              <div className="flex flex-col gap-4">
                <div className="flex justify-center">
                  <button
                    onClick={handleEditUsername}
                    className="btn glass-effect px-5 py-2 font-semibold font-roboto-mono transition-transform duration-200 hover:scale-105 bg-blue-500 w-full max-w-xs"
                    disabled={loading}
                  >
                    Edit Username
                  </button>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={handleChangePassword}
                    className="btn glass-effect px-5 py-2 font-semibold font-roboto-mono transition-transform duration-200 hover:scale-105 bg-green-500 w-full max-w-xs"
                    disabled={loading}
                  >
                    Change Password
                  </button>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={handleLogout}
                    className="btn glass-effect px-5 py-2 font-semibold font-roboto-mono transition-transform duration-200 hover:scale-105 bg-red-500 w-full max-w-xs"
                    disabled={loading}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
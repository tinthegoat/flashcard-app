// src/app/pages/user/page.js
"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import toast from "react-hot-toast";

export default function UserPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      toast.success("Logged out successfully");
      router.push("/pages/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col items-center justify-center min-h-screen px-5">
        <div className="glass-effect rounded-2xl p-8 w-full max-w-md text-center">
          <h1 className="text-3xl font-bold font-roboto-mono mb-6">User Page</h1>
          <p className="text-lg font-roboto-mono mb-5">
            Logged in as: <span className="font-semibold">{session?.user?.username || "Loading..."}</span>
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

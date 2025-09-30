"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || '/studyflash/api';
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/";

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const payload = { username: username.trim(), password: password.trim() };
    if (!payload.username) {
      setError("Username is required");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(isSignup ? `${apiBase}/user` : `${apiBase}/user?${new URLSearchParams(payload).toString()}`, {
        method: isSignup ? "POST" : "GET",
        headers: { "Content-Type": "application/json" },
        body: isSignup ? JSON.stringify(payload) : undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Auth failed");
      localStorage.setItem("flashUser", JSON.stringify({ username: data.username, token: data.token }));
      router.push(redirectPath);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleChangePassword = async () => {
    const username = prompt("Enter username:");
    if (!username || username.trim() === "") return;
    const oldPassword = prompt("Enter current password:");
    if (!oldPassword || oldPassword.trim() === "") return;
    const newPassword = prompt("Enter new password:");
    if (!newPassword || newPassword.trim() === "") return;
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/user`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: username.trim(), oldPassword: oldPassword.trim(), password: newPassword.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed to update password: ${res.status}`);
      }
      toast.success("Password updated!", { id: "password-success" });
    } catch (err) {
      console.error("Password update error:", err);
      toast.error(err.message, { id: "password-error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-5">
      <div className="glass-effect rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold font-roboto-mono mb-6 text-center">{isSignup ? "Sign Up" : "Login"}</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="px-4 py-2 rounded bg-black/30 focus:outline-none font-roboto-mono" disabled={loading} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="px-4 py-2 rounded bg-black/30 focus:outline-none font-roboto-mono" disabled={loading} />
          <div className="flex justify-center">
            <button type="submit" disabled={loading} className="btn glass-effect px-5 py-2 font-semibold font-roboto-mono transition-transform duration-200 hover:scale-105 bg-blue-500 w-full max-w-xs disabled:opacity-50">{loading ? "Processing..." : (isSignup ? "Sign Up" : "Login")}</button>
          </div>
        </form>
        {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
        <div className="flex flex-col gap-4 mt-5">
          <div className="flex justify-center">
            <button onClick={handleChangePassword} className="btn glass-effect px-5 py-2 font-semibold font-roboto-mono transition-transform duration-200 hover:scale-105 bg-green-500 w-full max-w-xs" disabled={loading}>
              Change Password
            </button>
          </div>
          <div className="text-center text-sm font-roboto-mono">
            {isSignup ? (
              <>Already have an account? <button onClick={() => setIsSignup(false)} className="underline hover:text-blue-400" disabled={loading}>Login</button></>
            ) : (
              <>Want to create a new account? <button onClick={() => setIsSignup(true)} className="underline hover:text-blue-400" disabled={loading}>Sign Up</button></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
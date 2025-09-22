// src/app/pages/login/page.js
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = { username: username.trim(), pin: pin.trim() };

    if (!payload.username) {
      setError("Username is required");
      setLoading(false);
      return;
    }

    try {
      let res;
      // Get the base path from the current location
      const basePath = process.env.NEXT_PUBLIC_API_BASE_URL || "/studyflash";

      if (isSignup) {
        // Sign up
        res = await fetch(`${basePath}/api/user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // Login
        res = await fetch(`${basePath}/api/user?username=${encodeURIComponent(payload.username)}&pin=${encodeURIComponent(payload.pin)}`);
      }

      const data = await res.json();
    
      if (!res.ok) {
        throw new Error(data.error || (isSignup ? "Signup failed" : "Login failed"));
      }

      // Store user data in localStorage or session storage if needed
      console.log("Success:", data);

      // Navigate to flashcards page
      router.push("/pages/flashcards");

    } catch (err) {
      console.error("Auth error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-5">
      <div className="glass-effect rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold font-roboto-mono mb-6 text-center">
          {isSignup ? "Sign Up" : "Login"}
        </h1>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="px-4 py-2 rounded bg-black/30 focus:outline-none font-roboto-mono"
            disabled={loading}
          />
          <input
            type="password"
            placeholder="PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="px-4 py-2 rounded bg-black/30 focus:outline-none font-roboto-mono"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="btn glass-effect px-5 py-2 font-semibold font-roboto-mono transition-transform duration-200 hover:scale-105 disabled:opacity-50"
          >
            {loading ? "Processing..." : (isSignup ? "Sign Up" : "Login")}
          </button>
        </form>
        
        {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
        
        <div className="text-center mt-5 text-sm font-roboto-mono">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <button 
                onClick={() => setIsSignup(false)} 
                className="underline hover:text-blue-400"
                disabled={loading}
              >
                Login
              </button>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <button 
                onClick={() => setIsSignup(true)} 
                className="underline hover:text-blue-400"
                disabled={loading}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
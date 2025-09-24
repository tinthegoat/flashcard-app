// src/app/pages/login/loginForm.js
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/pages/flashcards";

  const validateInputs = () => {
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    const pinRegex = /^\d{4,8}$/;

    if (username.length < 3 || username.length > 20) {
      return "Username must be 3-20 characters long";
    }
    if (!usernameRegex.test(username)) {
      return "Username must be alphanumeric";
    }
    if (!pinRegex.test(pin)) {
      return "PIN must be 4-8 digits";
    }
    return null;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      setLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        redirect: false,
        username: username.trim(),
        pin: pin.trim(),
      });

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success(isSignup ? "Account created!" : "Logged in!");
      router.push(redirectPath);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-5">
      <div className="glass-effect rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold font-roboto-mono mb-6 text-center">{isSignup ? "Sign Up" : "Login"}</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username (alphanumeric, 3-20 characters)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="px-4 py-2 rounded bg-black/30 focus:outline-none font-roboto-mono"
            disabled={loading}
          />
          <input
            type="password"
            placeholder="PIN (4-8 digits)"
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
            {loading ? "Processing..." : isSignup ? "Sign Up" : "Login"}
          </button>
        </form>
        {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
        <div className="text-center mt-5 text-sm font-roboto-mono">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <button onClick={() => setIsSignup(false)} className="underline hover:text-blue-400" disabled={loading}>
                Login
              </button>
            </>
          ) : (
            <>
              Want to create a new account?{" "}
              <button onClick={() => setIsSignup(true)} className="underline hover:text-blue-400" disabled={loading}>
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
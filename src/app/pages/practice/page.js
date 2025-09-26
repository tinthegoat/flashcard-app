// src/app/pages/practice/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import toast from "react-hot-toast";

export default function PracticePage() {
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("flashUser") || "{}");
    if (!storedUser.username) {
      toast.error("Please login to practice flashcards");
      router.push("/pages/login");
      return;
    }
    setLoading(true);
    fetch(`/studyflash/api/flashcards?user_id=${encodeURIComponent(storedUser.username)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch flashcards");
        return res.json();
      })
      .then((data) => setFlashcards(data))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  const handleNext = (correct) => {
    if (flashcards.length === 0) return;
    setAttempts([...attempts, { flashcard_id: flashcards[currentIndex]._id, correct, time_taken: 0 }]);
    setShowBack(false);
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      submitAttempt();
    }
  };

  const submitAttempt = async () => {
    setLoading(true);
    const storedUser = JSON.parse(localStorage.getItem("flashUser") || "{}");
    if (!storedUser.username) {
      toast.error("Please login to save practice session");
      router.push("/pages/login");
      return;
    }
    try {
      const res = await fetch(`/studyflash/api/practice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: storedUser.username, flashcards: attempts }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save attempt");
      }
      toast.success(`Practice session saved! Score updated (+${attempts.filter(a => a.correct).length} points)`);
      setAttempts([]);
      setCurrentIndex(0);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (flashcards.length === 0) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-5 font-roboto-mono">
          <h1 className="text-3xl font-bold mb-6">Practice Flashcards</h1>
          <p>No flashcards available. Create some first!</p>
          <button
            className="btn glass-effect px-5 py-2 font-semibold mt-4 transition-transform duration-200 hover:scale-105"
            onClick={() => router.push("/pages/flashcards")}
          >
            Go to Flashcards
          </button>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-5 font-roboto-mono">
        <h1 className="text-3xl font-bold mb-6">Practice Flashcards</h1>
        <div className="glass-effect p-6 rounded-2xl mb-6">
          <h2 className="text-xl font-semibold">{showBack ? flashcards[currentIndex].back : flashcards[currentIndex].front}</h2>
          <button
            className="btn glass-effect px-5 py-2 font-semibold mt-4 transition-transform duration-200 hover:scale-105"
            onClick={() => setShowBack(!showBack)}
            disabled={loading}
          >
            {showBack ? "Show Front" : "Show Back"}
          </button>
          {showBack && (
            <div className="flex gap-4 mt-4">
              <button
                className="btn glass-effect px-5 py-2 font-semibold bg-green-500 transition-transform duration-200 hover:scale-105"
                onClick={() => handleNext(true)}
                disabled={loading}
              >
                Correct
              </button>
              <button
                className="btn glass-effect px-5 py-2 font-semibold bg-red-500 transition-transform duration-200 hover:scale-105"
                onClick={() => handleNext(false)}
                disabled={loading}
              >
                Incorrect
              </button>
            </div>
          )}
          <p className="mt-4 text-sm">Card {currentIndex + 1} of {flashcards.length}</p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
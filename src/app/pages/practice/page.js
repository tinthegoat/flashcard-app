// src/app/pages/flashcards/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import toast from "react-hot-toast";

export default function PracticePage() {
  const [sets, setSets] = useState([]);
  const [selectedSetIds, setSelectedSetIds] = useState([]);
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
    fetch(`/studyflash/api/sets?user_id=${encodeURIComponent(storedUser.username)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch sets: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("Sets fetched:", data);
        setSets(data);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  const handleSetSelect = async (setId) => {
    let newSelectedSetIds;
    if (setId === null) {
      newSelectedSetIds = [];
    } else if (selectedSetIds.includes(setId)) {
      newSelectedSetIds = selectedSetIds.filter((id) => id !== setId);
    } else {
      newSelectedSetIds = [...selectedSetIds, setId];
    }
    setSelectedSetIds(newSelectedSetIds);
    setFlashcards([]);
    setCurrentIndex(0);
    setShowBack(false);
    setAttempts([]);
    setLoading(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem("flashUser") || "{}");
      let url;
      if (newSelectedSetIds.length === 0) {
        url = `/studyflash/api/flashcards?user_id=${encodeURIComponent(storedUser.username)}`;
      } else {
        url = `/studyflash/api/flashcards?set_ids=${newSelectedSetIds.join(",")}`;
      }
      console.log("Fetching flashcards with URL:", url);
      const res = await fetch(url);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(`Failed to fetch flashcards: ${res.status} - ${errorData.error || "Unknown error"}`);
      }
      const data = await res.json();
      console.log("Flashcards received:", data);
      setFlashcards(data);
      if (data.length === 0 && newSelectedSetIds.length > 0) {
        toast.error("No flashcards in selected sets. Add some first!");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

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
    try {
      const res = await fetch(`/studyflash/api/practice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: storedUser.username, set_id: selectedSetIds.join(","), flashcards: attempts }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save attempt");
      }
      toast.success(`Practice session saved! Score updated (+${attempts.filter(a => a.correct).length} points)`);
      setAttempts([]);
      setCurrentIndex(0);
      setShowBack(false);
      setSelectedSetIds([]);
      setFlashcards([]);
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

  if (sets.length === 0) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto p-5 font-roboto-mono">
          <h1 className="text-3xl font-bold mb-6">Practice Flashcards</h1>
          <p>No sets available. Create some in Flashcards!</p>
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
          <h2 className="text-xl font-semibold mb-4">Select Sets</h2>
          <div className="flex gap-2 overflow-x-auto mb-6">
            <button
              className={`px-4 py-2 rounded font-roboto-mono ${selectedSetIds.length === 0 ? "bg-blue-500 text-white" : "bg-white/20"}`}
              onClick={() => handleSetSelect(null)}
            >
              All Cards
            </button>
            {sets.map((set) => (
              <button
                key={set._id}
                className={`px-4 py-2 rounded font-roboto-mono ${selectedSetIds.includes(set._id) ? "bg-blue-500 text-white" : "bg-white/20"}`}
                onClick={() => handleSetSelect(set._id)}
              >
                {set.name}
              </button>
            ))}
          </div>
          {selectedSetIds.length > 0 && (
            <div>
              {flashcards.length === 0 ? (
                <div>
                  <p>No flashcards in selected sets. Add some in Flashcards!</p>
                  <button
                    className="btn glass-effect px-5 py-2 font-semibold mt-4 transition-transform duration-200 hover:scale-105"
                    onClick={() => router.push("/pages/flashcards")}
                  >
                    Go to Flashcards
                  </button>
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
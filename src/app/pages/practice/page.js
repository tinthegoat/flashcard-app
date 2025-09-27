// src/app/pages/practice/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import toast, { Toaster } from "react-hot-toast";

export default function PracticePage() {
  const [sets, setSets] = useState([]);
  const [selectedSetIds, setSelectedSetIds] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("flashUser") || "{}");
    if (!storedUser.username) {
      if (toast && toast.error) {
        toast.error("Please login to practice flashcards");
      } else {
        console.warn("Toast not initialized, skipping login error toast");
      }
      router.push("/pages/login");
      return;
    }
    setLoading(true);
    fetch(`/studyflash/api/sets?user_id=${encodeURIComponent(storedUser.username)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch sets: ${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        setSets(data);
        if (data.length > 0) {
          handleSetSelect(null);
        }
      })
      .catch((err) => {
        console.error("Sets fetch error:", err);
        if (toast && toast.error) {
          toast.error(err.message);
        } else {
          console.warn("Toast not initialized, skipping sets error toast");
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleSetSelect = useCallback(async (setId) => {
    let newSelectedSetIds;
    if (setId === null) {
      newSelectedSetIds = [];
    } else if (selectedSetIds.includes(setId)) {
      newSelectedSetIds = selectedSetIds.filter((id) => id !== setId);
    } else {
      newSelectedSetIds = [...selectedSetIds, setId];
    }

    setSelectedSetIds(newSelectedSetIds);
    setIsModalOpen(false);
    setIsSessionComplete(false);

    if (newSelectedSetIds.length === 0 && setId !== null) {
      setFlashcards([]);
      setCurrentIndex(0);
      setShowBack(false);
      setAttempts([]);
      return;
    }

    try {
      const storedUser = JSON.parse(localStorage.getItem("flashUser") || "{}");
      let url;
      if (newSelectedSetIds.length === 0) {
        url = `/studyflash/api/flashcards?user_id=${encodeURIComponent(storedUser.username)}`;
      } else {
        url = `/studyflash/api/flashcards?set_ids=${newSelectedSetIds.join(",")}`;
      }
      const res = await fetch(url);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(`Failed to fetch flashcards: ${res.status} - ${errorData.error || res.statusText}`);
      }
      const data = await res.json();
      
      setFlashcards(data);
      setCurrentIndex(0);
      setShowBack(false);
      setAttempts([]);
      if (data.length === 0 && newSelectedSetIds.length > 0) {
        setTimeout(() => {
          if (toast && toast.success) {
            toast.success("No flashcards in selected sets. Add some first!", { icon: "ℹ️" });
          } else {
            console.warn("Toast not initialized, skipping no flashcards toast");
          }
        }, 100);
      }
    } catch (err) {
      console.error("Flashcards fetch error:", err);
      if (toast && toast.error) {
        toast.error(err.message);
      } else {
        console.warn("Toast not initialized, skipping flashcards error toast");
      }
    }
  }, [selectedSetIds]);

  const handleNext = (correct) => {
    if (flashcards.length === 0) return;
    const newAttempt = { flashcard_id: flashcards[currentIndex]._id, correct, time_taken: 0 };
    const updatedAttempts = [...attempts, newAttempt];
    setAttempts(updatedAttempts);
    setShowBack(false);
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsSessionComplete(true);
    }
  };

  const submitAttempt = async () => {
    setLoading(true);
    const storedUser = JSON.parse(localStorage.getItem("flashUser") || "{}");
    const correctCount = attempts.filter(a => a.correct).length;
    const payload = {
      user_id: storedUser.username,
      set_ids: selectedSetIds.length > 0 ? selectedSetIds : [],
      flashcards: attempts,
      correctCount
    };
    try {
      const res = await fetch(`/studyflash/api/practice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed to save attempt: ${res.status} ${res.statusText}`);
      }
      if (toast && toast.success) {
        toast.success(`Practice session saved! Score updated (+${correctCount} points)`);
      }
      setAttempts([]);
      setCurrentIndex(0);
      setShowBack(false);
      setSelectedSetIds([]);
      setFlashcards([]);
      setIsModalOpen(false);
      setIsSessionComplete(false);
    } catch (err) {
      console.error("Practice submit error:", err);
      if (toast && toast.error) {
        toast.error(err.message);
      } else {
        console.warn("Toast not initialized, skipping submit error toast");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStartPractice = () => {
    if (flashcards.length === 0) {
      if (toast && toast.error) {
        toast.error("No flashcards available. Add some in Flashcards!");
      } else {
        console.warn("Toast not initialized, skipping no flashcards error toast");
      }
      return;
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (attempts.length > 0) {
      if (isSessionComplete) {
        if (!confirm("You've answered all cards but haven't submitted your answers. Close anyway?")) return;
      } else {
        if (!confirm("You have unsaved practice attempts. Close anyway?")) return;
      }
    }
    setIsModalOpen(false);
    setShowBack(false);
    setCurrentIndex(0);
    setAttempts([]);
    setIsSessionComplete(false);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Toaster />
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (sets.length === 0) {
    return (
      <ProtectedRoute>
        <Toaster />
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
        <Toaster />
        <h1 className="text-3xl font-bold mb-6">Practice Flashcards</h1>
        <div className="glass-effect p-6 rounded-2xl mb-6">
          <h2 className="text-xl font-semibold mb-4">Select Sets</h2>
          <div className="flex gap-2 overflow-x-auto mb-6 transition-all duration-200">
            <button
              className={`px-4 py-2 rounded font-roboto-mono transition-colors duration-200 ${
                selectedSetIds.length === 0 ? "bg-blue-500 text-white" : "bg-white/20"
              }`}
              onClick={() => handleSetSelect(null)}
            >
              All Cards
            </button>
            {sets.map((set) => (
              <button
                key={set._id}
                className={`px-4 py-2 rounded font-roboto-mono transition-colors duration-200 ${
                  selectedSetIds.includes(set._id) ? "bg-blue-500 text-white" : "bg-white/20"
                }`}
                onClick={() => handleSetSelect(set._id)}
              >
                {set.name}
              </button>
            ))}
          </div>
          {selectedSetIds.length > 0 && flashcards.length === 0 ? (
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
            flashcards.length > 0 && (
              <button
                className="btn glass-effect px-5 py-2 font-semibold bg-green-500 transition-transform duration-200 hover:scale-105"
                onClick={handleStartPractice}
                disabled={loading}
              >
                Start Practice
              </button>
            )
          )}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="glass-effect p-6 rounded-2xl max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4">Practice Session</h2>
              <p className="mb-4">
                Session Score: {attempts.filter(a => a.correct).length}/{flashcards.length} correct
              </p>
              {flashcards.length > 0 && !isSessionComplete && (
                <>
                  <div className="relative w-full h-48 perspective-1000 cursor-pointer" onClick={() => setShowBack(!showBack)}>
                    <div className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${showBack ? "rotate-y-180" : "rotate-y-0"}`}>
                      <div className={`absolute w-full h-full bg-blue-950 shadow-lg rounded-lg flex items-center justify-center p-6 text-blue-100 ${showBack ? "opacity-0" : "opacity-100"}`}>
                        <p className="text-center">{flashcards[currentIndex]?.front || "Front not loaded"}</p>
                      </div>
                      <div className={`absolute w-full h-full bg-blue-100 shadow-lg rounded-lg flex items-center justify-center p-6 text-blue-950 rotate-y-180 ${showBack ? "opacity-100" : "opacity-0"}`}>
                        <p className="text-center">{flashcards[currentIndex]?.back || "Back not loaded"}</p>
                      </div>
                    </div>
                  </div>
                  {showBack && (
                    <div className="flex gap-4 mt-4">
                      <button
                        className="btn glass-effect px-5 py-2 font-semibold !bg-green-800 transition-transform duration-200 hover:scale-105"
                        onClick={() => handleNext(true)}
                        disabled={loading}
                      >
                        Correct
                      </button>
                      <button
                        className="btn glass-effect px-5 py-2 font-semibold !bg-red-800 transition-transform duration-200 hover:scale-105"
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
              {isSessionComplete && (
                <div className="mt-4">
                  <button
                    className="btn glass-effect px-5 py-2 font-semibold bg-blue-500 transition-transform duration-200 hover:scale-105"
                    onClick={submitAttempt}
                    disabled={loading}
                  >
                    Submit Answers
                  </button>
                </div>
              )}
              <button
                className="btn glass-effect px-5 py-2 font-semibold mt-4 transition-transform duration-200 hover:scale-105"
                onClick={handleCloseModal}
                disabled={loading}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
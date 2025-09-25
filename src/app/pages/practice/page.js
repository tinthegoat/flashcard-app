// src/app/pages/practice/page.js

import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";

export default function PracticePage() {
  const [flashcards, setFlashcards] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [sessionSubmitted, setSessionSubmitted] = useState(false);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAttempts, setShowAttempts] = useState(false);
  const [error, setError] = useState(null);

  // TODO: Replace with actual user id from auth
  const userId = typeof window !== "undefined" ? localStorage.getItem("flashUserId") : null;

  // Fetch flashcards for practice
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`/api/flashcards?user_id=${userId}`)
      .then(res => res.json())
      .then(data => {
        setFlashcards(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  // Fetch past attempts
  const fetchAttempts = () => {
    if (!userId) return;
    fetch(`/api/practice?user_id=${userId}`)
      .then(res => res.json())
      .then(setAttempts);
  };

  const handleAnswer = correct => {
    setAnswers([...answers, { flashcard_id: flashcards[current]._id, correct }]);
    setCurrent(current + 1);
  };

  const handleSubmitSession = async () => {
    setError(null);
    const res = await fetch("/api/practice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, flashcards: answers })
    });
    if (!res.ok) {
      setError("Failed to submit session");
      return;
    }
    setSessionSubmitted(true);
    setAnswers([]);
    setCurrent(0);
    fetchAttempts();
  };

  return (
    <ProtectedRoute>
      <div className="max-w-xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Practice</h1>
        {loading ? (
          <div>Loading...</div>
        ) : sessionSubmitted ? (
          <div className="mb-4">
            <div className="text-green-600 font-semibold mb-2">Session submitted!</div>
            <button className="btn" onClick={() => setSessionSubmitted(false)}>Practice Again</button>
          </div>
        ) : flashcards.length === 0 ? (
          <div>No flashcards to practice.</div>
        ) : current < flashcards.length ? (
          <div className="mb-6 p-6 border rounded bg-white/10 flex flex-col items-center">
            <div className="text-lg font-semibold mb-4">Card {current + 1} of {flashcards.length}</div>
            <div className="text-2xl font-bold mb-2">{flashcards[current].front}</div>
            <div className="mb-4 text-gray-700">{flashcards[current].back}</div>
            <div className="flex gap-4">
              <button className="btn glass-effect" onClick={() => handleAnswer(true)}>Correct</button>
              <button className="btn" onClick={() => handleAnswer(false)}>Wrong</button>
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <div className="mb-2">Practice complete!</div>
            <button className="btn glass-effect mr-2" onClick={handleSubmitSession}>Submit Session</button>
            <button className="btn" onClick={() => { setAnswers([]); setCurrent(0); }}>Restart</button>
            {error && <div className="text-red-500 mt-2">{error}</div>}
          </div>
        )}

        <button className="btn mt-6" onClick={() => { setShowAttempts(!showAttempts); if (!showAttempts) fetchAttempts(); }}>
          {showAttempts ? "Hide Past Attempts" : "Show Past Attempts"}
        </button>
        {showAttempts && (
          <div className="mt-4">
            <h2 className="text-xl font-bold mb-2">Past Attempts</h2>
            {attempts.length === 0 ? (
              <div>No attempts found.</div>
            ) : (
              <ul className="space-y-2">
                {attempts.map((a, i) => (
                  <li key={a._id || i} className="p-3 border rounded bg-white/10">
                    <div>Date: {new Date(a.date_time).toLocaleString()}</div>
                    <div>Correct: {a.flashcards.filter(f => f.correct).length} / {a.flashcards.length}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
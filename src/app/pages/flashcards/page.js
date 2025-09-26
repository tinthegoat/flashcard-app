// src/app/pages/flashcards/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import toast from "react-hot-toast";

export default function FlashcardsPage() {
  const [sets, setSets] = useState([]);
  const [selectedSetId, setSelectedSetId] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("flashUser") || "{}");
    if (!storedUser.username) {
      toast.error("Please login to manage flashcards");
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
    setSelectedSetId(setId);
    setFlashcards([]);
    setFront("");
    setBack("");
    setEditingId(null);
    setLoading(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem("flashUser") || "{}");
      const url = setId
        ? `/studyflash/api/flashcards?set_id=${setId}`
        : `/studyflash/api/flashcards?user_id=${encodeURIComponent(storedUser.username)}`;
      console.log("Fetching flashcards with URL:", url);
      const res = await fetch(url);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(`Failed to fetch flashcards: ${res.status} - ${errorData.error || "Unknown error"}`);
      }
      const data = await res.json();
      console.log("Flashcards received:", data);
      setFlashcards(data);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSetId) {
      toast.error("Please select a set");
      return;
    }
    setLoading(true);
    const storedUser = JSON.parse(localStorage.getItem("flashUser") || "{}");
    const payload = {
      user_id: storedUser.username,
      set_id: selectedSetId,
      front,
      back,
      isPublic: false, // Default to private
    };
    try {
      const url = editingId ? `/studyflash/api/flashcards` : `/studyflash/api/flashcards`;
      const method = editingId ? "PATCH" : "POST";
      const body = editingId ? { ...payload, flashcard_id: editingId } : payload;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Operation failed");

      if (editingId) {
        setFlashcards(flashcards.map((card) => (card._id === editingId ? data : card)));
        toast.success("Flashcard updated!");
        setEditingId(null);
      } else {
        setFlashcards([...flashcards, data]);
        toast.success("Flashcard created!");
      }
      setFront("");
      setBack("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (flashcard_id) => {
    setLoading(true);
    try {
      const res = await fetch(`/studyflash/api/flashcards`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flashcard_id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete flashcard");

      setFlashcards(flashcards.filter((card) => card._id !== flashcard_id));
      toast.success("Flashcard deleted!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (card) => {
    setEditingId(card._id);
    setFront(card.front);
    setBack(card.back);
  };

  const createSet = async (e) => {
    e.preventDefault();
    const name = prompt("Enter set name:");
    if (!name) return;
    const storedUser = JSON.parse(localStorage.getItem("flashUser") || "{}");
    try {
      const res = await fetch("/studyflash/api/sets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: storedUser.username, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create set");
      setSets([...sets, data]);
      toast.success("Set created!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const toggleSetPublic = async (setId, currentIsPublic) => {
    setLoading(true);
    try {
      const res = await fetch("/studyflash/api/sets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ set_id: setId, isPublic: !currentIsPublic }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update set");
      setSets(sets.map((set) => (set._id === setId ? { ...set, isPublic: !currentIsPublic } : set)));
      toast.success(`Set ${!currentIsPublic ? "made public" : "made private"}!`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-5 font-roboto-mono">
        <h1 className="text-3xl font-bold mb-6">My Flashcards</h1>
        <div className="glass-effect p-6 rounded-2xl mb-6">
          <h2 className="text-xl font-semibold mb-4">My Sets</h2>
          <button onClick={createSet} className="btn glass-effect px-5 py-2 font-semibold mb-4">
            Create New Set
          </button>
          <div className="flex gap-2 overflow-x-auto mb-4">
            <button
              className={`px-4 py-2 rounded font-roboto-mono ${!selectedSetId ? "bg-blue-500 text-white" : "bg-white/20"}`}
              onClick={() => handleSetSelect(null)}
            >
              All Cards
            </button>
            {sets.map((set) => (
              <div key={set._id} className="flex items-center gap-2">
                <button
                  className={`px-4 py-2 rounded font-roboto-mono ${selectedSetId === set._id ? "bg-blue-500 text-white" : "bg-white/20"}`}
                  onClick={() => handleSetSelect(set._id)}
                >
                  {set.name}
                </button>
                <button
                  onClick={() => toggleSetPublic(set._id, set.isPublic)}
                  className="btn glass-effect px-3 py-1 text-sm transition-transform duration-200 hover:scale-105"
                  disabled={loading}
                >
                  {set.isPublic ? "Make Private" : "Make Public"}
                </button>
              </div>
            ))}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="glass-effect p-6 rounded-2xl mb-6">
          <input
            type="text"
            placeholder="Front"
            value={front}
            onChange={(e) => setFront(e.target.value)}
            className="px-4 py-2 rounded bg-black/30 focus:outline-none mb-3 w-full text-white"
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Back"
            value={back}
            onChange={(e) => setBack(e.target.value)}
            className="px-4 py-2 rounded bg-black/30 focus:outline-none mb-3 w-full text-white"
            disabled={loading}
          />
          <button
            type="submit"
            className="btn glass-effect px-5 py-2 font-semibold transition-transform duration-200 hover:scale-105 disabled:opacity-50"
            disabled={loading || !selectedSetId}
          >
            {loading ? "Processing..." : editingId ? "Update Flashcard" : "Add Flashcard"}
          </button>
        </form>
        {loading && (
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {flashcards.length === 0 && !loading ? (
            <p>No flashcards in this set. Add some!</p>
          ) : (
            flashcards.map((card) => (
              <div key={card._id} className="glass-effect p-4 rounded-2xl">
                <h3 className="font-bold">{card.front}</h3>
                <p>{card.back}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleEdit(card)}
                    className="btn glass-effect px-3 py-1 text-sm transition-transform duration-200 hover:scale-105"
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(card._id)}
                    className="btn glass-effect px-3 py-1 text-sm bg-red-500 transition-transform duration-200 hover:scale-105"
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
// src/app/pages/flashcards/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ProtectedRoute from "@/components/ProtectedRoute";
import toast from "react-hot-toast";

export default function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState([]);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [tags, setTags] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const fetchFlashcards = async () => {
      if (!session) return;
      setLoading(true);
      const res = await fetch(`/api/flashcards?user_id=${session.user.username}`);
      if (res.ok) {
        const data = await res.json();
        setFlashcards(data);
      } else {
        toast.error("Failed to load flashcards");
      }
      setLoading(false);
    };
    fetchFlashcards();
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      user_id: session.user.username,
      front,
      back,
      isPublic,
      tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    };

    const url = editingId ? `/api/flashcards` : `/api/flashcards`;
    const method = editingId ? "PATCH" : "POST";
    const body = editingId ? { ...payload, flashcard_id: editingId } : payload;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const updatedCard = await res.json();
      if (editingId) {
        setFlashcards(flashcards.map((card) => (card._id === editingId ? updatedCard : card)));
        toast.success("Flashcard updated!");
        setEditingId(null);
      } else {
        setFlashcards([...flashcards, updatedCard]);
        toast.success("Flashcard created!");
      }
      setFront("");
      setBack("");
      setTags("");
      setIsPublic(false);
    } else {
      toast.error("Operation failed");
    }
    setLoading(false);
  };

  const handleDelete = async (flashcard_id) => {
    setLoading(true);
    const res = await fetch(`/api/flashcards`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flashcard_id }),
    });

    if (res.ok) {
      setFlashcards(flashcards.filter((card) => card._id !== flashcard_id));
      toast.success("Flashcard deleted!");
    } else {
      toast.error("Failed to delete flashcard");
    }
    setLoading(false);
  };

  const handleEdit = (card) => {
    setEditingId(card._id);
    setFront(card.front);
    setBack(card.back);
    setTags(card.tags.join(", "));
    setIsPublic(card.isPublic);
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-5 font-roboto-mono">
        <h1 className="text-3xl font-bold mb-6">My Flashcards</h1>
        <form onSubmit={handleSubmit} className="glass-effect p-6 rounded-2xl mb-6">
          <input
            type="text"
            placeholder="Front"
            value={front}
            onChange={(e) => setFront(e.target.value)}
            className="px-4 py-2 rounded bg-black/30 focus:outline-none mb-3 w-full"
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Back"
            value={back}
            onChange={(e) => setBack(e.target.value)}
            className="px-4 py-2 rounded bg-black/30 focus:outline-none mb-3 w-full"
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Tags (comma-separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="px-4 py-2 rounded bg-black/30 focus:outline-none mb-3 w-full"
            disabled={loading}
          />
          <label className="flex items-center mb-3">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              disabled={loading}
            />
            <span className="ml-2">Public</span>
          </label>
          <button
            type="submit"
            className="btn glass-effect px-5 py-2 font-semibold transition-transform duration-200 hover:scale-105 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Processing..." : editingId ? "Update Flashcard" : "Add Flashcard"}
          </button>
        </form>
        {loading && (
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {flashcards.map((card) => (
            <div key={card._id} className="glass-effect p-4 rounded-2xl">
              <h2 className="font-bold">{card.front}</h2>
              <p>{card.back}</p>
              <p className="text-sm text-gray-400">Tags: {card.tags.join(", ")}</p>
              <p className="text-sm text-gray-400">{card.isPublic ? "Public" : "Private"}</p>
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
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
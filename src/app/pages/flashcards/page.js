// src/app/pages/flashcards/page.js
"use client";


import ProtectedRoute from "../../components/ProtectedRoute";
import { useEffect, useState } from "react";

export default function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ front: "", back: "", tags: "", isPublic: false });
  const [editId, setEditId] = useState(null);

  // TODO: Replace with actual user id from auth
  const userId = typeof window !== "undefined" ? localStorage.getItem("flashUserId") : null;

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`/api/flashcards?user_id=${userId}`)
      .then(res => res.json())
      .then(setFlashcards)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    const method = editId ? "PATCH" : "POST";
    const body = editId
      ? { flashcard_id: editId, ...form, tags: form.tags.split(",").map(t => t.trim()) }
      : { user_id: userId, ...form, tags: form.tags.split(",").map(t => t.trim()) };
    const res = await fetch("/api/flashcards", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      setError("Failed to save flashcard");
      return;
    }
    setShowForm(false);
    setForm({ front: "", back: "", tags: "", isPublic: false });
    setEditId(null);
    // Refresh list
    fetch(`/api/flashcards?user_id=${userId}`)
      .then(res => res.json())
      .then(setFlashcards);
  };

  const handleEdit = card => {
    setEditId(card._id);
    setForm({
      front: card.front,
      back: card.back,
      tags: card.tags ? card.tags.join(", ") : "",
      isPublic: card.isPublic || false
    });
    setShowForm(true);
  };

  const handleDelete = async id => {
    if (!window.confirm("Delete this flashcard?")) return;
    await fetch("/api/flashcards", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flashcard_id: id })
    });
    setFlashcards(flashcards.filter(f => f._id !== id));
  };

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">My Flashcards</h1>
        <button
          className="btn glass-effect mb-4"
          onClick={() => {
            setShowForm(true);
            setEditId(null);
            setForm({ front: "", back: "", tags: "", isPublic: false });
          }}
        >
          + New Flashcard
        </button>

        {showForm && (
          <form className="mb-6 p-4 border rounded bg-white/10" onSubmit={handleSubmit}>
            <div className="mb-2">
              <label className="block mb-1">Front</label>
              <input name="front" value={form.front} onChange={handleInputChange} className="w-full p-2 rounded" required />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Back</label>
              <input name="back" value={form.back} onChange={handleInputChange} className="w-full p-2 rounded" required />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Tags (comma separated)</label>
              <input name="tags" value={form.tags} onChange={handleInputChange} className="w-full p-2 rounded" />
            </div>
            <div className="mb-2">
              <label className="inline-flex items-center">
                <input type="checkbox" name="isPublic" checked={form.isPublic} onChange={handleInputChange} />
                <span className="ml-2">Public</span>
              </label>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="btn glass-effect">{editId ? "Update" : "Create"}</button>
              <button type="button" className="btn" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</button>
            </div>
            {error && <div className="text-red-500 mt-2">{error}</div>}
          </form>
        )}

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="space-y-4">
            {flashcards.length === 0 && <div>No flashcards found.</div>}
            {flashcards.map(card => (
              <div key={card._id} className="p-4 border rounded bg-white/10 flex flex-col gap-2">
                <div className="font-semibold">{card.front}</div>
                <div className="text-gray-700">{card.back}</div>
                <div className="text-xs text-gray-500">Tags: {card.tags?.join(", ")}</div>
                <div className="flex gap-2 mt-2">
                  <button className="btn" onClick={() => handleEdit(card)}>Edit</button>
                  <button className="btn" onClick={() => handleDelete(card._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

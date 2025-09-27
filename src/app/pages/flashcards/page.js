// src/app/pages/flashcards/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import toast, { Toaster } from "react-hot-toast";

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
      if (toast && toast.error) {
        toast.error("Please login to manage flashcards");
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
      const res = await fetch(url);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(`Failed to fetch flashcards: ${res.status} - ${errorData.error || res.statusText}`);
      }
      const data = await res.json();
      setFlashcards(data);
      if (data.length === 0 && setId) {
        setTimeout(() => {
          if (toast && toast.success) {
            toast.success("No flashcards in this set. Add some!", { icon: "ℹ️" });
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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSetId) {
      if (toast && toast.error) {
        toast.error("Please select a set");
      } else {
        console.warn("Toast not initialized, skipping set selection error toast");
      }
      return;
    }
    if (!front || !back) {
      if (toast && toast.error) {
        toast.error("Please fill in both front and back fields");
      } else {
        console.warn("Toast not initialized, skipping fields error toast");
      }
      return;
    }
    setLoading(true);
    const storedUser = JSON.parse(localStorage.getItem("flashUser") || "{}");
    const payload = {
      user_id: storedUser.username,
      set_id: selectedSetId,
      front,
      back,
      isPublic: false,
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
      if (!res.ok) throw new Error(data.error || `Operation failed: ${res.status}`);

      if (editingId) {
        setFlashcards(flashcards.map((card) => (card._id === editingId ? data : card)));
        if (toast && toast.success) {
          toast.success("Flashcard updated!");
        }
        setEditingId(null);
      } else {
        setFlashcards([...flashcards, data]);
        if (toast && toast.success) {
          toast.success("Flashcard created!");
        }
      }
      setFront("");
      setBack("");
    } catch (err) {
      console.error("Flashcard submit error:", err);
      if (toast && toast.error) {
        toast.error(err.message);
      } else {
        console.warn("Toast not initialized, skipping submit error toast");
      }
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
      if (!res.ok) throw new Error(data.error || `Failed to delete flashcard: ${res.status}`);

      setFlashcards(flashcards.filter((card) => card._id !== flashcard_id));
      if (toast && toast.success) {
        toast.success("Flashcard deleted!");
      }
    } catch (err) {
      console.error("Flashcard delete error:", err);
      if (toast && toast.error) {
        toast.error(err.message);
      } else {
        console.warn("Toast not initialized, skipping delete error toast");
      }
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
      if (!res.ok) throw new Error(data.error || `Failed to create set: ${res.status}`);
      setSets([...sets, data]);
      if (toast && toast.success) {
        toast.success("Set created!");
      }
      setSelectedSetId(data._id);
      handleSetSelect(data._id);
    } catch (err) {
      console.error("Set creation error:", err);
      if (toast && toast.error) {
        toast.error(err.message);
      } else {
        console.warn("Toast not initialized, skipping set creation error toast");
      }
    }
  };

  const updateSet = async () => {
    if (!selectedSetId) {
      if (toast && toast.error) {
        toast.error("Please select a set to update");
      } else {
        console.warn("Toast not initialized, skipping set update error toast");
      }
      return;
    }
    const name = prompt("Enter new set name:", sets.find(set => set._id === selectedSetId)?.name);
    if (!name) return;
    setLoading(true);
    try {
      const res = await fetch("/studyflash/api/sets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ set_id: selectedSetId, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to update set: ${res.status}`);
      setSets(sets.map(set => (set._id === selectedSetId ? { ...set, name } : set)));
      if (toast && toast.success) {
        toast.success("Set updated!");
      }
    } catch (err) {
      console.error("Set update error:", err);
      if (toast && toast.error) {
        toast.error(err.message);
      } else {
        console.warn("Toast not initialized, skipping set update error toast");
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteSet = async () => {
    if (!selectedSetId) {
      if (toast && toast.error) {
        toast.error("Please select a set to delete");
      } else {
        console.warn("Toast not initialized, skipping set delete error toast");
      }
      return;
    }
    if (!confirm("Are you sure you want to delete this set and all its flashcards?")) return;
    setLoading(true);
    try {
      const res = await fetch("/studyflash/api/sets", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ set_id: selectedSetId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to delete set: ${res.status}`);
      setSets(sets.filter(set => set._id !== selectedSetId));
      setFlashcards([]);
      setSelectedSetId(null);
      if (toast && toast.success) {
        toast.success("Set deleted!");
      }
    } catch (err) {
      console.error("Set delete error:", err);
      if (toast && toast.error) {
        toast.error(err.message);
      } else {
        console.warn("Toast not initialized, skipping set delete error toast");
      }
    } finally {
      setLoading(false);
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
      if (!res.ok) throw new Error(data.error || `Failed to update set: ${res.status}`);
      setSets(sets.map((set) => (set._id === setId ? { ...set, isPublic: !currentIsPublic } : set)));
      if (toast && toast.success) {
        toast.success(`Set ${!currentIsPublic ? "made public" : "made private"}!`);
      }
    } catch (err) {
      console.error("Set public toggle error:", err);
      if (toast && toast.error) {
        toast.error(err.message);
      } else {
        console.warn("Toast not initialized, skipping toggle error toast");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-5 font-roboto-mono">
        <Toaster />
        <h1 className="text-3xl font-bold mb-6">My Flashcards</h1>
        <div className="glass-effect p-6 rounded-2xl mb-6">
          <h2 className="text-xl font-semibold mb-4">My Sets</h2>
          <div className="flex gap-2 mb-4">
            <button onClick={createSet} className="btn glass-effect px-5 py-2 font-semibold transition-transform duration-200 hover:scale-105">
              Create New Set
            </button>
            <button
              onClick={updateSet}
              className="btn glass-effect px-5 py-2 font-semibold transition-transform duration-200 hover:scale-105 disabled:opacity-50"
              disabled={loading || !selectedSetId}
            >
              Rename Set
            </button>
            <button
              onClick={deleteSet}
              className="btn glass-effect px-5 py-2 font-semibold bg-red-500 transition-transform duration-200 hover:scale-105 disabled:opacity-50"
              disabled={loading || !selectedSetId}
            >
              Delete Set
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-4 overflow-x-auto">
            <button
              className={`px-4 py-2 rounded font-roboto-mono transition-colors duration-200 ${
                selectedSetId === null ? "bg-blue-500 text-white" : "bg-white/20"
              }`}
              onClick={() => handleSetSelect(null)}
              disabled={loading}
            >
              All Cards
            </button>
            {sets.map((set) => (
              <button
                key={set._id}
                className={`px-4 py-2 rounded font-roboto-mono transition-colors duration-200 ${
                  selectedSetId === set._id ? "bg-blue-500 text-white" : "bg-white/20"
                }`}
                onClick={() => handleSetSelect(set._id)}
                disabled={loading}
              >
                {set.name}
              </button>
            ))}
            {selectedSetId && (
              <button
                onClick={() => toggleSetPublic(selectedSetId, sets.find(set => set._id === selectedSetId)?.isPublic)}
                className="btn glass-effect px-3 py-2 text-sm transition-transform duration-200 hover:scale-105"
                disabled={loading}
              >
                {sets.find(set => set._id === selectedSetId)?.isPublic ? "Make Private" : "Make Public"}
              </button>
            )}
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
                <div className="mb-2">
                  <p className="font-semibold">Front: {card.front}</p>
                  <p>Back: {card.back}</p>
                </div>
                <div className="flex gap-2">
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
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function Home() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || '/studyflash/api';
  const [publicSets, setPublicSets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSet, setSelectedSet] = useState(null);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    fetch(`${apiBase}/sets?public=true`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch public sets: ${res.status} ${res.statusText}`);
        return res.json();
      })
      .then(async (sets) => {
        const setsWithFlashcards = await Promise.all(
          sets.map(async (set) => {
            try {
              const res = await fetch(`${apiBase}/flashcards?set_id=${set._id}`);
              if (!res.ok) throw new Error(`Failed to fetch flashcards for set ${set._id}`);
              const flashcards = await res.json();
              return {
                ...set,
                flashcards: flashcards.slice(0, 2), // Limit to 2 for display
                flashcardCount: flashcards.length // Store total count
              };
            } catch (err) {
              console.error(`Error fetching flashcards for set ${set._id}:`, err);
              return { ...set, flashcards: [], flashcardCount: 0 };
            }
          })
        );
        const nonEmptySets = setsWithFlashcards.filter(set => set.flashcardCount > 0);
        setPublicSets(nonEmptySets);
      })
      .catch((err) => {
        console.error("Public sets fetch error:", err);
        if (toast && toast.error) {
          toast.error(err.message);
        } else {
          console.warn("Toast not initialized, skipping public sets error toast");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSetClick = async (set) => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/flashcards?set_id=${set._id}`);
      if (!res.ok) throw new Error(`Failed to fetch flashcards for set ${set._id}`);
      const flashcards = await res.json();
      setSelectedSet({ ...set, flashcards });
      setIsModalOpen(true);
    } catch (err) {
      console.error("Flashcards fetch error for modal:", err);
      if (toast && toast.error) {
        toast.error(err.message);
      } else {
        console.warn("Toast not initialized, skipping modal flashcards error toast");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSet(null);
  };

  const handleSaveSet = async () => {
    const storedUser = JSON.parse(localStorage.getItem("flashUser") || "{}");
    if (!storedUser.username) {
      if (toast && toast.error) {
        toast.error("Please login to save this set");
      } else {
        console.warn("Toast not initialized, skipping login error toast");
      }
      router.push("/pages/login");
      return;
    }

    setLoading(true);
    try {
      // Create new set
      const setPayload = {
        user_id: storedUser.username,
        name: `${selectedSet.name} (by ${selectedSet.user_id})`,
        isPublic: false,
      };
      const setRes = await fetch(`${apiBase}/sets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(setPayload),
      });
      const setData = await setRes.json();
      if (!setRes.ok) throw new Error(setData.error || `Failed to create set: ${setRes.status}`);

      // Copy flashcards
      const flashcardPromises = selectedSet.flashcards.map((card) => {
        const flashcardPayload = {
          user_id: storedUser.username,
          set_id: setData._id,
          front: card.front,
          back: card.back,
          isPublic: false,
        };
        return fetch(`${apiBase}/flashcards`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(flashcardPayload),
        }).then((res) => {
          if (!res.ok) {
            return res.json().then((data) => {
              throw new Error(data.error || `Failed to create flashcard: ${res.status}`);
            });
          }
          return res.json();
        });
      });

      await Promise.all(flashcardPromises);
      if (toast && toast.success) {
        toast.success("Set saved successfully!");
      }
      handleCloseModal();
      router.push("/pages/flashcards");
    } catch (err) {
      console.error("Save set error:", err);
      if (toast && toast.error) {
        toast.error(err.message);
      } else {
        console.warn("Toast not initialized, skipping save set error toast");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-5 font-roboto-mono">
      <Toaster />
      <div className="px-5">
        <div className="text-4xl font-bold mb-5 mt-10">
          Create your own flash cards and practice for better grades.
          <div className="text-lg mt-3 font-normal">
            Try it now!
          </div>
        </div>
        <div className="btn glass-effect py-3 w-fit text-lg font-semibold transition-transform duration-200 hover:scale-110">
          <Link href="/pages/flashcards" className="px-10">Get Started</Link>
        </div>
      </div>

      <div className="mt-10 px-5">
        <h2 className="text-2xl font-bold mb-6">Explore Public Flashcard Sets</h2>
        {loading ? (
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        ) : publicSets.length === 0 ? (
          <p>No public flashcard sets with flashcards available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {publicSets.map((set) => (
              <div
                key={set._id}
                className="glass-effect p-4 rounded-2xl cursor-pointer hover:scale-105 transition-transform duration-200"
                onClick={() => handleSetClick(set)}
              >
                <h3 className="font-bold text-lg">{set.name}</h3>
                <p className="text-sm text-gray-400">Created by: {set.user_id}</p>
                <p className="text-sm text-gray-400">Flashcards: {set.flashcardCount}</p>
                <div className="mt-2">
                  <p className="text-sm font-semibold">Sample Flashcards:</p>
                  {set.flashcards.map((card) => (
                    <div key={card._id} className="mt-1">
                      <p className="text-sm font-bold">{card.front}</p>
                      <p className="text-sm">{card.back}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && selectedSet && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-effect p-6 rounded-2xl max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">{selectedSet.name}</h2>
            <p className="text-sm text-gray-400 mb-4">Created by: {selectedSet.user_id}</p>
            <div className="max-h-96 overflow-y-auto">
              {selectedSet.flashcards.length === 0 ? (
                <p>No flashcards in this set.</p>
              ) : (
                selectedSet.flashcards.map((card) => (
                  <div key={card._id} className="mb-4">
                    <p className="text-sm font-bold">{card.front}</p>
                    <p className="text-sm">{card.back}</p>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-4 mt-4">
              <button
                className="btn glass-effect px-5 py-2 font-semibold bg-green-500 transition-transform duration-200 hover:scale-105"
                onClick={handleSaveSet}
                disabled={loading}
              >
                Save Set
              </button>
              <button
                className="btn glass-effect px-5 py-2 font-semibold transition-transform duration-200 hover:scale-105"
                onClick={handleCloseModal}
                disabled={loading}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
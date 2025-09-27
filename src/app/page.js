// src/app/page.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast"; // Default import with Toaster

export default function Home() {
  const [publicSets, setPublicSets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("Initializing toast:", toast); // Debug toast
    setLoading(true);
    fetch(`/studyflash/api/sets?public=true`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch public sets: ${res.status} ${res.statusText}`);
        return res.json();
      })
      .then(async (sets) => {
        console.log("Public sets fetched:", JSON.stringify(sets, null, 2));
        const setsWithFlashcards = await Promise.all(
          sets.map(async (set) => {
            try {
              const res = await fetch(`/studyflash/api/flashcards?set_id=${set._id}`);
              if (!res.ok) throw new Error(`Failed to fetch flashcards for set ${set._id}`);
              const flashcards = await res.json();
              return { ...set, flashcards: flashcards.slice(0, 3) };
            } catch (err) {
              console.error(`Error fetching flashcards for set ${set._id}:`, err);
              return { ...set, flashcards: [] };
            }
          })
        );
        // Filter sets to only include those with at least one flashcard
        const nonEmptySets = setsWithFlashcards.filter(set => set.flashcards.length > 0);
        console.log("Non-empty public sets:", JSON.stringify(nonEmptySets, null, 2));
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

  return (
    <div className="container mx-auto p-5 font-roboto-mono">
      <Toaster /> {/* Render toasts */}
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
              <div key={set._id} className="glass-effect p-4 rounded-2xl">
                <h3 className="font-bold text-lg">{set.name}</h3>
                <p className="text-sm text-gray-400">Created by: {set.user_id}</p>
                <p className="text-sm text-gray-400">Flashcards: {set.flashcards.length}</p>
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
    </div>
  );
}
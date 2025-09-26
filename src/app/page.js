// src/app/page.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function Home() {
  const [publicFlashcards, setPublicFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/studyflash/api/flashcards`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch public flashcards");
        return res.json();
      })
      .then((data) => setPublicFlashcards(data.filter(card => card.isPublic)))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto p-5 font-roboto-mono">
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
        <h2 className="text-2xl font-bold mb-6">Explore Other Users's Flashcards</h2>
        {loading ? (
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        ) : publicFlashcards.length === 0 ? (
          <p>No public flashcards available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {publicFlashcards.map((card) => (
              <div key={card._id} className="glass-effect p-4 rounded-2xl">
                <h3 className="font-bold">{card.front}</h3>
                <p>{card.back}</p>
                <p className="text-sm text-gray-400">Tags: {card.tags.join(", ") || "None"}</p>
                <p className="text-sm text-gray-400">Created by: {card.user_id}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
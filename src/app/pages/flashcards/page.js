// src/app/pages/flashcards/page.js
"use client";

import ProtectedRoute from "../../components/ProtectedRoute";

export default function FlashcardsPage() {
  return (
    <ProtectedRoute>
      <div>Flashcards content here</div>
    </ProtectedRoute>
  );
}

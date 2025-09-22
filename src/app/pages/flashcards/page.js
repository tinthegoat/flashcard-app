"use client";

import ProtectedRoute from "../../components/ProtectedRoute";

export default function FlashcardsPage() {
  return (
    <ProtectedRoute>
      <div>Flashcards content here</div>
    </ProtectedRoute>
  );
}

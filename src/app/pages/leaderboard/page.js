// src/app/pages/leaderboard/page.js
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";

export default function FlashcardsPage() {
  return (
    <ProtectedRoute>
    Leaderboard Page
    </ProtectedRoute>
  );
}
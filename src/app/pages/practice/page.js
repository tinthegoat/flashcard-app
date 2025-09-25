// src/app/pages/practice/page.js
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";

export default function PracticePage() {
  return (
    <ProtectedRoute>
    Practice Page
    </ProtectedRoute>
  );
}
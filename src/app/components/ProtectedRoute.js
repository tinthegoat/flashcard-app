// src/app/components/ProtectedRoute.js
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ProtectedRoute({ children }) {
  const { status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      toast.error("Please login to access this page");
      router.push("/pages/login");
    } else {
      setLoading(false);
    }
  }, [status, router]);

  if (loading || status === "loading") {
    return <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>;
  }

  return <>{children}</>;
}
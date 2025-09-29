"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("flashUser");
    if (!user) {
      router.push("/pages/login");
    } else {
      setLoading(false); // allow rendering
    }
  }, [router]);

  if (loading) return null; // or a spinner

  return <>{children}</>;
}


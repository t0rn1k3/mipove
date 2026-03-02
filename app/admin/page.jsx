"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminDashboard from "./AdminDashboard";
import { getMe, getStoredToken } from "@/lib/api";

export default function AdminPage() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const token = getStoredToken();
      if (!token) {
        router.replace("/join");
        return;
      }
      try {
        const { data } = await getMe();
        if (data.role !== "admin") {
          router.replace("/");
          return;
        }
        setAllowed(true);
      } catch {
        router.replace("/join");
      } finally {
        setLoading(false);
      }
    };
    check();
  }, [router]);

  if (loading || !allowed) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        Loading...
      </div>
    );
  }

  return <AdminDashboard />;
}

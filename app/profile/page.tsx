"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getMe, getStoredToken } from "@/lib/api";

export default function ProfileIndex() {
  const router = useRouter();

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      router.replace("/join");
      return;
    }
    getMe()
      .then(({ data }) => {
        if (data.role === "admin") {
          router.replace("/admin");
          return;
        }
        if (data.role === "master" && data.slug) {
          router.replace(`/profile/${data.slug}`);
          return;
        }
        router.replace("/profile/me");
      })
      .catch(() => router.replace("/join"));
  }, [router]);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <p>Redirecting to your profile...</p>
    </div>
  );
}

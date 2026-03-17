"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getMe, getStoredToken, logout } from "@/lib/api";
import styles from "./admin.module.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [adminName, setAdminName] = useState<string>("");

  useEffect(() => {
    if (!getStoredToken()) {
      router.replace("/join");
      return;
    }
    getMe()
      .then(({ data }) => {
        if (data.role !== "admin") {
          router.replace("/");
          return;
        }
        setIsAuthorized(true);
        setAdminName(data.name);
      })
      .catch(() => {
        logout();
        router.replace("/join");
      });
  }, [router]);

  const handleLogout = async () => {
    await logout();
    router.replace("/join");
  };

  if (isAuthorized === null) {
    return (
      <div className={styles.loading}>
        <p>Checking access...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className={styles.adminLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h1 className={styles.logo}>Mipove Admin</h1>
        </div>
        <nav className={styles.sidebarNav}>
          <Link
            href="/admin"
            className={`${styles.navItem} ${pathname === "/admin" ? styles.navItemActive : ""}`}
          >
            Dashboard
          </Link>
          <Link
            href="/admin/users"
            className={`${styles.navItem} ${pathname === "/admin/users" ? styles.navItemActive : ""}`}
          >
            Users
          </Link>
          <Link
            href="/admin/masters"
            className={`${styles.navItem} ${pathname === "/admin/masters" ? styles.navItemActive : ""}`}
          >
            Masters
          </Link>
        </nav>
        <div className={styles.sidebarFooter}>
          <span className={styles.adminName}>{adminName}</span>
          <button type="button" onClick={handleLogout} className={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { LayoutDashboard, Users, UserCheck, LogOut, Menu, X } from "lucide-react";
import { getMe, logout } from "@/lib/api";
import styles from "./admin.module.css";

const NAV_ITEMS = [
  { href: "/admin", icon: LayoutDashboard, key: "dashboard" as const, exact: true },
  { href: "/admin/users", icon: Users, key: "users" as const, exact: false },
  { href: "/admin/masters", icon: UserCheck, key: "masters" as const, exact: false },
] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("admin");
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [adminName, setAdminName] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
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

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href || pathname === `/en${href}` || pathname === `/ka${href}`
          : pathname.startsWith(href) || pathname.startsWith(`/en${href}`) || pathname.startsWith(`/ka${href}`);

  if (isAuthorized === null) {
    return (
      <div className={styles.loading}>
        <p>{t("checkingAccess")}</p>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className={styles.adminLayout}>
      {/* Mobile hamburger */}
      <button
        type="button"
        className={styles.hamburger}
        aria-label="Toggle navigation"
        onClick={() => setSidebarOpen((v) => !v)}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay when sidebar is open on mobile */}
      {sidebarOpen && (
        <div
          className={styles.sidebarOverlay}
          role="presentation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={styles.sidebar} data-open={sidebarOpen ? "true" : "false"}>
        <div className={styles.sidebarHeader}>
          <h1 className={styles.logo}>
            <span className={styles.logoAccent}>M</span>
            {t("mipoveAdmin").slice(1)}
          </h1>
        </div>

        <nav className={styles.sidebarNav} aria-label="Admin navigation">
          {NAV_ITEMS.map(({ href, icon: Icon, key, exact }) => (
            <Link
              key={href}
              href={href}
              className={`${styles.navItem} ${isActive(href, exact) ? styles.navItemActive : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon className={styles.navIcon} size={18} />
              {t(key)}
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <span className={styles.adminName}>{adminName}</span>
          <button type="button" onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={15} />
            {t("logout")}
          </button>
        </div>
      </aside>

      <main className={styles.main}>{children}</main>
    </div>
  );
}

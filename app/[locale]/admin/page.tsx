"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Users, UserCheck, TrendingUp, CalendarDays, ArrowRight } from "lucide-react";
import { getAdminStats, getAdminUsers, getAdminMasters } from "@/lib/api";
import type { AdminStats } from "@/lib/types";
import styles from "./admin.module.css";

type RecentUser = { _id: string; name: string; email: string; role: string };
type RecentMaster = { _id: string; name: string; email: string; specialty?: string };

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
}

export default function AdminDashboard() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const [stats, setStats] = useState<AdminStats>({});
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentMasters, setRecentMasters] = useState<RecentMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [statsRes, usersRes, mastersRes] = await Promise.all([
          getAdminStats().catch(() => ({})),
          getAdminUsers().catch(() => []),
          getAdminMasters().catch(() => []),
        ]);
        setStats(statsRes);
        setRecentUsers(Array.isArray(usersRes) ? usersRes.slice(0, 5) : []);
        setRecentMasters(Array.isArray(mastersRes) ? mastersRes.slice(0, 5) : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("failedToLoadDashboard"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [t]);

  const totalUsers = stats.users ?? stats.totalUsers ?? recentUsers.length;
  const totalMasters = stats.masters ?? stats.totalMasters ?? recentMasters.length;

  const STAT_CARDS = [
    { label: t("totalUsers"), value: totalUsers, icon: Users },
    { label: t("totalMasters"), value: totalMasters, icon: UserCheck },
    { label: t("activeMasters"), value: "—", icon: TrendingUp },
    { label: t("newThisWeek"), value: "—", icon: CalendarDays },
  ];

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>{t("loadingDashboard")}</p>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{t("dashboard")}</h1>
      </div>

      {error && <p className="mipoveGuestText mipoveGuestText--errorLight">{error}</p>}

      {/* Stat cards */}
      <div className={styles.statsGrid}>
        {STAT_CARDS.map(({ label, value, icon: Icon }) => (
          <div key={label} className={styles.statCard}>
            <div className={styles.statIconWrap}>
              <Icon size={20} />
            </div>
            <div className={styles.statBody}>
              <div className={styles.statLabel}>{label}</div>
              <div className={styles.statValue}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick access cards */}
      <p className={styles.sectionHeader}>{t("quickAccess")}</p>
      <div className={styles.quickGrid}>
        <Link href="/admin/users" className={styles.quickCard}>
          <div className={styles.quickCardIcon}><Users size={22} /></div>
          <div className={styles.quickCardBody}>
            <div className={styles.quickCardTitle}>{t("manageUsers")}</div>
            <div className={styles.quickCardSub}>{t("usersCount", { count: totalUsers })}</div>
          </div>
          <ArrowRight size={18} className={styles.quickCardArrow} />
        </Link>
        <Link href="/admin/masters" className={styles.quickCard}>
          <div className={styles.quickCardIcon}><UserCheck size={22} /></div>
          <div className={styles.quickCardBody}>
            <div className={styles.quickCardTitle}>{t("manageMasters")}</div>
            <div className={styles.quickCardSub}>{t("mastersCount", { count: totalMasters })}</div>
          </div>
          <ArrowRight size={18} className={styles.quickCardArrow} />
        </Link>
      </div>

      {/* Recent tables */}
      <div className={styles.dashboardGrid}>
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h2 className={styles.tableTitle}>{t("recentUsers")}</h2>
            <Link href="/admin/users" className={styles.createBtn}>
              {t("viewAll")}
            </Link>
          </div>
          {recentUsers.length === 0 ? (
            <div className={styles.emptyState}>{t("noUsersYet")}</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{tCommon("name")}</th>
                  <th>{tCommon("email")}</th>
                  <th>{t("colRole")}</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className={styles.avatarCell}>
                        <span className={styles.avatar}>{initials(u.name)}</span>
                        {u.name}
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h2 className={styles.tableTitle}>{t("recentMasters")}</h2>
            <Link href="/admin/masters" className={styles.createBtn}>
              {t("viewAll")}
            </Link>
          </div>
          {recentMasters.length === 0 ? (
            <div className={styles.emptyState}>{t("noMastersYet")}</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{tCommon("name")}</th>
                  <th>{tCommon("email")}</th>
                  <th>{tCommon("specialty")}</th>
                </tr>
              </thead>
              <tbody>
                {recentMasters.map((m) => (
                  <tr key={m._id}>
                    <td>
                      <div className={styles.avatarCell}>
                        <span className={styles.avatar}>{initials(m.name)}</span>
                        {m.name}
                      </div>
                    </td>
                    <td>{m.email}</td>
                    <td>{m.specialty ?? tCommon("emDash")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

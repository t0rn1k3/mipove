"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getAdminStats,
  getAdminUsers,
  getAdminMasters,
} from "@/lib/api";
import styles from "./admin.module.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState<{ users?: number; masters?: number }>({});
  const [recentUsers, setRecentUsers] = useState<Array<{ _id: string; name: string; email: string; role: string }>>([]);
  const [recentMasters, setRecentMasters] = useState<Array<{ _id: string; name: string; email: string; specialty?: string }>>([]);
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
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Dashboard</h1>
      </div>

      {error && <p className={styles.errorMsg}>{error}</p>}

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Users</div>
          <div className={styles.statValue}>
            {stats.users ?? stats.totalUsers ?? recentUsers.length ?? 0}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Masters</div>
          <div className={styles.statValue}>
            {stats.masters ?? stats.totalMasters ?? recentMasters.length ?? 0}
          </div>
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h2 className={styles.tableTitle}>Recent Users</h2>
            <Link href="/admin/users" className={styles.createBtn}>
              View All
            </Link>
          </div>
          {recentUsers.length === 0 ? (
            <div className={styles.emptyState}>No users yet</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
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
            <h2 className={styles.tableTitle}>Recent Masters</h2>
            <Link href="/admin/masters" className={styles.createBtn}>
              View All
            </Link>
          </div>
          {recentMasters.length === 0 ? (
            <div className={styles.emptyState}>No masters yet</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Specialty</th>
                </tr>
              </thead>
              <tbody>
                {recentMasters.map((m) => (
                  <tr key={m._id}>
                    <td>{m.name}</td>
                    <td>{m.email}</td>
                    <td>{m.specialty ?? "—"}</td>
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

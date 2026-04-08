"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getAdminUsers,
  blockAdminUser,
  unblockAdminUser,
} from "@/lib/api";
import type { AdminUser, AdminUsersFilterStatus } from "@/lib/types";
import styles from "../admin.module.css";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<AdminUsersFilterStatus>("all");
  const [search, setSearch] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const statusParam =
        filter === "active" ? "active" : filter === "blocked" ? "blocked" : filter === "new" ? "new" : undefined;
      const data = await getAdminUsers(statusParam ? { status: statusParam } : undefined);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleBlock = async (id: string) => {
    setActionId(id);
    try {
      await blockAdminUser(id);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to block user");
    } finally {
      setActionId(null);
    }
  };

  const handleUnblock = async (id: string) => {
    setActionId(id);
    try {
      await unblockAdminUser(id);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unblock user");
    } finally {
      setActionId(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Users</h1>
      </div>

      {error && <p className="mipoveGuestText mipoveGuestText--errorLight">{error}</p>}

      <div className={styles.filterTabs}>
        {(["all", "active", "blocked", "new"] as const).map((f) => (
          <button
            key={f}
            type="button"
            className={`${styles.filterTab} ${filter === f ? styles.filterTabActive : ""}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>User List</h2>
          <input
            type="search"
            placeholder="Search users..."
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {loading ? (
          <div className={styles.emptyState}>Loading...</div>
        ) : filteredUsers.length === 0 ? (
          <div className={styles.emptyState}>No users found</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone ?? "—"}</td>
                  <td>{u.role}</td>
                  <td>
                    <span
                      className={
                        u.blocked ? styles.badgeBlocked : styles.badgeActive
                      }
                    >
                      {u.blocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td>
                    {u.blocked ? (
                      <button
                        type="button"
                        className={styles.actionBtn + " " + styles.actionBtnUnblock}
                        onClick={() => handleUnblock(u._id)}
                        disabled={actionId === u._id}
                      >
                        Unblock
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={styles.actionBtn + " " + styles.actionBtnBlock}
                        onClick={() => handleBlock(u._id)}
                        disabled={actionId === u._id}
                      >
                        Block
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

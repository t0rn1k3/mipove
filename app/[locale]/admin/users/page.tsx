"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  getAdminUsers,
  blockAdminUser,
  unblockAdminUser,
} from "@/lib/api";
import type { AdminUser, AdminUsersFilterStatus } from "@/lib/types";
import styles from "../admin.module.css";

export default function AdminUsersPage() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
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
    } catch {
      setError(t("failedToFetchUsers"));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [filter, t]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleBlock = async (id: string) => {
    setActionId(id);
    try {
      await blockAdminUser(id);
      await loadUsers();
    } catch {
      setError(t("failedToBlockUser"));
    } finally {
      setActionId(null);
    }
  };

  const handleUnblock = async (id: string) => {
    setActionId(id);
    try {
      await unblockAdminUser(id);
      await loadUsers();
    } catch {
      setError(t("failedToUnblockUser"));
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

  const FILTER_TABS = ["all", "active", "blocked", "new"] as const;

  const filterTabLabel = (f: (typeof FILTER_TABS)[number]) => {
    const keys = {
      all: "filterTabAll",
      active: "filterTabActive",
      blocked: "filterTabBlocked",
      new: "filterTabNew",
    } as const;
    return t(keys[f]);
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{t("usersPageTitle")}</h1>
      </div>

      {error && <p className="mipoveGuestText mipoveGuestText--errorLight">{error}</p>}

      <div className={styles.filterTabs}>
        {FILTER_TABS.map((f) => (
          <button
            key={f}
            type="button"
            className={`${styles.filterTab} ${filter === f ? styles.filterTabActive : ""}`}
            onClick={() => setFilter(f)}
          >
            {filterTabLabel(f)}
          </button>
        ))}
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>{t("userList")}</h2>
          <input
            type="search"
            placeholder={t("searchUsers")}
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {loading ? (
          <div className={styles.emptyState}>{t("loading")}</div>
        ) : filteredUsers.length === 0 ? (
          <div className={styles.emptyState}>{t("noUsersFound")}</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{tCommon("name")}</th>
                <th>{tCommon("email")}</th>
                <th>{tCommon("phone")}</th>
                <th>{t("colRole")}</th>
                <th>{t("status")}</th>
                <th>{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone ?? tCommon("emDash")}</td>
                  <td>{u.role}</td>
                  <td>
                    <span
                      className={
                        u.blocked ? styles.badgeBlocked : styles.badgeActive
                      }
                    >
                      {u.blocked ? tCommon("blocked") : tCommon("active")}
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
                        {t("unblock")}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={styles.actionBtn + " " + styles.actionBtnBlock}
                        onClick={() => handleBlock(u._id)}
                        disabled={actionId === u._id}
                      >
                        {t("block")}
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

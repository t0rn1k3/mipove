"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getAdminMasters,
  blockAdminMaster,
  unblockAdminMaster,
  createAdminMaster,
} from "@/lib/api";
import type { AdminMaster } from "@/lib/types";
import styles from "../admin.module.css";

export default function AdminMastersPage() {
  const [masters, setMasters] = useState<AdminMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    specialty: "",
    location: "",
  });
  const [createLoading, setCreateLoading] = useState(false);

  const loadMasters = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminMasters();
      setMasters(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch masters");
      setMasters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasters();
  }, []);

  const handleBlock = async (id: string) => {
    setActionId(id);
    try {
      await blockAdminMaster(id);
      await loadMasters();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to block master");
    } finally {
      setActionId(null);
    }
  };

  const handleUnblock = async (id: string) => {
    setActionId(id);
    try {
      await unblockAdminMaster(id);
      await loadMasters();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unblock master");
    } finally {
      setActionId(null);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreateLoading(true);
    setError("");
    try {
      await createAdminMaster({
        name: createForm.name,
        email: createForm.email,
        phone: createForm.phone || undefined,
        password: createForm.password,
        specialty: createForm.specialty || undefined,
        location: createForm.location || undefined,
      });
      setShowCreate(false);
      setCreateForm({ name: "", email: "", phone: "", password: "", specialty: "", location: "" });
      await loadMasters();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create master");
    } finally {
      setCreateLoading(false);
    }
  };

  const filteredMasters = masters.filter(
    (m) =>
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      (m.specialty && m.specialty.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Masters</h1>
      </div>

      {error && <p className={styles.errorMsg}>{error}</p>}

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>Master List</h2>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <input
              type="search"
              placeholder="Search masters..."
              className={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              type="button"
              className={styles.createBtn}
              onClick={() => setShowCreate(true)}
            >
              Create Master
            </button>
          </div>
        </div>

        {showCreate && (
          <form
            onSubmit={handleCreateSubmit}
            style={{
              padding: "1.5rem",
              borderBottom: "1px solid #eee",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1rem",
              alignItems: "end",
            }}
          >
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem" }}>Name *</label>
              <input
                type="text"
                required
                value={createForm.name}
                onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                className={styles.searchInput}
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem" }}>Email *</label>
              <input
                type="email"
                required
                value={createForm.email}
                onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
                className={styles.searchInput}
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem" }}>Password *</label>
              <input
                type="password"
                required
                value={createForm.password}
                onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
                className={styles.searchInput}
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem" }}>Phone</label>
              <input
                type="tel"
                value={createForm.phone}
                onChange={(e) => setCreateForm((p) => ({ ...p, phone: e.target.value }))}
                className={styles.searchInput}
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem" }}>Specialty</label>
              <input
                type="text"
                value={createForm.specialty}
                onChange={(e) => setCreateForm((p) => ({ ...p, specialty: e.target.value }))}
                className={styles.searchInput}
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem" }}>Location</label>
              <input
                type="text"
                value={createForm.location}
                onChange={(e) => setCreateForm((p) => ({ ...p, location: e.target.value }))}
                className={styles.searchInput}
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ gridColumn: "1 / -1", display: "flex", gap: "0.5rem" }}>
              <button type="submit" className={styles.createBtn} disabled={createLoading}>
                {createLoading ? "Creating..." : "Create"}
              </button>
              <button type="button" onClick={() => setShowCreate(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className={styles.emptyState}>Loading...</div>
        ) : filteredMasters.length === 0 ? (
          <div className={styles.emptyState}>No masters found</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Specialty</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMasters.map((m) => (
                <tr key={m._id}>
                  <td>{m.name}</td>
                  <td>{m.email}</td>
                  <td>{m.specialty ?? "—"}</td>
                  <td>{m.location ?? "—"}</td>
                  <td>
                    <span
                      className={
                        m.blocked ? styles.badgeBlocked : styles.badgeActive
                      }
                    >
                      {m.blocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td>
                    <Link
                      href={m.slug ? `/profile/${m.slug}` : "#"}
                      className={styles.createBtn}
                      style={{ marginRight: "0.5rem", padding: "0.25rem 0.5rem" }}
                    >
                      View
                    </Link>
                    {m.blocked ? (
                      <button
                        type="button"
                        className={styles.actionBtn + " " + styles.actionBtnUnblock}
                        onClick={() => handleUnblock(m._id)}
                        disabled={actionId === m._id}
                      >
                        Unblock
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={styles.actionBtn + " " + styles.actionBtnBlock}
                        onClick={() => handleBlock(m._id)}
                        disabled={actionId === m._id}
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

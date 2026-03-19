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
import CityAutocomplete from "@/components/CityAutocomplete/CityAutocomplete";
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
          <div className={styles.tableHeaderActions}>
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
            className={styles.createForm}
          >
            <div className={styles.createFormField}>
              <label className={styles.createFormLabel}>Name *</label>
              <input
                type="text"
                required
                value={createForm.name}
                onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                className={`${styles.searchInput} ${styles.createFormInput}`}
              />
            </div>
            <div className={styles.createFormField}>
              <label className={styles.createFormLabel}>Email *</label>
              <input
                type="email"
                required
                value={createForm.email}
                onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
                className={`${styles.searchInput} ${styles.createFormInput}`}
              />
            </div>
            <div className={styles.createFormField}>
              <label className={styles.createFormLabel}>Password *</label>
              <input
                type="password"
                required
                value={createForm.password}
                onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
                className={`${styles.searchInput} ${styles.createFormInput}`}
              />
            </div>
            <div className={styles.createFormField}>
              <label className={styles.createFormLabel}>Phone</label>
              <input
                type="tel"
                value={createForm.phone}
                onChange={(e) => setCreateForm((p) => ({ ...p, phone: e.target.value }))}
                className={`${styles.searchInput} ${styles.createFormInput}`}
              />
            </div>
            <div className={styles.createFormField}>
              <label className={styles.createFormLabel}>Specialty</label>
              <input
                type="text"
                value={createForm.specialty}
                onChange={(e) => setCreateForm((p) => ({ ...p, specialty: e.target.value }))}
                className={`${styles.searchInput} ${styles.createFormInput}`}
              />
            </div>
            <div className={styles.createFormField}>
              <label className={styles.createFormLabel}>Location</label>
              <CityAutocomplete
                value={createForm.location}
                onChange={(v) => setCreateForm((p) => ({ ...p, location: v }))}
                placeholder="Start typing a city..."
              />
            </div>
            <div className={styles.createFormActions}>
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
                      className={`${styles.createBtn} ${styles.viewLink}`}
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

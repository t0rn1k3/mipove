"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Plus, X, Pencil, Coins, ExternalLink } from "lucide-react";
import {
  getAdminMasters,
  blockAdminMaster,
  unblockAdminMaster,
  createAdminMaster,
  updateAdminMaster,
  getAdminMasterCreditBalance,
  getAdminMasterCreditHistory,
  adjustAdminMasterCredits,
} from "@/lib/api";
import type { AdminMaster, CreditTransaction } from "@/lib/types";
import CityAutocomplete from "@/components/CityAutocomplete/CityAutocomplete";
import styles from "../admin.module.css";

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
}

const CREDIT_PAGE_SIZE = 10;

export default function AdminMastersPage() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");

  /* ── List ── */
  const [masters, setMasters] = useState<AdminMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  /* ── Create form ── */
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "", email: "", phone: "", password: "", specialty: "", location: "",
  });
  const [createLoading, setCreateLoading] = useState(false);

  /* ── Edit drawer ── */
  const [editMaster, setEditMaster] = useState<AdminMaster | null>(null);
  const [editForm, setEditForm] = useState({
    name: "", email: "", phone: "", specialty: "", location: "", bio: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  /* ── Credits drawer ── */
  const [selectedMaster, setSelectedMaster] = useState<AdminMaster | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(false);
  const [creditsError, setCreditsError] = useState("");
  const [creditsBalance, setCreditsBalance] = useState<number | null>(null);
  const [creditTransactions, setCreditTransactions] = useState<CreditTransaction[]>([]);
  const [creditPage, setCreditPage] = useState(1);
  const [creditPages, setCreditPages] = useState(1);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustNote, setAdjustNote] = useState("");
  const [adjustLoading, setAdjustLoading] = useState(false);

  /* ── Load masters ── */
  const loadMasters = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminMasters();
      setMasters(Array.isArray(data) ? data : []);
    } catch {
      setError(t("failedToFetchMasters"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMasters(); }, []);

  /* ── Block / unblock ── */
  const handleBlock = async (id: string) => {
    setActionId(id);
    try {
      await blockAdminMaster(id);
      await loadMasters();
    } catch {
      setError(t("failedToBlockMaster"));
    } finally {
      setActionId(null);
    }
  };

  const handleUnblock = async (id: string) => {
    setActionId(id);
    try {
      await unblockAdminMaster(id);
      await loadMasters();
    } catch {
      setError(t("failedToUnblockMaster"));
    } finally {
      setActionId(null);
    }
  };

  /* ── Create ── */
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
    } catch {
      setError(t("failedToCreateMaster"));
    } finally {
      setCreateLoading(false);
    }
  };

  /* ── Edit drawer ── */
  const openEdit = (master: AdminMaster) => {
    setEditMaster(master);
    setEditForm({
      name: master.name ?? "",
      email: master.email ?? "",
      phone: master.phone ?? "",
      specialty: master.specialty ?? "",
      location: master.location ?? "",
      bio: master.bio ?? "",
    });
    setEditError("");
    setEditSuccess("");
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editMaster) return;
    setEditLoading(true);
    setEditError("");
    setEditSuccess("");
    try {
      const updated = await updateAdminMaster(editMaster._id, {
        name: editForm.name || undefined,
        email: editForm.email || undefined,
        phone: editForm.phone || undefined,
        specialty: editForm.specialty || undefined,
        location: editForm.location || undefined,
        bio: editForm.bio || undefined,
      });
      setEditSuccess(t("masterUpdated"));
      setMasters((prev) => prev.map((m) => (m._id === updated._id ? { ...m, ...updated } : m)));
    } catch {
      setEditError(t("failedToUpdateMaster"));
    } finally {
      setEditLoading(false);
    }
  };

  /* ── Credits drawer ── */
  const loadMasterCredits = async (masterId: string, page = 1) => {
    setCreditsLoading(true);
    setCreditsError("");
    try {
      const [balanceRes, historyRes] = await Promise.all([
        getAdminMasterCreditBalance(masterId),
        getAdminMasterCreditHistory(masterId, page, CREDIT_PAGE_SIZE),
      ]);
      setCreditsBalance(balanceRes.balance);
      setCreditTransactions(historyRes.transactions);
      setCreditPage(historyRes.page);
      setCreditPages(Math.max(1, historyRes.pages));
    } catch {
      setCreditsError(t("failedToLoadCredits"));
      setCreditsBalance(null);
      setCreditTransactions([]);
      setCreditPages(1);
    } finally {
      setCreditsLoading(false);
    }
  };

  const handleOpenCredits = async (master: AdminMaster) => {
    setSelectedMaster(master);
    setAdjustAmount("");
    setAdjustNote("");
    await loadMasterCredits(master._id, 1);
  };

  const handleAdjustCredits = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedMaster) return;
    const amount = Number(adjustAmount);
    if (!Number.isFinite(amount) || amount === 0) {
      setCreditsError(t("enterNonZeroAmount"));
      return;
    }
    setAdjustLoading(true);
    setCreditsError("");
    try {
      await adjustAdminMasterCredits({ masterId: selectedMaster._id, amount, note: adjustNote });
      await loadMasterCredits(selectedMaster._id, 1);
      await loadMasters();
      setAdjustAmount("");
      setAdjustNote("");
    } catch {
      setCreditsError(t("failedToAdjustCredits"));
    } finally {
      setAdjustLoading(false);
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
        <div className={styles.pageTitleWrap}>
          <h1 className={styles.pageTitle}>{t("mastersPageTitle")}</h1>
          {!loading && (
            <span className={styles.pageCount}>{filteredMasters.length}</span>
          )}
        </div>
      </div>

      {error && <p className="mipoveGuestText mipoveGuestText--errorLight">{error}</p>}

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>{t("masterList")}</h2>
          <div className={styles.tableHeaderActions}>
            <input
              type="search"
              placeholder={t("searchMasters")}
              className={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              type="button"
              className={styles.createBtn}
              onClick={() => setShowCreate((v) => !v)}
            >
              <Plus size={15} />
              {t("createMaster")}
            </button>
          </div>
        </div>

        {showCreate && (
          <form onSubmit={handleCreateSubmit} className={styles.createForm}>
            {(
              [
                ["name", "text", t("nameLabel"), true],
                ["email", "email", t("emailLabel"), true],
                ["password", "password", t("passwordLabel"), true],
                ["phone", "tel", t("phoneLabel"), false],
                ["specialty", "text", t("specialtyLabel"), false],
              ] as [keyof typeof createForm, string, string, boolean][]
            ).map(([field, type, label, required]) => (
              <div key={field} className={styles.createFormField}>
                <label className={styles.createFormLabel}>{label}</label>
                <input
                  type={type}
                  required={required}
                  value={createForm[field]}
                  onChange={(e) => setCreateForm((p) => ({ ...p, [field]: e.target.value }))}
                  className={`${styles.searchInput} ${styles.createFormInput}`}
                />
              </div>
            ))}
            <div className={styles.createFormField}>
              <label className={styles.createFormLabel}>{t("locationLabel")}</label>
              <CityAutocomplete
                value={createForm.location}
                onChange={(v) => setCreateForm((p) => ({ ...p, location: v }))}
                placeholder={tCommon("startTypingCity")}
              />
            </div>
            <div className={styles.createFormActions}>
              <button type="submit" className={styles.createBtn} disabled={createLoading}>
                {createLoading ? t("creating") : t("create")}
              </button>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setShowCreate(false)}
              >
                {tCommon("cancel")}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className={styles.emptyState}>{t("loading")}</div>
        ) : filteredMasters.length === 0 ? (
          <div className={styles.emptyState}>{t("noMastersFound")}</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{tCommon("name")}</th>
                <th>{tCommon("email")}</th>
                <th>{tCommon("specialty")}</th>
                <th>{tCommon("location")}</th>
                <th>{t("status")}</th>
                <th>{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredMasters.map((m) => (
                <tr key={m._id}>
                  <td>
                    <div className={styles.avatarCell}>
                      <span className={styles.avatar}>{initials(m.name)}</span>
                      {m.name}
                    </div>
                  </td>
                  <td>{m.email}</td>
                  <td>{m.specialty ?? tCommon("emDash")}</td>
                  <td>{m.location ?? tCommon("emDash")}</td>
                  <td>
                    <span className={m.blocked ? styles.badgeBlocked : styles.badgeActive}>
                      {m.blocked ? tCommon("blocked") : tCommon("active")}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                      {m.slug && (
                        <Link href={`/profile/${m.slug}`} className={styles.viewLink}>
                          <ExternalLink size={13} />
                          {tCommon("view")}
                        </Link>
                      )}
                      <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.actionBtnEdit}`}
                        onClick={() => openEdit(m)}
                      >
                        <Pencil size={13} />
                        {t("editMaster")}
                      </button>
                      <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.actionBtnCredits}`}
                        onClick={() => void handleOpenCredits(m)}
                        disabled={creditsLoading && selectedMaster?._id === m._id}
                      >
                        <Coins size={13} />
                        {t("creditsButton")}
                      </button>
                      {m.blocked ? (
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.actionBtnUnblock}`}
                          onClick={() => handleUnblock(m._id)}
                          disabled={actionId === m._id}
                        >
                          {t("unblock")}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.actionBtnBlock}`}
                          onClick={() => handleBlock(m._id)}
                          disabled={actionId === m._id}
                        >
                          {t("block")}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Edit master drawer ── */}
      {editMaster && (
        <>
          <div className={styles.drawerOverlay} onClick={() => setEditMaster(null)} role="presentation" />
          <aside className={styles.drawer} aria-label={t("editMasterTitle", { name: editMaster.name })}>
            <div className={styles.drawerHeader}>
              <h2 className={styles.drawerTitle}>{t("editMasterTitle", { name: editMaster.name })}</h2>
              <button type="button" className={styles.drawerClose} onClick={() => setEditMaster(null)}>
                <X size={18} />
              </button>
            </div>
            <div className={styles.drawerBody}>
              {editError && <p className="mipoveGuestText mipoveGuestText--errorLight">{editError}</p>}
              {editSuccess && <p className={styles.successMsg}>{editSuccess}</p>}
              <form onSubmit={handleEditSubmit} className={styles.editForm}>
                {(
                  [
                    ["name", "text", t("nameLabel")],
                    ["email", "email", t("emailLabel")],
                    ["phone", "tel", t("phoneLabel")],
                    ["specialty", "text", t("specialtyLabel")],
                  ] as [keyof typeof editForm, string, string][]
                ).map(([field, type, label]) => (
                  <div key={field} className={styles.editFormField}>
                    <label className={styles.editFormLabel}>{label}</label>
                    <input
                      type={type}
                      value={editForm[field]}
                      onChange={(e) => setEditForm((p) => ({ ...p, [field]: e.target.value }))}
                      className={styles.editFormInput}
                    />
                  </div>
                ))}
                <div className={styles.editFormField}>
                  <label className={styles.editFormLabel}>{t("locationLabel")}</label>
                  <CityAutocomplete
                    value={editForm.location}
                    onChange={(v) => setEditForm((p) => ({ ...p, location: v }))}
                    placeholder={tCommon("startTypingCity")}
                  />
                </div>
                <div className={styles.editFormField}>
                  <label className={styles.editFormLabel}>{t("bioLabel")}</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm((p) => ({ ...p, bio: e.target.value }))}
                    className={`${styles.editFormInput} ${styles.editFormTextarea}`}
                  />
                </div>
                <div className={styles.editFormActions}>
                  <button type="submit" className={styles.createBtn} disabled={editLoading}>
                    {editLoading ? t("savingChanges") : t("saveChanges")}
                  </button>
                  <button type="button" className={styles.cancelBtn} onClick={() => setEditMaster(null)}>
                    {tCommon("cancel")}
                  </button>
                </div>
              </form>
            </div>
          </aside>
        </>
      )}

      {/* ── Credits drawer ── */}
      {selectedMaster && (
        <>
          <div className={styles.drawerOverlay} onClick={() => setSelectedMaster(null)} role="presentation" />
          <aside className={styles.drawer} aria-label={t("creditsPanelTitle", { name: selectedMaster.name })}>
            <div className={styles.drawerHeader}>
              <h2 className={styles.drawerTitle}>{t("creditsPanelTitle", { name: selectedMaster.name })}</h2>
              <button type="button" className={styles.drawerClose} onClick={() => setSelectedMaster(null)}>
                <X size={18} />
              </button>
            </div>
            <div className={styles.drawerBody}>
              {creditsError && <p className="mipoveGuestText mipoveGuestText--errorLight">{creditsError}</p>}

              {!creditsLoading && creditsBalance !== null && (
                <div className={styles.creditSummary}>
                  <span className={styles.creditSummaryLabel}>{t("currentBalanceLabel")}</span>
                  <strong className={styles.creditSummaryValue}>{creditsBalance}</strong>
                </div>
              )}

              <form className={styles.creditAdjustForm} onSubmit={handleAdjustCredits}>
                <div className={styles.editFormField}>
                  <label className={styles.editFormLabel}>{t("adjustAmountLabel")}</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    className={styles.editFormInput}
                    placeholder={t("adjustAmountPlaceholder")}
                  />
                </div>
                <div className={styles.editFormField}>
                  <label className={styles.editFormLabel}>{t("adjustNoteLabel")}</label>
                  <input
                    type="text"
                    value={adjustNote}
                    onChange={(e) => setAdjustNote(e.target.value)}
                    className={styles.editFormInput}
                    placeholder={t("adjustNotePlaceholder")}
                  />
                </div>
                <div className={styles.editFormActions} style={{ gridColumn: "1/-1" }}>
                  <button type="submit" className={styles.createBtn} disabled={adjustLoading}>
                    {adjustLoading ? t("adjustingCredits") : t("adjustCreditsSubmit")}
                  </button>
                </div>
              </form>

              <div className={styles.creditHistoryWrap}>
                <h3 className={styles.creditHistoryTitle}>{t("transactionHistoryTitle")}</h3>
                {creditsLoading ? (
                  <div className={styles.emptyState}>{t("loading")}</div>
                ) : creditTransactions.length === 0 ? (
                  <p className={styles.emptyState}>{t("noCreditTransactions")}</p>
                ) : (
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>{t("colDate")}</th>
                        <th>{t("colAmount")}</th>
                        <th>{t("colBalance")}</th>
                        <th>{t("colNote")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {creditTransactions.map((tx) => (
                        <tr key={tx._id}>
                          <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                          <td className={tx.amount >= 0 ? styles.creditAmountPlus : styles.creditAmountMinus}>
                            {tx.amount >= 0 ? "+" : ""}{tx.amount}
                          </td>
                          <td>{tx.balanceAfter}</td>
                          <td>{tx.metadata?.note ?? tCommon("emDash")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {creditPages > 1 && (
                  <div className={styles.creditPager}>
                    <button
                      type="button"
                      className={styles.actionBtn}
                      disabled={creditPage <= 1 || creditsLoading}
                      onClick={() => selectedMaster && void loadMasterCredits(selectedMaster._id, creditPage - 1)}
                    >
                      {tCommon("previousPage")}
                    </button>
                    <span className={styles.creditPagerInfo}>
                      {t("pagerInfo", { page: creditPage, pages: creditPages })}
                    </span>
                    <button
                      type="button"
                      className={styles.actionBtn}
                      disabled={creditPage >= creditPages || creditsLoading}
                      onClick={() => selectedMaster && void loadMasterCredits(selectedMaster._id, creditPage + 1)}
                    >
                      {tCommon("nextPage")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}

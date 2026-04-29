"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  getAdminMasters,
  blockAdminMaster,
  unblockAdminMaster,
  createAdminMaster,
  getAdminMasterCreditBalance,
  getAdminMasterCreditHistory,
  adjustAdminMasterCredits,
} from "@/lib/api";
import type { AdminMaster, CreditTransaction } from "@/lib/types";
import CityAutocomplete from "@/components/CityAutocomplete/CityAutocomplete";
import styles from "../admin.module.css";

export default function AdminMastersPage() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const CREDIT_HISTORY_PAGE_SIZE = 10;
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

  const loadMasters = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminMasters();
      setMasters(Array.isArray(data) ? data : []);
    } catch {
      setError(t("failedToFetchMasters"));
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

  const loadMasterCredits = async (masterId: string, page = 1) => {
    setCreditsLoading(true);
    setCreditsError("");
    try {
      const [balanceRes, historyRes] = await Promise.all([
        getAdminMasterCreditBalance(masterId),
        getAdminMasterCreditHistory(masterId, page, CREDIT_HISTORY_PAGE_SIZE),
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
      await adjustAdminMasterCredits({
        masterId: selectedMaster._id,
        amount,
        note: adjustNote,
      });
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
        <h1 className={styles.pageTitle}>{t("mastersPageTitle")}</h1>
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
              onClick={() => setShowCreate(true)}
            >
              {t("createMaster")}
            </button>
          </div>
        </div>

        {showCreate && (
          <form
            onSubmit={handleCreateSubmit}
            className={styles.createForm}
          >
            <div className={styles.createFormField}>
              <label className={styles.createFormLabel}>{t("nameLabel")}</label>
              <input
                type="text"
                required
                value={createForm.name}
                onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                className={`${styles.searchInput} ${styles.createFormInput}`}
              />
            </div>
            <div className={styles.createFormField}>
              <label className={styles.createFormLabel}>{t("emailLabel")}</label>
              <input
                type="email"
                required
                value={createForm.email}
                onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
                className={`${styles.searchInput} ${styles.createFormInput}`}
              />
            </div>
            <div className={styles.createFormField}>
              <label className={styles.createFormLabel}>{t("passwordLabel")}</label>
              <input
                type="password"
                required
                value={createForm.password}
                onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
                className={`${styles.searchInput} ${styles.createFormInput}`}
              />
            </div>
            <div className={styles.createFormField}>
              <label className={styles.createFormLabel}>{t("phoneLabel")}</label>
              <input
                type="tel"
                value={createForm.phone}
                onChange={(e) => setCreateForm((p) => ({ ...p, phone: e.target.value }))}
                className={`${styles.searchInput} ${styles.createFormInput}`}
              />
            </div>
            <div className={styles.createFormField}>
              <label className={styles.createFormLabel}>{t("specialtyLabel")}</label>
              <input
                type="text"
                value={createForm.specialty}
                onChange={(e) => setCreateForm((p) => ({ ...p, specialty: e.target.value }))}
                className={`${styles.searchInput} ${styles.createFormInput}`}
              />
            </div>
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
              <button type="button" onClick={() => setShowCreate(false)}>
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
                  <td>{m.name}</td>
                  <td>{m.email}</td>
                  <td>{m.specialty ?? tCommon("emDash")}</td>
                  <td>{m.location ?? tCommon("emDash")}</td>
                  <td>
                    <span
                      className={
                        m.blocked ? styles.badgeBlocked : styles.badgeActive
                      }
                    >
                      {m.blocked ? tCommon("blocked") : tCommon("active")}
                    </span>
                  </td>
                  <td>
                    <Link
                      href={m.slug ? `/profile/${m.slug}` : "#"}
                      className={`${styles.createBtn} ${styles.viewLink}`}
                    >
                      {tCommon("view")}
                    </Link>
                    <button
                      type="button"
                      className={styles.actionBtn + " " + styles.actionBtnCredits}
                      onClick={() => void handleOpenCredits(m)}
                      disabled={creditsLoading && selectedMaster?._id === m._id}
                    >
                      {t("creditsButton")}
                    </button>
                    {m.blocked ? (
                      <button
                        type="button"
                        className={styles.actionBtn + " " + styles.actionBtnUnblock}
                        onClick={() => handleUnblock(m._id)}
                        disabled={actionId === m._id}
                      >
                        {t("unblock")}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={styles.actionBtn + " " + styles.actionBtnBlock}
                        onClick={() => handleBlock(m._id)}
                        disabled={actionId === m._id}
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

      {selectedMaster ? (
        <section className={styles.creditPanel}>
          <div className={styles.creditPanelHeader}>
            <h2 className={styles.tableTitle}>
              {t("creditsPanelTitle", { name: selectedMaster.name })}
            </h2>
            <button
              type="button"
              className={styles.creditPanelClose}
              onClick={() => setSelectedMaster(null)}
            >
              {tCommon("close")}
            </button>
          </div>

          {creditsLoading ? <p className={styles.emptyState}>{t("loading")}</p> : null}
          {creditsError ? (
          <p className="mipoveGuestText mipoveGuestText--errorLight">{creditsError}</p>
        ) : null}

          {!creditsLoading ? (
            <div className={styles.creditSummary}>
              <span className={styles.creditSummaryLabel}>{t("currentBalanceLabel")}</span>
              <strong className={styles.creditSummaryValue}>
                {creditsBalance ?? tCommon("emDash")}
              </strong>
            </div>
          ) : null}

          <form className={styles.creditAdjustForm} onSubmit={handleAdjustCredits}>
            <div className={styles.createFormField}>
              <label className={styles.createFormLabel}>{t("adjustAmountLabel")}</label>
              <input
                type="number"
                step="1"
                required
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                className={`${styles.searchInput} ${styles.createFormInput}`}
                placeholder={t("adjustAmountPlaceholder")}
              />
            </div>
            <div className={styles.createFormField}>
              <label className={styles.createFormLabel}>{t("adjustNoteLabel")}</label>
              <input
                type="text"
                value={adjustNote}
                onChange={(e) => setAdjustNote(e.target.value)}
                className={`${styles.searchInput} ${styles.createFormInput}`}
                placeholder={t("adjustNotePlaceholder")}
              />
            </div>
            <div className={styles.createFormActions}>
              <button type="submit" className={styles.createBtn} disabled={adjustLoading || !selectedMaster}>
                {adjustLoading ? t("adjustingCredits") : t("adjustCreditsSubmit")}
              </button>
            </div>
          </form>

          <div className={styles.creditHistoryWrap}>
            <h3 className={styles.creditHistoryTitle}>{t("transactionHistoryTitle")}</h3>
            {creditTransactions.length === 0 && !creditsLoading ? (
              <p className={styles.emptyState}>{t("noCreditTransactions")}</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{t("colDate")}</th>
                    <th>{t("colType")}</th>
                    <th>{t("colAction")}</th>
                    <th>{t("colAmount")}</th>
                    <th>{t("colBalance")}</th>
                    <th>{t("colNote")}</th>
                  </tr>
                </thead>
                <tbody>
                  {creditTransactions.map((tx) => (
                    <tr key={tx._id}>
                      <td>{new Date(tx.createdAt).toLocaleString()}</td>
                      <td>{tx.type}</td>
                      <td>{tx.action || tCommon("emDash")}</td>
                      <td className={tx.amount >= 0 ? styles.creditAmountPlus : styles.creditAmountMinus}>
                        {tx.amount >= 0 ? "+" : ""}
                        {tx.amount}
                      </td>
                      <td>{tx.balanceAfter}</td>
                      <td>{tx.metadata?.note ?? tCommon("emDash")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {creditPages > 1 ? (
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
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}

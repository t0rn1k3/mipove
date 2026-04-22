"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import CityAutocomplete from "@/components/CityAutocomplete/CityAutocomplete";
import CustomSelect from "@/components/CustomSelect/CustomSelect";
import type { EditProfileModalProps, Professions } from "@/lib/types";
import styles from "./editProfileModal.module.css";
import { getProfessions } from "@/lib/api";
import { mapProfessionsToSelectOptions } from "@/lib/professions";

export default function EditProfileModal({
  open,
  values,
  editError,
  editLoading,
  onClose,
  onSubmit,
  variant = "master",
}: EditProfileModalProps) {
  const t = useTranslations("common");
  const isClientProfile = variant === "user";
  const tProfessions = useTranslations("professions");
  const [professionsRaw, setProfessionsRaw] = useState<Professions[]>([]);
  const [specialtyValue, setSpecialtyValue] = useState(
    () => (values.specialty === "—" ? "" : values.specialty),
  );

  const specialtyOptions = useMemo(
    () => mapProfessionsToSelectOptions(professionsRaw, tProfessions),
    [professionsRaw, tProfessions],
  );

  useEffect(() => {
    if (!open || isClientProfile) return;
    let cancelled = false;
    getProfessions()
      .then((list) => {
        if (!cancelled) {
          const arr = Array.isArray(list) ? list : [];
          setProfessionsRaw(arr);
        }
      })
      .catch(() => {
        if (!cancelled) setProfessionsRaw([]);
      });
    return () => {
      cancelled = true;
    };
  }, [open, isClientProfile]);

  if (!open) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Edit Profile</h2>
          <button
            type="button"
            className={styles.modalClose}
            onClick={onClose}
            aria-label="Close"
          >
            x
          </button>
        </div>
        <form onSubmit={onSubmit} className={styles.editForm}>
          {editError && (
            <p className="mipoveGuestText mipoveGuestText--errorLight">{editError}</p>
          )}
          <div className={styles.formRow}>
            <div className={styles.formField}>
              <label htmlFor="edit-name">{t("name")}</label>
              <input
                id="edit-name"
                name="name"
                defaultValue={values.name}
                required
              />
            </div>
            <div className={styles.formField}>
              <label htmlFor="edit-email">{t("email")}</label>
              <input
                id="edit-email"
                name="email"
                type="email"
                defaultValue={values.email}
                required
              />
            </div>
          </div>
          <div className={styles.formField}>
            <label htmlFor="edit-phone">{t("phone")}</label>
            <input
              id="edit-phone"
              name="phone"
              type="tel"
              defaultValue={values.phone}
            />
          </div>
          {isClientProfile ? (
            <div className={styles.formField}>
              <label htmlFor="edit-location">{t("location")}</label>
              <CityAutocomplete
                id="edit-location"
                name="location"
                defaultValue={values.location === "—" ? "" : values.location}
                placeholder="Start typing a city..."
              />
            </div>
          ) : (
            <>
              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label htmlFor="edit-specialty">{t("specialty")}</label>
                  <input type="hidden" name="specialty" value={specialtyValue} />
                  <CustomSelect
                    id="edit-specialty"
                    aria-label={t("specialty")}
                    value={specialtyValue}
                    placeholder={t("selectSpecialty")}
                    options={specialtyOptions}
                    onChange={setSpecialtyValue}
                  />
                </div>
                <div className={styles.formField}>
                  <label htmlFor="edit-location">{t("location")}</label>
                  <CityAutocomplete
                    id="edit-location"
                    name="location"
                    defaultValue={values.location === "—" ? "" : values.location}
                    placeholder={t("startTypingCity")}
                  />
                </div>
              </div>
              <div className={styles.formField}>
                <label htmlFor="edit-bio">{t("bio")}</label>
                <textarea
                  id="edit-bio"
                  name="bio"
                  rows={4}
                  defaultValue={values.bio}
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label htmlFor="edit-instagram">{t("instagram")}</label>
                  <input
                    id="edit-instagram"
                    name="instagram"
                    defaultValue={values.instagram || ""}
                    placeholder={t("instagramUsername")}
                  />
                </div>
                <div className={styles.formField}>
                  <label htmlFor="edit-website">{t("website")}</label>
                  <input
                    id="edit-website"
                    name="website"
                    type="url"
                    defaultValue={values.website || ""}
                    placeholder={t("websitePlaceholder")}
                  />
                </div>
              </div>
            </>
          )}
          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={editLoading}
            >
              {editLoading ? t("saving") : t("saveChanges")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

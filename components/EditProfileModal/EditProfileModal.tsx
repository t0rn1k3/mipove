"use client";

import { useEffect, useState } from "react";
import CityAutocomplete from "@/components/CityAutocomplete/CityAutocomplete";
import CustomSelect from "@/components/CustomSelect/CustomSelect";
import type { EditProfileModalProps, SelectOption } from "@/lib/types";
import styles from "./editProfileModal.module.css";
import { getProfessions } from "@/lib/api";

export default function EditProfileModal({
  open,
  values,
  editError,
  editLoading,
  onClose,
  onSubmit,
}: EditProfileModalProps) {
  const [specialtyOptions, setSpecialtyOptions] = useState<SelectOption[]>([]);
  const [specialtyValue, setSpecialtyValue] = useState(
    () => (values.specialty === "—" ? "" : values.specialty),
  );

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    getProfessions()
      .then((professions) => {
        if (!cancelled) {
          setSpecialtyOptions(
            professions.map((p) => ({ value: p.id, label: p.label })),
          );
        }
      })
      .catch(() => {
        if (!cancelled) setSpecialtyOptions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

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
          {editError && <p className={styles.editError}>{editError}</p>}
          <div className={styles.formRow}>
            <div className={styles.formField}>
              <label htmlFor="edit-name">Name</label>
              <input
                id="edit-name"
                name="name"
                defaultValue={values.name}
                required
              />
            </div>
            <div className={styles.formField}>
              <label htmlFor="edit-email">Email</label>
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
            <label htmlFor="edit-phone">Phone</label>
            <input
              id="edit-phone"
              name="phone"
              type="tel"
              defaultValue={values.phone}
            />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formField}>
              <label htmlFor="edit-specialty">Specialty</label>
              {/* <input
                id="edit-specialty"
                name="specialty"
                defaultValue={values.specialty === "—" ? "" : values.specialty}
              /> */}
              <input type="hidden" name="specialty" value={specialtyValue} />
              <CustomSelect
                id="edit-specialty"
                aria-label="Specialty"
                value={specialtyValue}
                placeholder="Select a specialty"
                options={specialtyOptions}
                onChange={setSpecialtyValue}
              />
            </div>
            <div className={styles.formField}>
              <label htmlFor="edit-location">Location</label>
              <CityAutocomplete
                id="edit-location"
                name="location"
                defaultValue={values.location === "—" ? "" : values.location}
                placeholder="Start typing a city..."
              />
            </div>
          </div>
          <div className={styles.formField}>
            <label htmlFor="edit-bio">Bio</label>
            <textarea
              id="edit-bio"
              name="bio"
              rows={4}
              defaultValue={values.bio}
            />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formField}>
              <label htmlFor="edit-instagram">Instagram</label>
              <input
                id="edit-instagram"
                name="instagram"
                defaultValue={values.instagram || ""}
                placeholder="@username"
              />
            </div>
            <div className={styles.formField}>
              <label htmlFor="edit-website">Website</label>
              <input
                id="edit-website"
                name="website"
                type="url"
                defaultValue={values.website || ""}
                placeholder="https://"
              />
            </div>
          </div>
          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={editLoading}
            >
              {editLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

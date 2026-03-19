"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { getMe } from "@/lib/api";
import { useTranslations } from "next-intl";
import styles from "./profileRedirect.module.css";

export default function ProfileIndex() {
  const t = useTranslations("profileRedirect");
  const router = useRouter();

  useEffect(() => {
    getMe()
      .then(({ data }) => {
        if (data.role === "admin") {
          router.replace("/admin");
          return;
        }
        if (data.role === "master" && data.slug) {
          router.replace(`/profile/${data.slug}`);
          return;
        }
        router.replace("/profile/me");
      })
      .catch(() => router.replace("/join"));
  }, [router]);

  return (
    <div className={styles.redirectWrapper}>
      <p>{t("message")}</p>
    </div>
  );
}

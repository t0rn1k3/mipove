"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/logo/Logo";
import { Home, ArrowLeft } from "lucide-react";
import styles from "./not-found.module.css";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.logoWrap}>
          <Logo showText size={64} />
        </div>
        <p className={styles.status}>404</p>
        <h1 className={styles.title}>Oops! Something went wrong</h1>
        <p className={styles.message}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className={styles.actions}>
          <Link href="/" className={styles.btnPrimary}>
            <Home size={20} />
            Go Home
          </Link>
          <button
            type="button"
            onClick={() => router.back()}
            className={styles.btnSecondary}
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
        </div>
        <p className={styles.help}>
          Need help?{" "}
          <a href="mailto:hello@mipove.ge" className={styles.helpLink}>
            Contact us
          </a>
        </p>
      </div>
    </main>
  );
}

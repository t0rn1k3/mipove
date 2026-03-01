import Link from "next/link";
import styles from "./cta.module.css";

export default function CTA() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>Ready to Find Your Artisan?</h2>
        <p className={styles.description}>
          Browse our curated directory of master craftspeople
        </p>
        <div className={styles.buttons}>
          <Link href="/gallery" className={styles.buttonPrimary}>
            Explore Gallery
          </Link>
          <Link href="/join" className={styles.buttonSecondary}>
            Join as Professional
          </Link>
        </div>
      </div>
    </section>
  );
}

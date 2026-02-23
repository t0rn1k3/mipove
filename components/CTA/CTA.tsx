import Link from "next/link";
import styles from "./cta.module.css";

export default function CTA() {
  return (
    <section className={styles.container}>
      <div className={styles.content}>
        <h2 className={styles.title}>Ready to Find Your Artisan?</h2>

        <p className={styles.description}>
          Browse our curated directory of master craftspeople
        </p>

        <Link href="/gallery" className={styles.button}>
          Explore Gallery
        </Link>
      </div>
    </section>
  );
}

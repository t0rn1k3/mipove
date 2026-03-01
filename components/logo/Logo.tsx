import Link from "next/link";
import styles from "./logo.module.css";

export type LogoProps = {
  size?: number;
  showText?: boolean;
  asLink?: boolean;
  className?: string;
};

export default function Logo({
  size = 35,
  showText = true,
  asLink = false,
  className = "",
}: LogoProps) {
  const icon = (
    <div className={`${styles.logoWrapper} ${className}`.trim()}>
      <div className={styles.logo}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ color: "var(--teal)" }}
        >
          <circle
            className={styles.searchCircle}
            cx="10.5"
            cy="10.5"
            r="7.5"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <circle
            cx="10.5"
            cy="10.5"
            r="2"
            fill="black"
            className={styles.middleDot}
          />
          <path
            d="M15.7955 15.8111L21 21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {showText && (
        <div className={styles.logoText}>
          <span className={styles.logoSpan}>
            mi<span className={styles.logoSpanHighlight}>po</span>ve
          </span>
        </div>
      )}
    </div>
  );

  if (asLink) {
    return <Link href="/">{icon}</Link>;
  }

  return icon;
}

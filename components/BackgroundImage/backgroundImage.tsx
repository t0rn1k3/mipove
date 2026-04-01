import styles from "./backgroundImage.module.css";

export default function BackgroundImage() {
  return (
    <>
      <div className={styles.backgroundImage} />
      <div className={styles.backgroundOverlay} />
    </>
  );
}
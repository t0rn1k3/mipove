import styles from "./categories.module.css";
import Image from "next/image";

export default function Categories() {
  const items = [
    {
      title: "Painting",
      description: "Expert painters bringing visions to canvas",
    },
    {
      title: "Sculpture",
      description: "Master sculptors crafting timeless pieces",
    },
    {
      title: "Textiles",
      description: "Skilled artisans weaving tradition",
    },
    {
      title: "Restoration",
      description: "Preserving art with precision",
    },
  ];

  return (
    <section className={styles.container}>
      <div className={styles.content}>
        {/* Heading */}
        <h2 className={styles.title}>Discover Craftsmanship</h2>
        <p className={styles.description}>
          Connect with skilled artisans across various disciplines
        </p>

        {/* Cards */}
        <div className={styles.cards}>
          {items.map((item) => (
            <div key={item.title} className={styles.card}>
              <div className={styles.cardIcon}>
                {/* Placeholder icon circle */}
                <Image
                  src="/icons/palette.svg"
                  alt="card icon"
                  width={30}
                  height={30}
                />
              </div>
              <h3 className={styles.cardTitle}>{item.title}</h3>

              <p className={styles.cardDescription}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

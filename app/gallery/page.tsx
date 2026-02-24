import styles from "./galleryPage.module.css";
import Image from "next/image";

export default function Gallery() {
  const WORKS = [
    {
      id: 1,
      title: "Ancient Vase",
      artist: "Luka M.",
      price: "$1,200",
      img: "/images/vase.jpg",
    },
    {
      id: 2,
      title: "Mountain Oil Painting",
      artist: "Mariam T.",
      price: "$850",
      img: "/images/vase.jpg",
    },
    {
      id: 3,
      title: "Mountain Oil Painting",
      artist: "Mariam T.",
      price: "$850",
      img: "/images/vase.jpg",
    },
    {
      id: 4,
      title: "Mountain Oil Painting",
      artist: "Mariam T.",
      price: "$850",
      img: "/images/vase.jpg",
    },
    {
      id: 5,
      title: "Mountain Oil Painting",
      artist: "Mariam T.",
      price: "$850",
      img: "/images/vase.jpg",
    },
    {
      id: 6,
      title: "Mountain Oil Painting",
      artist: "Mariam T.",
      price: "$850",
      img: "/images/vase.jpg",
    },
    {
      id: 7,
      title: "Mountain Oil Painting",
      artist: "Mariam T.",
      price: "$850",
      img: "/images/vase.jpg",
    },
    {
      id: 8,
      title: "Mountain Oil Painting",
      artist: "Mariam T.",
      price: "$850",
      img: "/images/vase.jpg",
    },
    {
      id: 9,
      title: "Mountain Oil Painting",
      artist: "Mariam T.",
      price: "$850",
      img: "/images/vase.jpg",
    },
  ];
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Discover Exquisite Works</h1>
        <div className={styles.filters}>
          {["All", "Painting", "Sculpture", "Pottery", "Jewelry"].map((cat) => (
            <button key={cat} className={styles.filterBtn}>
              {cat}
            </button>
          ))}
        </div>
      </header>

      <div className={styles.grid}>
        {WORKS.map((work) => (
          <div key={work.id} className={styles.card}>
            <div className={styles.imageWrapper}>
              <Image src={work.img} alt={work.title} width={200} height={200} />
            </div>
            <div className={styles.info}>
              <h3>{work.title}</h3>
              <p>{work.artist}</p>
              <span className={styles.price}>{work.price}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

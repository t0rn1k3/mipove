import Link from "next/link";
import { Phone, Mail, Instagram, MapPin } from "lucide-react";
import styles from "./mastersPage.module.css";
import Image from "next/image";

const ARTISANS = [
  {
    id: 1,
    name: "Elena Martinez",
    location: "Barcelona, Spain",
    slug: "elena-martinez",
    image: "/images/artisan-2.jpg",
  },
  {
    id: 2,
    name: "Elena Martinez",
    location: "Barcelona, Spain",
    slug: "elena-martinez",
    image: "/images/artisan-2.jpg",
  },
  {
    id: 3,
    name: "Elena Martinez",
    location: "Barcelona, Spain",
    slug: "elena-martinez",
    image: "/images/artisan-2.jpg",
  },
  {
    id: 4,
    name: "Elena Martinez",
    location: "Barcelona, Spain",
    slug: "elena-martinez",
    image: "/images/artisan-2.jpg",
  },
  {
    id: 5,
    name: "Elena Martinez",
    location: "Barcelona, Spain",
    slug: "elena-martinez",
    image: "/images/artisan-2.jpg",
  },
  {
    id: 6,
    name: "Elena Martinez",
    location: "Barcelona, Spain",
    slug: "elena-martinez",
    image: "/images/artisan-2.jpg",
  },
];

export default function MastersPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Masters Directory</h1>
      <p className={styles.description}>
        Find the best masters in your area
      </p>
      <div className={styles.grid}>
        {ARTISANS.map((artisan) => (
          <div key={artisan.id} className={styles.card}>
            <div className={styles.imageContainer}>
              <Image
                src={artisan.image}
                width={100}
                height={100}
                alt={artisan.name}
                className={styles.artisanImage}
              />
            </div>

            <div className={styles.content}>
              <h2 className={styles.name}>{artisan.name}</h2>
              <div className={styles.location}>
                <MapPin size={18} className={styles.pin} />
                <span>{artisan.location}</span>
              </div>

              <hr className={styles.divider} />

              <div className={styles.footer}>
                <div className={styles.socialIcons}>
                  <button className={styles.iconBtn}>
                    <Phone size={18} />
                  </button>
                  <button className={styles.iconBtn}>
                    <Mail size={18} />
                  </button>
                  <button className={styles.iconBtn}>
                    <Instagram size={18} />
                  </button>
                </div>
                <Link
                  href={`/profile/${artisan.slug}`}
                  className={styles.viewBtn}
                >
                  View Portfolio
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

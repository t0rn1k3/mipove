import Link from "next/link";
import { Phone, Mail, Instagram, MapPin } from "lucide-react"; // Example using lucide-react
import styles from "./professionalsPage.module.css";
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

export default function ProfessionalsPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Professional Directory</h1>
      <p className={styles.description}>
        Find the best professionals in your area
      </p>
      <div className={styles.grid}>
        {ARTISANS.map((artisan) => (
          <div key={artisan.id} className={styles.card}>
            {/* Image Section */}
            <div className={styles.imageContainer}>
              <Image
                src={artisan.image}
                width={100}
                height={100}
                alt={artisan.name}
                className={styles.artisanImage}
              />
            </div>

            {/* Content Section */}
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
                  href={`/professionals/${artisan.slug}`}
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

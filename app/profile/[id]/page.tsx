"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import ProfileSidebar from "@/components/ProfileSidebar/ProfileSidebar";
import LightboxModal from "@/components/LightboxModal/LightboxModal";
import styles from "../profilePage.module.css";

const MOCK_PROFILE = {
  name: "Elena Martinez",
  specialty: "Contemporary Painting",
  location: "Barcelona, Spain",
  bio: "Award-winning contemporary artist with 15+ years of experience. Specializing in abstract expressionism and mixed media works that explore the intersection of color, emotion, and form.",
  phone: "+34 612 345 678",
  email: "elena@example.com",
  instagram: "elenamartinezart",
  website: "www.elenamartinez.art",
  image:
    "https://images.unsplash.com/photo-1651889512068-f1c588fe6649?w=400&q=80",
  works: [
    {
      id: 1,
      title: "Abstract Horizon",
      description: "Mixed media on canvas, 2024",
      image:
        "https://images.unsplash.com/photo-1748285279107-13e8799eab76?w=800&q=80",
    },
    {
      id: 2,
      title: "Modern Forms",
      description: "Acrylic on wood, 2024",
      image:
        "https://images.unsplash.com/photo-1767134426275-059972692c23?w=800&q=80",
    },
    {
      id: 3,
      title: "Ceramic Dreams",
      description: "Hand-painted ceramic, 2023",
      image:
        "https://images.unsplash.com/photo-1656626277991-0fd06ae52d5c?w=800&q=80",
    },
    {
      id: 4,
      title: "Wooden Elegance",
      description: "Mixed media installation, 2024",
      image:
        "https://images.unsplash.com/photo-1732575886697-0ddcbce961dd?w=800&q=80",
    },
    {
      id: 5,
      title: "Portrait in Motion",
      description: "Oil on canvas, 2023",
      image:
        "https://images.unsplash.com/photo-1763070606104-fc2ae79182db?w=800&q=80",
    },
    {
      id: 6,
      title: "Decorative Symphony",
      description: "Mixed media, 2024",
      image:
        "https://images.unsplash.com/photo-1699005005263-c4e05a77d86b?w=800&q=80",
    },
  ],
};

type Work = (typeof MOCK_PROFILE.works)[0];

export default function ProfilePage() {
  const params = useParams();
  const _id = params?.id as string | undefined; // For future API fetch
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const profile = MOCK_PROFILE;

  return (
    <div className={styles.page}>
      <div ref={sectionRef} className={isVisible ? styles.visible : ""}>
        <div className={styles.container}>
          <div className={styles.grid}>
            <div className={styles.sidebar}>
              <ProfileSidebar {...profile} />
            </div>

            <div className={styles.main}>
              <div
                className={`${styles.portfolioHeader} ${styles.scrollReveal} ${styles.scrollRevealDelay1}`}
              >
                <h2 className={styles.portfolioTitle}>Portfolio</h2>
                <p className={styles.portfolioSubtitle}>
                  Explore my collection of works
                </p>
              </div>

              <div className={styles.masonry}>
                {profile.works.map((work, index) => (
                  <div
                    key={work.id}
                    className={`${styles.workCard} ${styles.scrollReveal} ${
                      [
                        styles.scrollRevealDelay2,
                        styles.scrollRevealDelay3,
                        styles.scrollRevealDelay4,
                        styles.scrollRevealDelay5,
                        styles.scrollRevealDelay6,
                        styles.scrollRevealDelay7,
                        styles.scrollRevealDelay8,
                        styles.scrollRevealDelay9,
                        styles.scrollRevealDelay10,
                        styles.scrollRevealDelay11,
                        styles.scrollRevealDelay12,
                        styles.scrollRevealDelay13,
                      ][index]
                    }`}
                    onClick={() => setSelectedWork(work)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedWork(work);
                      }
                    }}
                  >
                    <div className={styles.workImageWrapper}>
                      <Image
                        src={work.image}
                        alt={work.title}
                        width={400}
                        height={500}
                        className={styles.workImage}
                      />
                      <div className={styles.workOverlay} />
                    </div>
                    <div className={styles.workCaption}>
                      <h3 className={styles.workTitle}>{work.title}</h3>
                      <p className={styles.workDescription}>
                        {work.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className={styles.contactSection}>
        <div className={styles.contactContainer}>
          <div className={`${styles.contactHeader} ${styles.scrollReveal}`}>
            <h2 className={styles.contactTitle}>Let&apos;s Work Together</h2>
            <p className={styles.contactSubtitle}>
              Interested in commissioning a piece? Get in touch!
            </p>
          </div>

          <form className={`${styles.contactForm} ${styles.scrollReveal}`}>
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label className={styles.label}>Your Name</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="John Doe"
                />
              </div>
              <div className={styles.formField}>
                <label className={styles.label}>Your Email</label>
                <input
                  type="email"
                  className={styles.input}
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className={styles.formField}>
              <label className={styles.label}>Message</label>
              <textarea
                rows={6}
                className={styles.textarea}
                placeholder="Tell me about your project..."
              />
            </div>

            <button type="submit" className={styles.submitBtn}>
              Send Message
            </button>
          </form>
        </div>
      </section>

      {selectedWork && (
        <LightboxModal
          image={selectedWork.image}
          title={selectedWork.title}
          description={selectedWork.description}
          onClose={() => setSelectedWork(null)}
        />
      )}
    </div>
  );
}

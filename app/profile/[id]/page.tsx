"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import ProfileSidebar from "@/components/ProfileSidebar/ProfileSidebar";
import LightboxModal from "@/components/LightboxModal/LightboxModal";
import {
  getMe,
  getProfileBySlug,
  getStoredToken,
  updateProfile,
  logout,
  getImageUrl,
  uploadProfileImage,
} from "@/lib/api";
import type { RatedMasterItem } from "@/lib/types";
import styles from "../profilePage.module.css";

type ProfileData = {
  name: string;
  specialty: string;
  location: string;
  bio: string;
  phone: string;
  email: string;
  instagram?: string;
  website?: string;
  image: string;
  works: Array<{
    id: string;
    title: string;
    description?: string;
    image: string;
  }>;
};

const DEFAULT_PROFILE: ProfileData = {
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
      id: "1",
      title: "Abstract Horizon",
      description: "Mixed media on canvas, 2024",
      image:
        "https://images.unsplash.com/photo-1748285279107-13e8799eab76?w=800&q=80",
    },
    {
      id: "2",
      title: "Modern Forms",
      description: "Acrylic on wood, 2024",
      image:
        "https://images.unsplash.com/photo-1767134426275-059972692c23?w=800&q=80",
    },
    {
      id: "3",
      title: "Ceramic Dreams",
      description: "Hand-painted ceramic, 2023",
      image:
        "https://images.unsplash.com/photo-1656626277991-0fd06ae52d5c?w=800&q=80",
    },
    {
      id: "4",
      title: "Wooden Elegance",
      description: "Mixed media installation, 2024",
      image:
        "https://images.unsplash.com/photo-1732575886697-0ddcbce961dd?w=800&q=80",
    },
    {
      id: "5",
      title: "Portrait in Motion",
      description: "Oil on canvas, 2023",
      image:
        "https://images.unsplash.com/photo-1763070606104-fc2ae79182db?w=800&q=80",
    },
    {
      id: "6",
      title: "Decorative Symphony",
      description: "Mixed media, 2024",
      image:
        "https://images.unsplash.com/photo-1699005005263-c4e05a77d86b?w=800&q=80",
    },
  ],
};

type Work = ProfileData["works"][0];

function mapMeToProfile(
  data: {
    name: string;
    email: string;
    phone?: string;
    specialty?: string;
    location?: string;
    bio?: string;
    image?: string;
    instagram?: string;
    website?: string;
    works?: Array<{
      id: string;
      title: string;
      description?: string;
      image: string;
    }>;
  },
  role?: string
): ProfileData {
  return {
    name: data.name,
    email: data.email,
    phone: data.phone || "",
    specialty:
      role === "user" ? "Client" : data.specialty || "—",
    location: data.location || "—",
    bio: data.bio || "",
    image:
      getImageUrl(data.image) ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&size=400`,
    instagram: data.instagram,
    website: data.website,
    works: data.works ?? (role === "user" ? [] : DEFAULT_PROFILE.works),
  };
}

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.id as string | undefined;
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0, rootMargin: "0px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  const [userRole, setUserRole] = useState<string | null>(null);
  const [ratedMasters, setRatedMasters] = useState<RatedMasterItem[]>([]);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    if (slug === "me") {
      if (!getStoredToken()) {
        router.replace("/join");
        setLoading(false);
        return;
      }
      getMe()
        .then(({ data }) => {
          setUserRole(data.role);
          if (data.role === "admin") {
            router.replace("/admin");
            return;
          }
          if (data.role === "master" && data.slug) {
            router.replace(`/profile/${data.slug}`);
            return;
          }
          setProfile(mapMeToProfile(data, data.role));
          setIsOwnProfile(true);
          setRatedMasters(data.ratedMasters ?? []);
        })
        .catch(() => router.replace("/join"))
        .finally(() => setLoading(false));
      return;
    }

    const token = getStoredToken();
    if (token) {
      getMe()
        .then(({ data }) => {
          if (data.slug === slug) {
            setProfile(mapMeToProfile(data, data.role));
            setIsOwnProfile(true);
            setLoading(false);
            return;
          }
          return getProfileBySlug(slug).then((p) => {
            setProfile(p);
            setIsOwnProfile(false);
          });
        })
        .catch(() =>
          getProfileBySlug(slug)
            .then((p) => {
              setProfile(p);
              setIsOwnProfile(false);
            })
            .catch(() => {})
        )
        .finally(() => setLoading(false));
    } else {
      getProfileBySlug(slug)
        .then((p) => {
          setProfile(p);
          setIsOwnProfile(false);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [slug, router]);

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  const handleChangePhoto = async (file: File) => {
    setPhotoError("");

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setPhotoError("Please select a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setPhotoError("Image must be 4MB or smaller.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setProfile((p) => ({ ...p, image: previewUrl }));
    setPhotoUploading(true);

    try {
      const res = await uploadProfileImage(file);
      setProfile(mapMeToProfile(res.data, userRole ?? undefined));
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "Upload failed");
      // Best-effort revert: refetch current user if we can
      try {
        const me = await getMe();
        setProfile(mapMeToProfile(me.data, me.data.role));
      } catch {}
    } finally {
      URL.revokeObjectURL(previewUrl);
      setPhotoUploading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    setEditError("");
    setEditLoading(true);
    try {
      const data = await updateProfile({
        name: (form.elements.namedItem("name") as HTMLInputElement)?.value,
        email: (form.elements.namedItem("email") as HTMLInputElement)?.value,
        phone: (form.elements.namedItem("phone") as HTMLInputElement)?.value,
        specialty: (form.elements.namedItem("specialty") as HTMLInputElement)?.value,
        location: (form.elements.namedItem("location") as HTMLInputElement)?.value,
        bio: (form.elements.namedItem("bio") as HTMLTextAreaElement)?.value,
        instagram: (form.elements.namedItem("instagram") as HTMLInputElement)?.value || undefined,
        website: (form.elements.namedItem("website") as HTMLInputElement)?.value || undefined,
      });
      setProfile(mapMeToProfile(data.data, userRole ?? undefined));
      setShowEditModal(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <p className={styles.portfolioSubtitle}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page} ref={sectionRef}>
      <div className={isVisible ? styles.visible : ""}>
        <div className={styles.container}>
          <div className={styles.grid}>
            <div className={styles.sidebar}>
              <ProfileSidebar
                {...profile}
                isOwnProfile={isOwnProfile}
                onEdit={() => setShowEditModal(true)}
                onLogout={handleLogout}
                onChangePhoto={handleChangePhoto}
                isUploadingPhoto={photoUploading}
              />
              {photoError && <p className={styles.emptyRated}>{photoError}</p>}
            </div>

            <div className={styles.main}>
              {userRole === "user" ? (
                <>
                  <div
                    className={`${styles.portfolioHeader} ${styles.scrollReveal} ${styles.scrollRevealDelay1}`}
                  >
                    <h2 className={styles.portfolioTitle}>Rated Masters</h2>
                    <p className={styles.portfolioSubtitle}>
                      Masters you have rated
                    </p>
                  </div>

                  {ratedMasters.length === 0 ? (
                    <p className={styles.emptyRated}>
                      You haven&apos;t rated any masters yet.
                    </p>
                  ) : (
                    <div className={styles.ratedMastersGrid}>
                      {ratedMasters.map((item, index) => (
                        <Link
                          key={item.master._id + item.ratedAt}
                          href={`/profile/${item.master.slug}`}
                          className={`${styles.ratedMasterCard} ${styles.scrollReveal} ${
                            [
                              styles.scrollRevealDelay2,
                              styles.scrollRevealDelay3,
                              styles.scrollRevealDelay4,
                              styles.scrollRevealDelay5,
                              styles.scrollRevealDelay6,
                              styles.scrollRevealDelay7,
                            ][index] ?? styles.scrollRevealDelay7
                          }`}
                        >
                          <div className={styles.ratedMasterImageWrap}>
                            <Image
                              src={
                                getImageUrl(item.master.image) ||
                                "https://ui-avatars.com/api/?name=" +
                                  encodeURIComponent(item.master.name) +
                                  "&size=200"
                              }
                              alt={item.master.name}
                              width={160}
                              height={160}
                              className={styles.ratedMasterImage}
                            />
                            <div className={styles.ratedMasterStars}>
                              <Star size={16} fill="currentColor" />
                              <span>{item.stars}</span>
                            </div>
                          </div>
                          <h3 className={styles.ratedMasterName}>
                            {item.master.name}
                          </h3>
                          {item.master.specialty && (
                            <p className={styles.ratedMasterSpecialty}>
                              {item.master.specialty}
                            </p>
                          )}
                          {item.master.location && (
                            <div className={styles.ratedMasterLocation}>
                              <MapPin size={14} />
                              <span>{item.master.location}</span>
                            </div>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Edit Profile</h2>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => setShowEditModal(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className={styles.editForm}>
              {editError && <p className={styles.editError}>{editError}</p>}
              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label htmlFor="edit-name">Name</label>
                  <input
                    id="edit-name"
                    name="name"
                    defaultValue={profile.name}
                    required
                  />
                </div>
                <div className={styles.formField}>
                  <label htmlFor="edit-email">Email</label>
                  <input
                    id="edit-email"
                    name="email"
                    type="email"
                    defaultValue={profile.email}
                    required
                  />
                </div>
              </div>
              <div className={styles.formField}>
                <label htmlFor="edit-phone">Phone</label>
                <input
                  id="edit-phone"
                  name="phone"
                  type="tel"
                  defaultValue={profile.phone}
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label htmlFor="edit-specialty">Specialty</label>
                  <input
                    id="edit-specialty"
                    name="specialty"
                    defaultValue={profile.specialty === "—" ? "" : profile.specialty}
                  />
                </div>
                <div className={styles.formField}>
                  <label htmlFor="edit-location">Location</label>
                  <input
                    id="edit-location"
                    name="location"
                    defaultValue={profile.location === "—" ? "" : profile.location}
                  />
                </div>
              </div>
              <div className={styles.formField}>
                <label htmlFor="edit-bio">Bio</label>
                <textarea
                  id="edit-bio"
                  name="bio"
                  rows={4}
                  defaultValue={profile.bio}
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label htmlFor="edit-instagram">Instagram</label>
                  <input
                    id="edit-instagram"
                    name="instagram"
                    defaultValue={profile.instagram || ""}
                    placeholder="@username"
                  />
                </div>
                <div className={styles.formField}>
                  <label htmlFor="edit-website">Website</label>
                  <input
                    id="edit-website"
                    name="website"
                    type="url"
                    defaultValue={profile.website || ""}
                    placeholder="https://"
                  />
                </div>
              </div>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={editLoading}
                >
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

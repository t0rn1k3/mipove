"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import ProfileSidebar from "@/components/ProfileSidebar/ProfileSidebar";
import EditProfileModal from "@/components/EditProfileModal/EditProfileModal";
import LightboxModal from "@/components/LightboxModal/LightboxModal";
import PortfolioLightbox from "@/components/PortfolioLightbox/PortfolioLightbox";
import MasterRatingSection from "@/components/MasterRatingSection/MasterRatingSection";
import PortfolioSection from "@/components/PortfolioSection/PortfolioSection";
import RatedMastersList from "@/components/RatedMastersList/RatedMastersList";
import {
  Heart,
  CalendarClock,
  MapPin,
  Banknote,
} from "lucide-react";
import {
  getMe,
  fetchMyPortfolio,
  getProfileBySlug,
  updateProfile,
  logout,
  getImageUrl,
  uploadProfileImage,
  rateMaster,
} from "@/lib/api";
import type {
  MeProfileApiFields,
  ProfileData,
  RatedMasterItem,
  Work,
} from "@/lib/types";
import styles from "../profilePage.module.css";

type FavoriteOrder = {
  id: string;
  imageSrc: string;
  imageAlt: string;
  clientName: string;
  savedAt: string;
  title: string;
  description: string;
  location: string;
  budgetRange: string;
  deadline: string;
};

const DEFAULT_PROFILE: ProfileData = {
  name: "Elena Martinez",
  specialty: "Contemporary Painting",
  location: "Barcelona, Spain",
  bio: "Award-winning contemporary artist with 15+ years of experience. Specializing in abstract expressionism and mixed media works that explore the intersection of color, emotion, and form.",
  rating: 0,
  reviewCount: 0,
  phone: "+34 612 345 678",
  email: "elena@example.com",
  instagram: "elenamartinezart",
  website: "www.elenamartinez.art",
  image:
    "https://images.unsplash.com/photo-1651889512068-f1c588fe6649?w=400&q=80",
  portfolioImages: [],
  works: [],
};

const MOCK_FAVORITE_ORDERS: FavoriteOrder[] = [
  {
    id: "fav-1",
    imageSrc: "https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=200&q=80",
    imageAlt: "Ceramic vase project",
    clientName: "Nino Kvaratskhelia",
    savedAt: "Saved Apr 1, 2026",
    title: "Custom stoneware vase set",
    description: "Three-piece matte vase set in warm earth tones for a dining room centerpiece.",
    location: "Tbilisi",
    budgetRange: "₾320 – ₾480",
    deadline: "1 month",
  },
  {
    id: "fav-2",
    imageSrc: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=200&q=80",
    imageAlt: "Oak table project",
    clientName: "Giorgi Beridze",
    savedAt: "Saved Mar 28, 2026",
    title: "Oak dining table (6 seats)",
    description: "Solid oak farmhouse dining table with oil finish and trestle base.",
    location: "Kutaisi",
    budgetRange: "₾2,800 – ₾4,200",
    deadline: "1 month",
  },
  {
    id: "fav-3",
    imageSrc: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=200&q=80",
    imageAlt: "Wrought iron gate project",
    clientName: "Mariam Gelashvili",
    savedAt: "Saved Mar 21, 2026",
    title: "Garden gate and side panels",
    description: "Powder-coated iron pedestrian gate with matching fixed side panels.",
    location: "Batumi",
    budgetRange: "₾1,900 – ₾2,600",
    deadline: "1 week",
  },
  {
    id: "fav-4",
    imageSrc: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=200&q=80",
    imageAlt: "Kitchen shelf project",
    clientName: "Luka Tsiklauri",
    savedAt: "Saved Mar 10, 2026",
    title: "Wall-mounted kitchen shelf set",
    description: "Custom ash wood shelving with matte black supports and hidden cable channel.",
    location: "Rustavi",
    budgetRange: "₾780 – ₾1,050",
    deadline: "Urgent",
  },
];

function mapMeToProfile(data: MeProfileApiFields, role?: string): ProfileData {
  return {
    name: data.name,
    email: data.email,
    phone: data.phone || "",
    specialty:
      role === "user" ? "Client" : data.specialty || "—",
    location: data.location || "—",
    bio: data.bio || "",
    rating: data.rating ?? 0,
    reviewCount: data.reviewCount ?? 0,
    image:
      getImageUrl(data.image) ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&size=400`,
    instagram: data.instagram,
    website: data.website,
    portfolioImages: (data.portfolioImages ?? []).map((p) => getImageUrl(p)),
    works: data.works ?? [],
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
  const [editModalKey, setEditModalKey] = useState(0);
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [selectedPortfolioIndex, setSelectedPortfolioIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"work" | "favorites">("work");
  const [favoriteOrders, setFavoriteOrders] = useState<FavoriteOrder[]>(MOCK_FAVORITE_ORDERS);

  const [userRole, setUserRole] = useState<string | null>(null);
  const [isMasterProfile, setIsMasterProfile] = useState(false);
  const [ratedMasters, setRatedMasters] = useState<RatedMasterItem[]>([]);

  const rateInitialStars =
    slug && slug !== "me"
      ? (ratedMasters.find(
          (r) => r.master.slug === slug || r.master._id === slug,
        )?.stars ?? null)
      : null;
  const canVoteRole = userRole === "user" || userRole === "master";

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    if (slug === "me") {
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
          setIsMasterProfile(data.role === "master");
          setRatedMasters(data.ratedMasters ?? []);
        })
        .catch(() => router.replace("/join"))
        .finally(() => setLoading(false));
      return;
    }

    getMe()
      .then(({ data }) => {
        setUserRole(data.role);
        if (data.slug === slug) {
          setProfile(mapMeToProfile(data, data.role));
          setIsOwnProfile(true);
          setIsMasterProfile(data.role === "master");
          setRatedMasters(data.ratedMasters ?? []);
          if (data.role === "master") {
            fetchMyPortfolio()
              .then((list) => setProfile((p) => ({ ...p, portfolioImages: list })))
              .catch(() => {});
          }
          setLoading(false);
          return;
        }
        return getProfileBySlug(slug).then((p) => {
          setProfile({ ...p, portfolioImages: p.portfolioImages ?? [] });
          setIsOwnProfile(false);
          setIsMasterProfile(true);
          setRatedMasters(data.ratedMasters ?? []);
        });
      })
      .catch(() =>
        getProfileBySlug(slug)
          .then((p) => {
            setProfile({ ...p, portfolioImages: p.portfolioImages ?? [] });
            setIsOwnProfile(false);
            setIsMasterProfile(true);
          })
          .catch(() => {})
      )
      .finally(() => setLoading(false));
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

  const submitRating = async (stars: number) => {
    if (!slug || slug === "me" || stars < 1) return;
    const res = await rateMaster(slug, stars);
    if (res.data?.rating != null || res.data?.reviewCount != null) {
      setProfile((prev) => ({
        ...prev,
        rating: res.data?.rating ?? prev.rating,
        reviewCount: res.data?.reviewCount ?? prev.reviewCount,
      }));
    }
    if (res.data?.ratedMasters?.length) {
      setRatedMasters(res.data.ratedMasters);
    }
    try {
      const { data } = await getMe();
      setRatedMasters(data.ratedMasters ?? res.data?.ratedMasters ?? []);
    } catch(e) {
      console.error("Failed to get me", e);
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
    <div className={styles.page}>
      <div>
        <div className={styles.container}>
          <div className={styles.grid}>
            <div className={styles.sidebar}>
              <ProfileSidebar
                {...profile}
                rating={profile.rating}
                reviewCount={profile.reviewCount}
                credits={125}
                isOwnProfile={isOwnProfile}
                onEdit={() => {
                  setEditModalKey((k) => k + 1);
                  setShowEditModal(true);
                }}
                onLogout={handleLogout}
                onChangePhoto={handleChangePhoto}
                isUploadingPhoto={photoUploading}
              />
              {photoError && <p className={styles.emptyRated}>{photoError}</p>}
            </div>

            <div className={styles.main}>
              {userRole === "user" && isOwnProfile ? (
                <RatedMastersList ratedMasters={ratedMasters} />
              ) : (
                <>
                  <div className={styles.tabBar}>
                    <button
                      type="button"
                      className={`${styles.tabBtn} ${activeTab === "work" ? styles.tabBtnActive : ""}`}
                      onClick={() => setActiveTab("work")}
                    >
                      My Work
                    </button>
                    <button
                      type="button"
                      className={`${styles.tabBtn} ${activeTab === "favorites" ? styles.tabBtnActive : ""}`}
                      onClick={() => setActiveTab("favorites")}
                    >
                      Favorite Orders
                    </button>
                  </div>

                  {activeTab === "work" ? (
                    <>
                      <MasterRatingSection
                        isMasterProfile={isMasterProfile}
                        rating={profile.rating}
                        reviewCount={profile.reviewCount}
                        isOwnProfile={isOwnProfile}
                        slug={slug}
                        canVoteRole={canVoteRole}
                        userRole={userRole}
                        rateInitialStars={rateInitialStars}
                        onRateSubmit={submitRating}
                      />
                      <PortfolioSection
                        portfolioImages={profile.portfolioImages}
                        onPortfolioImagesChange={(list) =>
                          setProfile((p) => ({ ...p, portfolioImages: list }))
                        }
                        userRole={userRole}
                        isOwnProfile={isOwnProfile}
                        onOpenPortfolio={setSelectedPortfolioIndex}
                      />
                    </>
                  ) : (
                    <section className={styles.favoritesSection} aria-label="Favorite orders">
                      {favoriteOrders.length === 0 ? (
                        <div className={styles.favoritesEmpty}>
                          <p>No saved orders yet.</p>
                        </div>
                      ) : (
                        <div className={styles.favoritesList}>
                          {favoriteOrders.map((order) => (
                            <article key={order.id} className={styles.favoriteOrderCard}>
                              <div className={styles.favoriteTop}>
                                <Image
                                  src={order.imageSrc}
                                  alt={order.imageAlt}
                                  width={90}
                                  height={90}
                                  className={styles.favoriteThumb}
                                />
                                <div className={styles.favoriteMain}>
                                  <div className={styles.favoriteHeadRow}>
                                    <div>
                                      <p className={styles.favoriteClient}>{order.clientName}</p>
                                      <p className={styles.favoriteSavedAt}>{order.savedAt}</p>
                                    </div>
                                    <button
                                      type="button"
                                      className={styles.favoriteHeartBtn}
                                      onClick={() =>
                                        setFavoriteOrders((prev) =>
                                          prev.filter((item) => item.id !== order.id),
                                        )
                                      }
                                      aria-label="Remove from favorites"
                                    >
                                      <Heart size={18} />
                                    </button>
                                  </div>
                                  <h3 className={styles.favoriteTitle}>{order.title}</h3>
                                  <p className={styles.favoriteDesc}>{order.description}</p>
                                  <div className={styles.favoriteMeta}>
                                    <span className={styles.favoriteMetaItem}>
                                      <MapPin size={16} /> {order.location}
                                    </span>
                                    <span className={styles.favoriteMetaItem}>
                                      <Banknote size={16} /> {order.budgetRange}
                                    </span>
                                    <span className={styles.favoriteMetaItem}>
                                      <CalendarClock size={16} /> {order.deadline}
                                    </span>
                                  </div>
                                  <div className={styles.favoriteActions}>
                                    <button type="button" className={styles.favoritePrimaryBtn}>
                                      Submit Proposal
                                    </button>
                                    <button type="button" className={styles.favoriteGhostBtn}>
                                      View Details
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </article>
                          ))}
                        </div>
                      )}
                    </section>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal
        key={editModalKey}
        open={showEditModal}
        values={{
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          specialty: profile.specialty,
          location: profile.location,
          bio: profile.bio,
          instagram: profile.instagram,
          website: profile.website,
        }}
        editError={editError}
        editLoading={editLoading}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditSubmit}
      />

      {selectedWork && (
        <LightboxModal
          image={selectedWork.image}
          title={selectedWork.title}
          description={selectedWork.description}
          onClose={() => setSelectedWork(null)}
        />
      )}

      <PortfolioLightbox
        images={profile.portfolioImages}
        index={selectedPortfolioIndex}
        onIndexChange={setSelectedPortfolioIndex}
        title="Portfolio"
        onClose={() => setSelectedPortfolioIndex(null)}
      />
    </div>
  );
}

  "use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import ProfileSidebar from "@/components/ProfileSidebar/ProfileSidebar";
import EditProfileModal from "@/components/EditProfileModal/EditProfileModal";
import LightboxModal from "@/components/LightboxModal/LightboxModal";
import PortfolioLightbox from "@/components/PortfolioLightbox/PortfolioLightbox";
import MasterRatingSection from "@/components/MasterRatingSection/MasterRatingSection";
import PortfolioSection from "@/components/PortfolioSection/PortfolioSection";
import RatedMastersList from "@/components/RatedMastersList/RatedMastersList";
import {
  getMe,
  getProfileBySlug,
  updateProfile,
  logout,
  getImageUrl,
  uploadProfileImage,
  fetchMyPortfolio,
  uploadPortfolioImages,
  rateMaster,
} from "@/lib/api";
import type { RatedMasterItem } from "@/lib/types";
import styles from "../profilePage.module.css";

type ProfileData = {
  name: string;
  specialty: string;
  location: string;
  bio: string;
  rating?: number;
  reviewCount?: number;
  phone: string;
  email: string;
  instagram?: string;
  website?: string;
  image: string;
  portfolioImages: string[];
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

type Work = ProfileData["works"][0];

function mapMeToProfile(
  data: {
    name: string;
    email: string;
    phone?: string;
    specialty?: string;
    location?: string;
    bio?: string;
    rating?: number;
    reviewCount?: number;
    image?: string;
    instagram?: string;
    website?: string;
    works?: Array<{
      id: string;
      title: string;
      description?: string;
      image: string;
    }>;
    portfolioImages?: string[];
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
  const tProfile = useTranslations("profile");
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
  const [selectedPortfolioIndex, setSelectedPortfolioIndex] = useState<number | null>(null);
  const [selectedPortfolioFiles, setSelectedPortfolioFiles] = useState<File[]>([]);
  const [selectedPortfolioPreviews, setSelectedPortfolioPreviews] = useState<string[]>([]);
  const [portfolioUploading, setPortfolioUploading] = useState(false);
  const [portfolioError, setPortfolioError] = useState("");
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
  const [isMasterProfile, setIsMasterProfile] = useState(false);
  const [ratedMasters, setRatedMasters] = useState<RatedMasterItem[]>([]);
  const [rateHover, setRateHover] = useState(0);
  const [rateSelected, setRateSelected] = useState(0);
  const [rateSubmitting, setRateSubmitting] = useState(false);
  const [rateSuccess, setRateSuccess] = useState(false);
  const [rateError, setRateError] = useState("");

  const rateInitialStars =
    slug && slug !== "me"
      ? (ratedMasters.find(
          (r) => r.master.slug === slug || r.master._id === slug,
        )?.stars ?? null)
      : null;
  const canVoteRole = userRole === "user" || userRole === "master";

  useEffect(() => {
    setRateSuccess(false);
  }, [slug]);

  useEffect(() => {
    setRateSelected(rateInitialStars ?? 0);
    setRateError("");
  }, [rateInitialStars, slug]);

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

  const handleSelectPortfolioFiles = (files: FileList | null) => {
    setPortfolioError("");
    if (!files || files.length === 0) return;

    const currentCount = profile.portfolioImages?.length ?? 0;
    const nextCount = currentCount + files.length;
    if (nextCount > 30) {
      setPortfolioError(`You can have up to 30 portfolio images (currently ${currentCount}).`);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const arr = Array.from(files);
    for (const f of arr) {
      if (!allowedTypes.includes(f.type)) {
        setPortfolioError("Only JPG, PNG, or WebP images are allowed.");
        return;
      }
      if (f.size > 4 * 1024 * 1024) {
        setPortfolioError("Each image must be 4MB or smaller.");
        return;
      }
    }

    const previews = arr.map((f) => URL.createObjectURL(f));
    setSelectedPortfolioFiles(arr);
    setSelectedPortfolioPreviews(previews);
  };

  const clearSelectedPortfolio = () => {
    for (const url of selectedPortfolioPreviews) URL.revokeObjectURL(url);
    setSelectedPortfolioFiles([]);
    setSelectedPortfolioPreviews([]);
  };

  const handleRateSubmit = async () => {
    if (!slug || slug === "me" || rateSelected < 1 || rateSubmitting) return;
    setRateError("");
    setRateSuccess(false);
    setRateSubmitting(true);
    try {
      const res = await rateMaster(slug, rateSelected);
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
      } catch {
        /* keep ratedMasters from rate response or prior state */
      }
      setRateSuccess(true);
    } catch (e) {
      setRateError(e instanceof Error ? e.message : tProfile("ratingError"));
    } finally {
      setRateSubmitting(false);
    }
  };

  const handleUploadPortfolio = async () => {
    setPortfolioError("");
    if (selectedPortfolioFiles.length === 0) return;

    setPortfolioUploading(true);
    try {
      const list = await uploadPortfolioImages(selectedPortfolioFiles);
      setProfile((p) => ({ ...p, portfolioImages: list }));
      clearSelectedPortfolio();
    } catch (err) {
      setPortfolioError(err instanceof Error ? err.message : "Upload failed");
      if (userRole === "master" && isOwnProfile) {
        try {
          const list = await fetchMyPortfolio();
          setProfile((p) => ({ ...p, portfolioImages: list }));
        } catch {}
      }
    } finally {
      setPortfolioUploading(false);
    }
  };

  const handleRateSelect = (stars: number) => {
    setRateSelected(stars);
    setRateSuccess(false);
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
      <div>
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
              {userRole === "user" && isOwnProfile ? (
                <RatedMastersList ratedMasters={ratedMasters} />
              ) : (
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
                    rateHover={rateHover}
                    rateSelected={rateSelected}
                    rateSubmitting={rateSubmitting}
                    rateSuccess={rateSuccess}
                    rateError={rateError}
                    onRateHover={setRateHover}
                    onRateSelect={handleRateSelect}
                    onRateSubmit={() => void handleRateSubmit()}
                  />
                  <PortfolioSection
                    portfolioImages={profile.portfolioImages}
                    selectedPortfolioPreviews={selectedPortfolioPreviews}
                    portfolioUploading={portfolioUploading}
                    portfolioError={portfolioError}
                    userRole={userRole}
                    isOwnProfile={isOwnProfile}
                    isVisible={isVisible}
                    onSelectPortfolioFiles={handleSelectPortfolioFiles}
                    onClearSelectedPortfolio={clearSelectedPortfolio}
                    onUploadPortfolio={() => void handleUploadPortfolio()}
                    onOpenPortfolio={setSelectedPortfolioIndex}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal
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

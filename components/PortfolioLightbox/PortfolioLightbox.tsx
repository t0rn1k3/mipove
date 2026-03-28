"use client";

import LightboxModal from "@/components/LightboxModal/LightboxModal";

type PortfolioLightboxProps = {
  images: string[];
  index: number | null;
  onIndexChange: (index: number | null) => void;
  onClose: () => void;
  title?: string;
};

export default function PortfolioLightbox({
  images,
  index,
  onIndexChange,
  onClose,
  title = "Portfolio",
}: PortfolioLightboxProps) {
  if (index === null || images.length === 0) return null;

  return (
    <LightboxModal
      images={images}
      index={index}
      onIndexChange={onIndexChange}
      title={title}
      onClose={onClose}
    />
  );
}

"use client";

import LightboxModal from "@/components/LightboxModal/LightboxModal";
import type { PortfolioLightboxProps } from "@/lib/types";

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

"use client";

import { usePathname } from "@/i18n/navigation";
import Navbar from "@/components/navbar/Navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) return null;
  return <Navbar />;
}

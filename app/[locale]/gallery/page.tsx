import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";

/**
 * Gallery is off until launch — bookmarks to /gallery go home.
 * To ship: import GalleryPageContent from "./GalleryPageContent"; export default GalleryPageContent;
 */
export default async function GalleryPage() {
  const locale = await getLocale();
  redirect({ href: "/", locale });
}

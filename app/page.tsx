import Navbar from "@/components/navbar/Navbar";
import Hero from "@/components/hero/Hero";
import Categories from "@/components/categories/Categories";
import CTA from "@/components/cta/CTA";

export default function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <CTA />
    </>
  );
}

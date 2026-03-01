import Hero from "@/components/hero/Hero";
import Categories from "@/components/categories/Categories";
import HowItWorks from "@/components/how-it-works/HowItWorks";
import CTA from "@/components/cta/CTA";

export default function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <HowItWorks />
      <CTA />
    </>
  );
}

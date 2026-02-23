import Link from "next/link";

export default function CTA() {
  return (
    <section className="">
      <div className="">
        <h2 className="">Ready to Find Your Artisan?</h2>

        <p className="">Browse our curated directory of master craftspeople</p>

        <Link href="/gallery" className="">
          Explore Gallery
        </Link>
      </div>
    </section>
  );
}

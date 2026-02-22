import Link from "next/link";

export default function CTA() {
  return (
    <section className="bg-gray-900 text-white py-28 text-center">
      <div className="max-w-3xl mx-auto px-6 space-y-8">
        <h2 className="text-4xl lg:text-5xl font-serif font-semibold leading-tight">
          Ready to Find Your Artisan?
        </h2>

        <p className="text-gray-300">
          Browse our curated directory of master craftspeople
        </p>

        <Link
          href="/gallery"
          className="inline-block bg-teal-600 hover:bg-teal-700 text-white px-10 py-4 rounded-full transition"
        >
          Explore Gallery
        </Link>
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative w-full min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10 w-full h-full">
        <Image
          src="/images/hero-bg.png"
          alt="Workshop background"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 -z-100 bg-black/70 backdrop-blur-sm w-full h-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
        {/* LEFT SIDE */}
        <div className="space-y-8">
          <h1 className="text-5xl lg:text-6xl font-serif font-semibold leading-tight text-gray-900">
            Find the Master <br /> Behind the Craft
          </h1>

          <p className="text-lg text-gray-600 max-w-xl">
            Connect with exceptional artisans, sculptors, painters, and
            craftspeople who bring vision to life.
          </p>

          {/* Search Bar */}
          <div className="bg-white rounded-full shadow-lg p-2 flex flex-col sm:flex-row gap-3 sm:gap-0 sm:items-center">
            <input
              type="text"
              placeholder="Search by skill..."
              className="flex-1 px-4 py-3 outline-none text-gray-700"
            />

            <div className="hidden sm:block w-px h-8 bg-gray-200" />

            <input
              type="text"
              placeholder="Location..."
              className="flex-1 px-4 py-3 outline-none text-gray-700"
            />

            <button className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-full transition">
              Search
            </button>
          </div>

          {/* Popular Tags */}
          <div className="flex flex-wrap gap-3 items-center text-sm text-gray-600">
            <span className="text-gray-500">Popular:</span>

            {["Painting", "Sculpture", "Pottery", "Woodwork"].map((item) => (
              <button
                key={item}
                className="bg-white/80 hover:bg-white px-4 py-1 rounded-full shadow-sm transition"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE IMAGES */}
        <div className="relative hidden lg:flex justify-center">
          {/* Main Image */}
          <div className="relative w-[380px] h-[480px] rounded-3xl overflow-hidden shadow-xl">
            <Image
              src="/images/artisan2.jpg"
              alt="Artisan working"
              fill
              className="object-cover"
            />
          </div>

          {/* Secondary Image */}
          <div className="absolute -right-16 bottom-10 w-[320px] h-[420px] rounded-3xl overflow-hidden shadow-xl">
            <Image
              src="/images/artisan2.jpg"
              alt="Sculpture workshop"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="absolute top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-serif font-semibold">
          Artisan<span className="text-teal-600">Hub</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-10 text-gray-700">
          <Link href="/" className="hover:text-gray-900 transition">
            Home
          </Link>
          <Link href="/gallery" className="hover:text-gray-900 transition">
            Gallery
          </Link>
        </nav>

        {/* CTA Button */}
        <Link
          href="/join"
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-full transition"
        >
          Join Us
        </Link>
      </div>
    </header>
  );
}

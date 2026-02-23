"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="">
      <div className="">
        {/* Logo */}
        <Link href="/" className="">
          Artisan<span className="">Hub</span>
        </Link>

        {/* Navigation */}
        <nav className="">
          <Link href="/" className="">
            Home
          </Link>
          <Link href="/gallery" className="">
            Gallery
          </Link>
        </nav>

        {/* CTA Button */}
        <Link href="/join" className="">
          Join Us
        </Link>
      </div>
    </header>
  );
}

"use client";

import Image from "next/image";

export default function Hero() {
  return (
    <section className="">
      {/* Background Image */}
      <div className="">
        <Image
          src="/images/hero-bg.png"
          alt="Workshop background"
          fill
          priority
          className=""
        />
        <div className="" />
      </div>

      <div className="r">
        {/* LEFT SIDE */}
        <div className="">
          <h1 className="">
            Find the Master <br /> Behind the Craft
          </h1>

          <p className="">
            Connect with exceptional artisans, sculptors, painters, and
            craftspeople who bring vision to life.
          </p>

          {/* Search Bar */}
          <div className="">
            <input type="text" placeholder="Search by skill..." className="" />

            <div className="" />

            <input type="text" placeholder="Location..." className="" />

            <button className="">Search</button>
          </div>

          {/* Popular Tags */}
          <div className="">
            <span className="">Popular:</span>

            {["Painting", "Sculpture", "Pottery", "Woodwork"].map((item) => (
              <button key={item} className="">
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE IMAGES */}
        <div className="">
          {/* Main Image */}
          <div className="">
            <Image
              src="/images/artisan2.jpg"
              alt="Artisan working"
              fill
              className=""
            />
          </div>

          {/* Secondary Image */}
          <div className="">
            <Image
              src="/images/artisan2.jpg"
              alt="Sculpture workshop"
              fill
              className=""
            />
          </div>
        </div>
      </div>
    </section>
  );
}

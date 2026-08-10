"use client";

import Image from "next/image";
import { useState } from "react";
import { cldUrl } from "@/lib/cloudinary";

export default function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");

  return (
    <div>
      <div
        className="relative aspect-square cursor-zoom-in overflow-hidden rounded-2xl bg-surface"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          setOrigin(`${x}% ${y}%`);
        }}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
      >
        <Image
          src={cldUrl(images[active])}
          alt={alt}
          fill
          priority
          sizes="(min-width: 768px) 45vw, 100vw"
          style={{ transformOrigin: origin }}
          className={`object-cover transition-transform duration-300 ${
            zoomed ? "scale-150" : "scale-100"
          }`}
        />
      </div>

      {images.length > 1 && (
        <div className="mt-4 flex gap-3">
          {images.map((img, i) => (
            <button
              key={img}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className={`relative h-20 w-20 overflow-hidden rounded-xl border-2 transition-colors ${
                active === i ? "border-accent" : "border-transparent"
              }`}
            >
              <Image src={cldUrl(img)} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

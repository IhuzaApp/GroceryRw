"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const illustrations = [
  {
    id: "burger",
    name: "Burger",
    image: "/images/mainPageIcons/burger.png",
  },
  {
    id: "tomato",
    name: "Tomato",
    image: "/images/mainPageIcons/tomato.png",
  },
  {
    id: "delivery-man",
    name: "Delivery Man",
    image: "/images/mainPageIcons/delivery-man.png",
  },
  {
    id: "brand",
    name: "Brand",
    image: "/images/mainPageIcons/brand.png",
  },
  {
    id: "first-aid-kit",
    name: "First Aid Kit",
    image: "/images/mainPageIcons/first-aid-kit.png",
  },
  {
    id: "payment-terminal",
    name: "Payment Terminal",
    image: "/images/mainPageIcons/payment-terminal.png",
  },
  {
    id: "pet-shop",
    name: "Pet Shop",
    image: "/images/mainPageIcons/pet-shop.png",
  },
];

export default function AnimatedIllustrations() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (illustrations.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % illustrations.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, []);

  if (illustrations.length === 0) {
    return null;
  }

  const currentIllustration = illustrations[currentIndex];

  if (!currentIllustration) {
    return null;
  }

  return (
    <div className="relative h-48 w-full md:h-64 lg:h-72">
      <div
        key={currentIndex}
        className="h-full w-full"
        style={{
          animation: "fadeInZoom 1s ease-out",
        }}
      >
        <div className="relative flex h-full w-full items-center justify-center">
          <div className="relative">
            {/* Outer glow ring */}
            <div
              className="absolute inset-0 opacity-25 blur-xl"
              style={{
                background:
                  "radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.3) 30%, rgba(255, 255, 255, 0.15) 60%, transparent 100%)",
                animation: "glow 3s ease-in-out infinite",
                transform: "scale(1.1)",
                zIndex: 0,
              }}
            />
            {/* Inner rim light */}
            <div
              className="absolute inset-0 opacity-30 blur-md"
              style={{
                background:
                  "radial-gradient(ellipse, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.4) 40%, transparent 80%)",
                animation: "glow 3s ease-in-out infinite 0.2s",
                transform: "scale(1.05)",
                zIndex: 1,
              }}
            />
            <Image
              src={currentIllustration.image}
              alt={currentIllustration.name}
              width={250}
              height={250}
              className="relative z-10 h-full w-auto max-w-[280px] object-contain"
              style={{
                animation:
                  "float 3s ease-in-out infinite 0.5s, glow 3s ease-in-out infinite",
                filter:
                  "drop-shadow(0 0 4px rgba(255, 255, 255, 0.3)) drop-shadow(0 0 8px rgba(255, 255, 255, 0.2))",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

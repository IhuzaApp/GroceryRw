"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const illustrations = [
  {
    id: "burger",
    name: "Burger",
    image: "/images/mainPageIcons/burger_3d.png",
  },
  {
    id: "tomato",
    name: "Tomato",
    image: "/images/mainPageIcons/tomato_3d.png",
  },
  {
    id: "delivery-man",
    name: "Delivery Man",
    image: "/images/mainPageIcons/scooter_3d.png",
  },
  {
    id: "brand",
    name: "Brand",
    image: "/images/mainPageIcons/brand_3d.png",
  },
  {
    id: "first-aid-kit",
    name: "First Aid Kit",
    image: "/images/mainPageIcons/pharmacy_3d.png",
  },
  {
    id: "payment-terminal",
    name: "Payment",
    image: "/images/mainPageIcons/payment-terminal.png",
  },
  {
    id: "pet-shop",
    name: "Pet Area",
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
    <div className="relative mx-auto h-64 w-64 md:h-80 md:w-80 lg:h-96 lg:w-96">
      {illustrations.map((illustration, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={illustration.id}
            className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ease-in-out ${
              isActive
                ? "z-10 opacity-100"
                : "pointer-events-none z-0 opacity-0"
            }`}
          >
            <div className="relative flex h-full w-full items-center justify-center">
              <div className="relative flex h-64 w-64 items-center justify-center md:h-80 md:w-80 lg:h-96 lg:w-96">
                <Image
                  src={illustration.image}
                  alt={illustration.name}
                  width={400}
                  height={400}
                  className={`relative z-10 object-contain ${
                    illustration.id === "payment-terminal" ||
                    illustration.id === "pet-shop"
                      ? "max-h-[60%] max-w-[60%]"
                      : "max-h-full max-w-full"
                  }`}
                  style={{
                    animation: isActive
                      ? "float 3s ease-in-out infinite 0.5s"
                      : "none",
                    filter:
                      "drop-shadow(0 20px 25px rgba(0, 0, 0, 0.4)) drop-shadow(0 10px 10px rgba(0, 0, 0, 0.2))",
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

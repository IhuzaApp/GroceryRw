import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { Search } from "lucide-react";

interface AboutHeaderProps {
  activePage?: "about" | "life-at-plas" | "diversity" | "teams" | "careers" | "stories" | "locations" | "contact";
}

export default function AboutHeader({ activePage = "about" }: AboutHeaderProps) {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-lg" : "bg-[#2D5016]"
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Image
              src="/assets/logos/PlasIcon.png"
              alt="Plas Logo"
              width={40}
              height={40}
              className="h-10 w-10"
            />
            <span
              className={`text-2xl font-bold transition-colors ${
                isScrolled ? "text-[#00D9A5]" : "text-white"
              }`}
            >
              Plas
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/about"
              className={`${activePage === "about" ? "border-b-2 pb-1" : ""} font-medium transition-colors ${
                activePage === "about"
                  ? isScrolled
                    ? "border-[#00D9A5] text-[#00D9A5]"
                    : "border-[#00D9A5] text-white"
                  : isScrolled
                    ? "text-gray-700 hover:text-[#00D9A5]"
                    : "text-white/90 hover:text-white"
              }`}
            >
              About us
            </Link>
            <Link
              href="/life-at-plas"
              className={`${activePage === "life-at-plas" ? "border-b-2 pb-1" : ""} font-medium transition-colors ${
                activePage === "life-at-plas"
                  ? isScrolled
                    ? "border-[#00D9A5] text-[#00D9A5]"
                    : "border-[#00D9A5] text-white"
                  : isScrolled
                    ? "text-gray-700 hover:text-[#00D9A5]"
                    : "text-white/90 hover:text-white"
              }`}
            >
              Life at Plas
            </Link>
            <a
              href="#"
              className={`font-medium transition-colors ${
                isScrolled ? "text-gray-700 hover:text-[#00D9A5]" : "text-white/90 hover:text-white"
              }`}
            >
              Diversity & Inclusion
            </a>
            <a
              href="#"
              className={`font-medium transition-colors ${
                isScrolled ? "text-gray-700 hover:text-[#00D9A5]" : "text-white/90 hover:text-white"
              }`}
            >
              Our teams
            </a>
            <Link
              href="/careers"
              className={`font-medium transition-colors ${
                isScrolled ? "text-gray-700 hover:text-[#00D9A5]" : "text-white/90 hover:text-white"
              }`}
            >
              Careers at Plas
            </Link>
            <a
              href="#"
              className={`font-medium transition-colors ${
                isScrolled ? "text-gray-700 hover:text-[#00D9A5]" : "text-white/90 hover:text-white"
              }`}
            >
              Stories
            </a>
            <a
              href="#"
              className={`font-medium transition-colors ${
                isScrolled ? "text-gray-700 hover:text-[#00D9A5]" : "text-white/90 hover:text-white"
              }`}
            >
              Our locations
            </a>
            <a
              href="#"
              className={`font-medium transition-colors ${
                isScrolled ? "text-gray-700 hover:text-[#00D9A5]" : "text-white/90 hover:text-white"
              }`}
            >
              Contact us
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              className={`hidden items-center gap-2 rounded-lg border-2 px-4 py-2 font-medium transition-colors md:flex ${
                isScrolled
                  ? "border-gray-300 bg-white text-gray-900 hover:border-[#00D9A5]"
                  : "border-white bg-transparent text-white hover:bg-white/10"
              }`}
              onClick={() => router.push("/Auth/Login")}
            >
              Sign in
            </button>
            <button
              className={`rounded-lg p-2 transition-colors ${
                isScrolled
                  ? "text-gray-700 hover:bg-gray-100"
                  : "text-white hover:bg-white/10"
              }`}
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}


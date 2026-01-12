import Image from "next/image";
import Link from "next/link";
import { Instagram, Linkedin, Youtube, Facebook } from "lucide-react";

export default function AboutFooter() {
  return (
    <footer className="relative bg-[#282828] text-white">
      {/* Curved white transition at top */}
      <div className="absolute left-0 right-0 top-0 -translate-y-px">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 0L60 10C120 20 240 40 360 50C480 60 600 60 720 55C840 50 960 40 1080 35C1200 30 1320 30 1380 30L1440 30V0H1380C1320 0 1200 0 1080 0C960 0 840 0 720 0C600 0 480 0 360 0C240 0 120 0 60 0H0Z"
            fill="white"
          />
        </svg>
      </div>

      <div className="container mx-auto px-4 pb-8 pt-20">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Plas Logo */}
          <div className="lg:col-span-1">
            <div className="mb-6 flex items-center gap-2">
              <Image
                src="/assets/logos/PlasIcon.png"
                alt="Plas Logo"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="text-2xl font-bold text-white">Plas</span>
            </div>
          </div>

          {/* About us Column */}
          <div className="space-y-3">
            <h3 className="font-bold text-white">About us</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/life-at-plas"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Life at Plas
                </Link>
              </li>
              <li className="ml-4">
                <a
                  href="#"
                  className="text-sm text-gray-300 transition-colors hover:text-white"
                >
                  Plas Cares
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Diversity & Inclusion
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Our teams
                </a>
              </li>
            </ul>
          </div>

          {/* Careers at Plas Column */}
          <div className="space-y-3">
            <h3 className="font-bold text-white">Careers at Plas</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Find your ride
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Students
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Woman in tech
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Business Process
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Tech Process
                </a>
              </li>
            </ul>
          </div>

          {/* Our Stories & Locations Column */}
          <div className="space-y-3">
            <h3 className="font-bold text-white">Our Stories</h3>
            <h3 className="mt-6 font-bold text-white">Our Locations</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Kigali
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Gasabo
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Nyarugenge
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Kampala
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Nairobi
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Social Media Column */}
          <div className="space-y-3">
            <h3 className="font-bold text-white">Contact us</h3>
            <h3 className="mt-6 font-bold text-white">Sign In</h3>
            <div className="mt-2 flex gap-3">
              <a
                href="#"
                className="text-gray-300 transition-colors hover:text-white"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-300 transition-colors hover:text-white"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-300 transition-colors hover:text-white"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-300 transition-colors hover:text-white"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

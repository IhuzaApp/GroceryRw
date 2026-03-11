import Image from "next/image";
import Link from "next/link";

export default function AboutFooter() {
  return (
    <footer className="relative bg-[#1A1A1A] text-white">
      {/* Curved white line at top */}
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

      <div className="container mx-auto px-4 py-20 pt-32">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
          {/* Left Section - Plas Branding and Partner Links */}
          <div className="space-y-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Image
                src="/assets/logos/PlasIcon.png"
                alt="Plas Logo"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="text-2xl font-bold text-[#00D9A5]">Plas</span>
            </div>
            {/* Slogan */}
            <p className="font-bold text-white">Let&apos;s do it together</p>
            {/* Links */}
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Careers
                </a>
              </li>
              <li>
                <Link
                  href="/plasBusiness"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Plas for Partners
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Couriers
                </a>
              </li>
              <li>
                <Link
                  href="/plasBusiness"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Plas Business
                </Link>
              </li>
            </ul>
          </div>

          {/* Middle Section - Links of Interest */}
          <div className="space-y-4">
            <h3 className="font-bold text-white">Links of interest</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  About us
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Contact us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Security
                </a>
              </li>
              <li>
                <Link
                  href="/Auth/Login"
                  className="text-gray-300 transition-colors hover:text-white"
                >
                  Log in
                </Link>
              </li>
            </ul>
          </div>

          {/* Right Section - App Downloads and Legal Links */}
          <div className="space-y-4 md:col-span-2 lg:col-span-1">
            {/* App Download Buttons */}
            <div className="space-y-3">
              <button className="flex w-full items-center gap-2 rounded-lg bg-[#282828] px-4 py-3 text-white transition-opacity hover:opacity-90 md:w-auto">
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[10px] text-gray-300">
                    Download on the
                  </span>
                  <span className="text-sm font-medium">App Store</span>
                </div>
              </button>
              <button className="flex w-full items-center gap-2 rounded-lg bg-[#282828] px-4 py-3 text-white transition-opacity hover:opacity-90 md:w-auto">
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L6.05,21.34L14.54,12.85L20.16,10.81M6.05,2.66L14.54,11.15L16.81,8.88L6.05,2.66Z" />
                </svg>
                <div className="flex flex-col items-start leading-none">
                  <span className="text-[10px] text-gray-300">GET IT ON</span>
                  <span className="text-sm font-medium">Google Play</span>
                </div>
              </button>
            </div>

            {/* Legal and Policy Links */}
            <ul className="mt-6 space-y-2">
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-300 transition-colors hover:text-white"
                >
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-300 transition-colors hover:text-white"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-300 transition-colors hover:text-white"
                >
                  Cookies Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-300 transition-colors hover:text-white"
                >
                  Compliance
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-300 transition-colors hover:text-white"
                >
                  Configure the cookies
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-300 transition-colors hover:text-white"
                >
                  Digital Services Act
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-gray-300 transition-colors hover:text-white"
                >
                  European Accessibility Act
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section - Language Selector & Socials */}
        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-gray-800 pt-8 md:flex-row">
          <div className="relative order-2 md:order-1">
            <select className="cursor-pointer appearance-none rounded-lg bg-[#282828] px-4 py-2.5 pr-10 text-sm font-medium text-white outline-none transition-colors hover:bg-gray-700 focus:ring-2 focus:ring-[#00D9A5]">
              <option value="en">English</option>
              <option value="rw">Kinyarwanda</option>
              <option value="fr">Français</option>
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          <div className="order-1 flex items-center space-x-6 md:order-2">
            <a
              href="#"
              className="text-gray-400 transition-colors hover:text-white"
            >
              <span className="sr-only">Facebook</span>
              <svg
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <a
              href="#"
              className="text-gray-400 transition-colors hover:text-white"
            >
              <span className="sr-only">Twitter</span>
              <svg
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a
              href="#"
              className="text-gray-400 transition-colors hover:text-white"
            >
              <span className="sr-only">Instagram</span>
              <svg
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>

          <div className="order-3 text-sm text-gray-500 md:order-3">
            <p>
              &copy; {new Date().getFullYear()} Plas Technologies Ltd. All
              rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

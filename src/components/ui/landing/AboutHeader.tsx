import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { Search, ChevronDown, User, LogOut, LayoutDashboard } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Avatar, Dropdown } from "rsuite";

interface AboutHeaderProps {
  activePage?:
    | "about"
    | "life-at-plas"
    | "teams"
    | "careers"
    | "locations"
    | "locations"
    | "contact"
    | "pos"
    | "plasBusiness";
}

export default function AboutHeader({
  activePage = "about",
}: AboutHeaderProps) {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session, status } = useSession();
  const user = session?.user;

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
          <Link href="/" className="flex cursor-pointer items-center gap-2">
            <Image
              src="/assets/logos/PlasLogoPNG.png"
              alt="Plas Logo"
              width={120}
              height={40}
              className={`h-5 w-auto object-contain transition-all sm:h-6 ${
                !isScrolled ? "brightness-0 invert" : ""
              }`}
            />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/about"
              className={`${
                activePage === "about" ? "border-b-2 pb-1" : ""
              } font-medium transition-colors ${
                activePage === "about"
                  ? isScrolled
                    ? "border-[#022C22] text-[#022C22]"
                    : "border-[#022C22] text-white"
                  : isScrolled
                  ? "text-gray-700 hover:text-[#022C22]"
                  : "text-white/90 hover:text-white"
              }`}
            >
              About us
            </Link>
            <Link
              href="/life-at-plas"
              className={`${
                activePage === "life-at-plas" ? "border-b-2 pb-1" : ""
              } font-medium transition-colors ${
                activePage === "life-at-plas"
                  ? isScrolled
                    ? "border-[#022C22] text-[#022C22]"
                    : "border-[#022C22] text-white"
                  : isScrolled
                  ? "text-gray-700 hover:text-[#022C22]"
                  : "text-white/90 hover:text-white"
              }`}
            >
              Life at Plas
            </Link>
            <Link
              href="/ourTeams"
              className={`${
                activePage === "teams" ? "border-b-2 pb-1" : ""
              } font-medium transition-colors ${
                activePage === "teams"
                  ? isScrolled
                    ? "border-[#022C22] text-[#022C22]"
                    : "border-[#022C22] text-white"
                  : isScrolled
                  ? "text-gray-700 hover:text-[#022C22]"
                  : "text-white/90 hover:text-white"
              }`}
            >
              Our teams
            </Link>
            <Link
              href="/careers"
              className={`${
                activePage === "careers" ? "border-b-2 pb-1" : ""
              } font-medium transition-colors ${
                activePage === "careers"
                  ? isScrolled
                    ? "border-[#022C22] text-[#022C22]"
                    : "border-[#022C22] text-white"
                  : isScrolled
                  ? "text-gray-700 hover:text-[#022C22]"
                  : "text-white/90 hover:text-white"
              }`}
            >
              Careers at Plas
            </Link>
            <Link
              href="/locations"
              className={`${
                activePage === "locations" ? "border-b-2 pb-1" : ""
              } font-medium transition-colors ${
                activePage === "locations"
                  ? isScrolled
                    ? "border-[#022C22] text-[#022C22]"
                    : "border-[#022C22] text-white"
                  : isScrolled
                  ? "text-gray-700 hover:text-[#022C22]"
                  : "text-white/90 hover:text-white"
              }`}
            >
              Our locations
            </Link>
            <Link
              href="/contact"
              className={`${
                activePage === "contact" ? "border-b-2 pb-1" : ""
              } font-medium transition-colors ${
                activePage === "contact"
                  ? isScrolled
                    ? "border-[#022C22] text-[#022C22]"
                    : "border-[#022C22] text-white"
                  : isScrolled
                  ? "text-gray-700 hover:text-[#022C22]"
                  : "text-white/90 hover:text-white"
              }`}
            >
              Contact us
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {status === "authenticated" ? (
              <Dropdown
                renderToggle={(props, ref) => (
                  <div
                    {...props}
                    ref={ref}
                    className={`flex cursor-pointer items-center gap-2 rounded-full border px-2 py-1 transition-all ${
                      isScrolled
                        ? "border-gray-200 bg-gray-50 text-gray-900 hover:border-[#022C22] hover:bg-gray-100"
                        : "border-white/20 bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    <Avatar
                      src={user?.image || undefined}
                      alt={user?.name || "User"}
                      size="xs"
                      circle
                      className="border border-white/20"
                    >
                      {user?.name?.[0].toUpperCase() || "U"}
                    </Avatar>
                    <span className="hidden max-w-[120px] truncate text-sm font-semibold lg:block">
                      {user?.name?.split(" ")[0]}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-60" />
                  </div>
                )}
                placement="bottomEnd"
              >
                <Dropdown.Item
                  icon={<LayoutDashboard className="h-4 w-4" />}
                  onClick={() => router.push("/")}
                >
                  Go to App
                </Dropdown.Item>
                <Dropdown.Item
                  icon={<User className="h-4 w-4" />}
                  onClick={() => router.push("/Myprofile")}
                >
                  My Profile
                </Dropdown.Item>
                <Dropdown.Separator />
                <Dropdown.Item
                  icon={<LogOut className="h-4 w-4 text-red-500" />}
                  onClick={() => signOut()}
                >
                  <span className="text-red-500">Sign out</span>
                </Dropdown.Item>
              </Dropdown>
            ) : (
              <button
                className={`hidden items-center gap-2 rounded-lg border-2 px-4 py-2 font-medium transition-colors md:flex ${
                  isScrolled
                    ? "border-gray-300 bg-white text-gray-900 hover:border-[#022C22]"
                    : "border-white bg-transparent text-white hover:bg-white/10"
                }`}
                onClick={() => router.push("/Auth/Login")}
              >
                Sign in
              </button>
            )}

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

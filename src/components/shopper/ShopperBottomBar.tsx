import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTheme } from "../../context/ThemeContext";
import { formatCompactCurrency } from "../../lib/formatCurrency";

interface NavItemProps {
  icon: React.ReactNode;
  href: string;
  isActive?: boolean;
}

function NavItem({ icon, href, isActive }: NavItemProps) {
  const router = useRouter();
  const { theme } = useTheme();
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(href, undefined, { shallow: true });
  };

  return (
    <Link href={href} passHref onClick={handleClick}>
      <div className={`flex flex-col items-center ${
        isActive 
          ? theme === "dark" 
            ? "text-white" 
            : "text-gray-900"
          : theme === "dark"
            ? "text-gray-400 hover:text-white"
            : "text-gray-500 hover:text-gray-900"
      }`}>
        <span className="text-lg">{icon}</span>
      </div>
    </Link>
  );
}

export default function ShopperBottomBar() {
  const router = useRouter();
  const { theme } = useTheme();
  const currentPath = router.pathname;

  const navigationItems = [
    {
      path: "/",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      )
    },
    {
      path: "/Plasa/active-batches",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 17H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-4" />
          <path d="M9 17l6-6" />
          <path d="M15 17v-6h-6" />
        </svg>
      )
    },
    {
      path: "/Plasa/Earnings",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      )
    },
    {
      path: "/Plasa/Settings",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      path: "/Plasa/ShopperProfile",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    }
  ];

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-[9999] border-t md:hidden ${
        theme === "dark"
          ? "border-gray-800 bg-gray-900"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="mx-auto flex max-w-md justify-around py-4">
        {navigationItems.map((item) => (
          <NavItem
            key={item.path}
            href={item.path}
            icon={item.icon}
            isActive={currentPath === item.path}
          />
        ))}
      </div>
    </nav>
  );
} 
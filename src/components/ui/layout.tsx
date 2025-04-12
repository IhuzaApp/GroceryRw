import type React from "react";
import { Input, InputGroup } from "rsuite";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-80 min-h-screen pt-2">
      {/* Header */}
      <header className="container sticky top-0 z-50 mx-auto rounded-full border-b bg-white p-2 shadow-lg">
        <div className="flex items-center justify-between gap-4 px-2 sm:px-4">
          {/* Left section (address + icon) */}
          <div className="hidden items-center gap-3 md:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6 text-white"
                fill="currentColor"
              >
                <path d="..." />
              </svg>
            </div>
            <div>
              <h2 className="font-medium text-gray-900">2464 Royal Ln. Mesa</h2>
              <p className="text-xs text-gray-500">Your address</p>
            </div>
          </div>

          {/* Center search */}
          <div className="mx-2 max-w-md flex-1 md:mx-4">
            <InputGroup inside style={{ width: "100%" }}>
              <Input placeholder="Search" className="rounded-full" />
              <InputGroup.Addon>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4 w-4"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </InputGroup.Addon>
            </InputGroup>
          </div>

          {/* Right cart (desktop only) */}
          <div className="hidden items-center gap-1 md:flex">
            <div className="rounded-md bg-green-500 p-1.5 text-white">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path d="..." />
              </svg>
            </div>
            <span className="text-xl font-bold text-green-500">02</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="px-4 pb-20 pt-6 md:pb-0">{children}</main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 flex w-full items-center justify-around border-t bg-white py-2 shadow md:hidden">
        <NavItem icon="🏠" label="Home" />
        <NavItem icon="🛒" label="Cart" />
        <NavItem icon="👤" label="Profile" />
      </nav>
    </div>
  );
}

function NavItem({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex flex-col items-center text-sm text-gray-600">
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

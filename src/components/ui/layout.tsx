import type React from "react";
import SideBar from "./sidebar";
import HeaderLayout from "./NavBar/headerLayout";
import BottomBar from "./NavBar/bottomBar";
import { useSession } from "next-auth/react";
import { ThemeProvider } from "@context/ThemeContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  // session contains user: { id, name, email, phone, gender, address }
  // status is 'authenticated' | 'loading' | 'unauthenticated'
  console.log(session);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white text-gray-900 transition-colors duration-200 dark:bg-gray-900 dark:text-white">
        <HeaderLayout />
        {/* Main content */}
        <main className="px-4 pb-20 pt-6 text-gray-900 transition-colors duration-200 dark:text-white md:pb-0">
          <SideBar />
          <div className="[&_*]:text-inherit">{children}</div>
          <BottomBar />
        </main>
      </div>
    </ThemeProvider>
  );
}

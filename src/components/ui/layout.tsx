import type React from "react";
import SideBar from "./sidebar";
import HeaderLayout from "./NavBar/headerLayout";
import BottomBar from "./NavBar/bottomBar";
import { useSession } from "next-auth/react";
import { ThemeProvider } from "@context/ThemeContext";
import { useRouter } from "next/router";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Check if current page is the chat page
  const isChatPage = router.pathname.startsWith('/Messages/[orderId]');

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white text-gray-900 transition-colors duration-200 dark:bg-gray-900 dark:text-white">
        {!isChatPage && <HeaderLayout />}
        {/* Main content */}
        <main className={`text-gray-900 transition-colors duration-200 dark:text-white ${
          isChatPage ? '' : 'px-4 pb-20 pt-6 md:pb-0'
        }`}>
          {!isChatPage && <SideBar />}
          <div className="[&_*]:text-inherit">{children}</div>
          {!isChatPage && <BottomBar />}
        </main>
      </div>
    </ThemeProvider>
  );
}

import type React from "react";
import SideBar from "./sidebar";
import HeaderLayout from "./NavBar/headerLayout";
import BottomBar from "./NavBar/bottomBar";
import { useSession } from "next-auth/react";
import { ThemeProvider } from "@context/ThemeContext";
import { useRouter } from "next/router";
import AIChatProvider from "../ai-chat/AIChatProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Check if current page is the chat page
  const isChatPage = router.pathname.startsWith("/Messages/[orderId]");
  // Check if current page is the Reels page
  const isReelsPage = router.pathname === "/Reels";

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white text-gray-900 transition-colors duration-200 dark:bg-gray-900 dark:text-white">
        {!isChatPage && !isReelsPage && <HeaderLayout />}
        {/* Main content */}
        <main
          className={`text-gray-900 transition-colors duration-200 dark:text-white ${
            isChatPage || isReelsPage ? "" : "px-4 pb-20 pt-6 md:pb-0"
          }`}
          style={isReelsPage ? { margin: 0, padding: 0, height: "100vh", minHeight: "100vh", maxHeight: "100vh", overflow: "hidden" } : {}}
        >
          {!isChatPage && !isReelsPage && <SideBar />}
          <div className="[&_*]:text-inherit" style={isReelsPage ? { height: "100%", width: "100%" } : {}}>{children}</div>
          {!isChatPage && !isReelsPage && <BottomBar />}
        </main>
        {/* AI Chat - Available on all pages except chat pages */}
        {!isChatPage && <AIChatProvider />}
      </div>
    </ThemeProvider>
  );
}

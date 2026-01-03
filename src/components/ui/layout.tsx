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
  // Check if current page is the Messages index page (mobile full screen)
  const isMessagesPage = router.pathname === "/Messages";
  // Check if current page is the Reels page
  const isReelsPage = router.pathname === "/Reels";
  // Check if current page is the plasBusiness page (mobile full screen)
  const isPlasBusinessPage =
    router.pathname === "/plasBusiness" ||
    router.pathname.startsWith("/plasBusiness/");

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white text-gray-900 transition-colors duration-200 dark:bg-gray-900 dark:text-white">
        {!isChatPage &&
          !isReelsPage &&
          !isMessagesPage &&
          !isPlasBusinessPage && <HeaderLayout />}
        {/* Main content */}
        <main
          className={`text-gray-900 transition-colors duration-200 dark:text-white ${
            isChatPage || isReelsPage || isMessagesPage || isPlasBusinessPage
              ? ""
              : "px-4 pb-20 pt-6 md:pb-0"
          }`}
          style={
            isReelsPage
              ? {
                  margin: 0,
                  padding: 0,
                  height: "100vh",
                  minHeight: "100vh",
                  maxHeight: "100vh",
                  overflow: "hidden",
                }
              : {}
          }
        >
          {!isChatPage && !isReelsPage && !isMessagesPage && <SideBar />}
          <div
            className="[&_*]:text-inherit"
            style={
              isReelsPage || isPlasBusinessPage
                ? { height: "100%", width: "100%" }
                : {}
            }
          >
            {children}
          </div>
          {!isChatPage && !isReelsPage && <BottomBar />}
        </main>
        {/* AI Chat - Available on all pages except chat pages */}
        {!isChatPage && !isMessagesPage && <AIChatProvider />}
      </div>
    </ThemeProvider>
  );
}

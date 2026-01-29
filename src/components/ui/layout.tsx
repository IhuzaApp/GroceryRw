import type React from "react";
import SideBar from "./sidebar";
import HeaderLayout from "./NavBar/headerLayout";
import BottomBar from "./NavBar/bottomBar";
import { useSession } from "next-auth/react";
import { ThemeProvider } from "@context/ThemeContext";
import { useRouter } from "next/router";
import AIChatProvider from "../ai-chat/AIChatProvider";
import {
  HideBottomBarProvider,
  useHideBottomBar,
} from "@context/HideBottomBarContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <HideBottomBarProvider>
        <LayoutContent>{children}</LayoutContent>
      </HideBottomBarProvider>
    </ThemeProvider>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { hideBottomBar } = useHideBottomBar();

  const isChatPage = router.pathname.startsWith("/Messages/[orderId]");
  const isMessagesPage = router.pathname === "/Messages";
  const isReelsPage = router.pathname === "/Reels";
  const isPlasBusinessPage =
    router.pathname === "/plasBusiness" ||
    router.pathname.startsWith("/plasBusiness/");
  const isOrderDetailsPage = router.pathname.startsWith(
    "/CurrentPendingOrders/viewOrderDetails/"
  );

  return (
    <div className="min-h-screen bg-white text-gray-900 transition-colors duration-200 dark:bg-gray-900 dark:text-white">
      {/* Top navbar: hide on order details (mobile), show on desktop */}
      {!isChatPage &&
        !isReelsPage &&
        !isMessagesPage &&
        !isPlasBusinessPage &&
        (isOrderDetailsPage ? (
          <div className="hidden md:block">
            <HeaderLayout />
          </div>
        ) : (
          <HeaderLayout />
        ))}
      {/* Main content */}
      <main
        className={`text-gray-900 transition-colors duration-200 dark:text-white ${
          isChatPage || isReelsPage || isMessagesPage || isPlasBusinessPage
            ? ""
            : isOrderDetailsPage
            ? "pb-20 md:pb-0 md:pt-16"
            : "px-4 pb-20 pt-6 md:pb-0"
        }`}
        style={
          isReelsPage || isMessagesPage
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
        {/* Sidebar: hide on order details (mobile), show on desktop (SideBar has hidden md:block) */}
        {!isChatPage && !isReelsPage && !isMessagesPage && <SideBar />}
        <div
          className="[&_*]:text-inherit"
          style={
            isReelsPage ||
            isPlasBusinessPage ||
            isMessagesPage ||
            isOrderDetailsPage
              ? { height: "100%", width: "100%" }
              : {}
          }
        >
          {children}
        </div>
        {!isChatPage && !isReelsPage && !isMessagesPage && !hideBottomBar && (
          <BottomBar />
        )}
      </main>
      {/* AI Chat - Available on all pages except chat pages */}
      {!isChatPage && !isMessagesPage && !isOrderDetailsPage && (
        <AIChatProvider />
      )}
    </div>
  );
}

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
  const isMessagesList = router.pathname === "/Messages" && !router.query.chat;
  const isMessagesChat = router.pathname === "/Messages" && !!router.query.chat;
  const isReelsPage = router.pathname === "/Reels";
  const isPlasBusinessPage =
    router.pathname === "/plasBusiness" ||
    router.pathname.startsWith("/plasBusiness/");
  const isStoresPage = router.pathname.startsWith("/stores/");
  const isStoresCheckoutPage = router.pathname === "/stores/[id]/checkout";
  const isOrderDetailsPage = router.pathname.startsWith(
    "/CurrentPendingOrders/viewOrderDetails/"
  );
  const isPackageDetailsPage = router.pathname.startsWith(
    "/CurrentPendingOrders/viewPackageDetails/"
  );

  return (
    <div className="min-h-screen bg-white text-gray-900 transition-colors duration-200 dark:bg-gray-900 dark:text-white">
      {/* Top navbar: hide on order details (mobile), show on desktop */}
      {!isChatPage &&
        !isReelsPage &&
        !isPlasBusinessPage &&
        !isStoresPage &&
        (isOrderDetailsPage || isPackageDetailsPage ? (
          <div className="hidden md:block">
            <HeaderLayout />
          </div>
        ) : (
          <HeaderLayout />
        ))}
      {/* Stores (checkout, store page): show header on desktop only, full-bleed on mobile */}
      {isStoresPage && (
        <div className="hidden md:block">
          <HeaderLayout />
        </div>
      )}
      {/* Main content */}
      <main
        className={`text-gray-900 transition-colors duration-200 dark:text-white ${
          isChatPage || isReelsPage || isPlasBusinessPage || isStoresPage || isMessagesChat
            ? ""
            : isMessagesList
            ? "pt-0 pb-[60px] md:pb-0"
            : isOrderDetailsPage || isPackageDetailsPage
            ? "pb-20 md:pb-0 md:pt-16"
            : "px-4 pb-20 pt-6 md:pb-0"
        }`}
        style={
          isReelsPage || isMessagesList || isMessagesChat
            ? {
                margin: 0,
                padding: 0,
                height: isMessagesList ? "calc(100dvh - 60px)" : "100dvh",
                minHeight: isMessagesList ? "calc(100dvh - 60px)" : "100dvh",
                maxHeight: isMessagesList ? "calc(100dvh - 60px)" : "100dvh",
                overflow: "hidden",
              }
            : {}
        }
      >
        {/* Sidebar: hide on order details (mobile), show on desktop (SideBar has hidden md:block) */}
        {!isChatPage && !isReelsPage && !isMessagesList && !isMessagesChat && <SideBar />}
        <div
          className="[&_*]:text-inherit"
          style={
            isReelsPage ||
            isPlasBusinessPage ||
            isStoresPage ||
            isMessagesList ||
            isMessagesChat ||
            isOrderDetailsPage ||
            isPackageDetailsPage
              ? { height: "100%", width: "100%" }
              : {}
          }
        >
          {children}
        </div>
        {!isChatPage &&
          !isReelsPage &&
          !isMessagesChat &&
          !isStoresCheckoutPage &&
          !hideBottomBar && <BottomBar />}
      </main>
      {/* AI Chat - Available on all pages except chat pages */}
      {!isChatPage && !isMessagesChat && <AIChatProvider />}
    </div>
  );
}

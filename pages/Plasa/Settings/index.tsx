"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/router";
import ShopperLayout from "../../../src/components/shopper/ShopperLayout";
import { useTheme } from "../../../src/context/ThemeContext";
import { Panel, Nav } from "rsuite";
import WorkScheduleTab from "../../../src/components/shopper/settings/WorkScheduleTab";
import PaymentTab from "../../../src/components/shopper/settings/PaymentTab";
import NotificationTab from "../../../src/components/shopper/settings/NotificationTab";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]";
import { Session } from "next-auth";

// Extend the Session type to include our custom fields
interface CustomSession extends Session {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role: string | null;
    image: string | null;
  };
}

interface SettingsPageProps {
  sessionData: CustomSession;
}

function SettingsPage({ sessionData }: SettingsPageProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("schedule");

  // Memoize the tab change handler
  const handleTabChange = useCallback(
    (newTab: string) => {
      setActiveTab(newTab);
      // Update URL without page reload
      router.push(`/Plasa/Settings?tab=${newTab}`, undefined, {
        shallow: true,
      });
    },
    [router]
  );

  // Define tabs configuration
  const tabs = [
    {
      key: "schedule",
      label: "Work Schedule",
      component: <WorkScheduleTab initialSession={sessionData} />,
    },
    { key: "payment", label: "Payment Info", component: <PaymentTab /> },
    {
      key: "notifications",
      label: "Notifications",
      component: <NotificationTab />,
    },
    {
      key: "security",
      label: "Security",
      component: (
        <div className="p-4">
          <h3
            className={`mb-4 text-lg font-semibold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Security Settings
          </h3>
          <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
            Security settings coming soon...
          </p>
        </div>
      ),
    },
  ];

  // Effect to sync URL with active tab
  React.useEffect(() => {
    const tab = router.query.tab as string;
    if (tab && tabs.some((t) => t.key === tab)) {
      setActiveTab(tab);
    }
  }, [router.query.tab]);

  return (
    <ShopperLayout>
      <div
        className={`container mx-auto px-2 py-4 pb-24 sm:px-4 sm:py-8 sm:pb-8 ${
          theme === "dark" ? "text-gray-100" : "text-gray-900"
        }`}
      >
        <h1 className="mb-4 text-xl font-bold sm:mb-6 sm:text-2xl">Settings</h1>

        <div className="scrollbar-hide -mx-2 mb-3 overflow-x-auto whitespace-nowrap px-2 sm:mx-0 sm:mb-4 sm:px-0">
          <Nav
            appearance="default"
            activeKey={activeTab}
            onSelect={handleTabChange}
            className="flex min-w-max gap-1 sm:gap-2"
          >
            {tabs.map((tab) => (
              <Nav.Item
                key={tab.key}
                eventKey={tab.key}
                className={`!bg-transparent !px-3 !py-1.5 !text-xs hover:!bg-transparent sm:!px-4 sm:!py-2 sm:!text-sm ${
                  activeTab === tab.key
                    ? theme === "dark"
                      ? "font-semibold !text-white"
                      : "font-semibold !text-green-600"
                    : theme === "dark"
                    ? "!text-gray-300 hover:!text-white"
                    : "!text-gray-700 hover:!text-green-600"
                }`}
              >
                {tab.label}
              </Nav.Item>
            ))}
          </Nav>
        </div>

        <Panel
          shaded
          bordered
          className={`overflow-hidden rounded-lg ${
            theme === "dark"
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-white"
          }`}
        >
          {tabs.find((tab) => tab.key === activeTab)?.component}
        </Panel>
      </div>
    </ShopperLayout>
  );
}

export default SettingsPage;

// TEMPORARY: Disable server-side authentication to test if it's causing the issue
export const getServerSideProps: GetServerSideProps = async (context) => {
  return { props: {} };
  
  // Original authentication code (disabled for testing)
  // const session = await getServerSession(context.req, context.res, authOptions);
  // if (!session) {
  //   return {
  //     redirect: {
  //       destination: "/auth/signin",
  //       permanent: false,
  //     },
  //   };
  // }
  // const sanitizedSession: CustomSession = {
  //   user: {
  //     id: session.user?.id || "",
  //     name: session.user?.name || null,
  //     email: session.user?.email || null,
  //     role: (session.user as any)?.role || null,
  //     image: session.user?.image || null,
  //   },
  //   expires: session.expires,
  // };
  // return {
  //   props: {
  //     sessionData: sanitizedSession,
  //   },
  // };
};

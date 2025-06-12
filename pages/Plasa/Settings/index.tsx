import React, { useState } from "react";
import ShopperLayout from "../../../src/components/shopper/ShopperLayout";
import { useTheme } from "../../../src/context/ThemeContext";
import { Panel, Nav } from "rsuite";
import WorkScheduleTab from "../../../src/components/shopper/settings/WorkScheduleTab";
import PaymentTab from "../../../src/components/shopper/settings/PaymentTab";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../pages/api/auth/[...nextauth]";

interface SessionUser {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  image: string | null;
}

interface Session {
  user: SessionUser;
  expires: string;
}

interface SettingsPageProps {
  sessionData: {
    user: {
      id: string;
      name: string | null;
      email: string | null;
      role: string | null;
      image: string | null;
    };
    expires: string;
  };
}

function SettingsPage({ sessionData }: SettingsPageProps) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("schedule");

  return (
    <ShopperLayout>
      <div
        className={`container mx-auto px-4 py-8 ${
          theme === "dark" ? "text-gray-100" : "text-gray-900"
        }`}
      >
        <h1 className="mb-6 text-2xl font-bold">Settings</h1>

        <div className="scrollbar-hide mb-4 overflow-x-auto whitespace-nowrap">
          <Nav
            appearance="default"
            activeKey={activeTab}
            onSelect={setActiveTab}
            className="flex min-w-max gap-2"
          >
            {[
              { key: "schedule", label: "Work Schedule" },
              { key: "payment", label: "Payment Info" },
              { key: "notifications", label: "Notifications" },
              { key: "security", label: "Security" },
            ].map((tab) => (
              <Nav.Item
                key={tab.key}
                eventKey={tab.key}
                className={`!bg-transparent !px-4 !py-2 !text-sm hover:!bg-transparent ${
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
          className={`${
            theme === "dark"
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-white"
          }`}
        >
          {activeTab === "schedule" && <WorkScheduleTab initialSession={sessionData} />}
          {activeTab === "payment" && <PaymentTab />}
          {activeTab === "notifications" && (
            <div className="p-4">
              <h3 className={`mb-4 text-lg font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}>
                Notifications Settings
              </h3>
              <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
                Notification settings coming soon...
              </p>
            </div>
          )}
          {activeTab === "security" && (
            <div className="p-4">
              <h3 className={`mb-4 text-lg font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}>
                Security Settings
              </h3>
              <p className={theme === "dark" ? "text-gray-300" : "text-gray-600"}>
                Security settings coming soon...
              </p>
            </div>
          )}
        </Panel>
      </div>
    </ShopperLayout>
  );
}

export default SettingsPage;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(
    context.req,
    context.res,
    authOptions as any
  );

  if (!session) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }

  // Check if the user has the shopper role
  const userRole = session.user?.role;

  if (userRole !== "shopper") {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  // Sanitize the session data to ensure all fields are JSON-serializable
  const sanitizedSession = {
    user: {
      id: session.user.id,
      name: session.user.name || null,
      email: session.user.email || null,
      role: session.user.role || null,
      image: session.user.image || null,
    },
    expires: session.expires,
  };

  return { 
    props: {
      sessionData: sanitizedSession
    }
  };
}; 
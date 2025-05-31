import React from "react";
import ShopperLayout from "@components/shopper/ShopperLayout";
import Link from "next/link";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]";
import ShopperProfileComponent from "@components/shopper/profile/ShopperProfileComponent";
import { useTheme } from "@context/ThemeContext";

// Define a type for the session user with role
interface SessionUser {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  image?: string;
}

interface Session {
  user: SessionUser;
  expires: string;
}

export default function ShopperProfilePage() {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen p-4 transition-colors duration-200 ${
      theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className={`mx-auto max-w-4xl rounded-lg border p-6 shadow-sm ${
        theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
      }`}>
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${
            theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}>
            Shopper Profile
          </h1>
          <p className={`mt-2 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Manage your shopper account and preferences
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className={`mb-4 text-xl font-semibold ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
            }`}>
              Personal Information
            </h2>
            <div className={`rounded-lg border p-4 ${
              theme === 'dark' ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="mb-4 flex items-center">
                <div className={`mr-4 h-16 w-16 rounded-full ${
                  theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                }`}>
                  {/* Profile image placeholder */}
                </div>
                <div>
                  <h3 className={`font-medium ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>
                    John Doe
                  </h3>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    john.doe@example.com
                  </p>
                </div>
              </div>
              <button className={`w-full rounded-lg px-4 py-2 text-sm font-medium ${
                theme === 'dark'
                  ? 'bg-gray-600 text-gray-100 hover:bg-gray-500'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}>
                Edit Profile
              </button>
            </div>
          </div>

          <div>
            <h2 className={`mb-4 text-xl font-semibold ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
            }`}>
              Account Statistics
            </h2>
            <div className={`rounded-lg border p-4 ${
              theme === 'dark' ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Total Orders
                  </p>
                  <p className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  }`}>
                    128
                  </p>
                </div>
                <div>
                  <p className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Rating
                  </p>
                  <p className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-green-400' : 'text-green-600'
                  }`}>
                    4.8
                  </p>
                </div>
                <div>
                  <p className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Total Earnings
                  </p>
                  <p className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-green-400' : 'text-green-600'
                  }`}>
                    $2,456
                  </p>
                </div>
                <div>
                  <p className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Completion Rate
                  </p>
                  <p className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    98%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className={`mb-4 text-xl font-semibold ${
            theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}>
            Account Settings
          </h2>
          <div className={`space-y-4 rounded-lg border p-4 ${
            theme === 'dark' ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  Notifications
                </p>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Receive order and earnings notifications
                </p>
              </div>
              <button className={`rounded-lg px-4 py-2 text-sm font-medium ${
                theme === 'dark'
                  ? 'bg-gray-600 text-gray-100 hover:bg-gray-500'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}>
                Configure
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  Payment Methods
                </p>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Manage your payment options
                </p>
              </div>
              <button className={`rounded-lg px-4 py-2 text-sm font-medium ${
                theme === 'dark'
                  ? 'bg-gray-600 text-gray-100 hover:bg-gray-500'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}>
                Manage
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${
                  theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  Privacy Settings
                </p>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Control your privacy preferences
                </p>
              </div>
              <button className={`rounded-lg px-4 py-2 text-sm font-medium ${
                theme === 'dark'
                  ? 'bg-gray-600 text-gray-100 hover:bg-gray-500'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}>
                Update
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Protect this page: redirect to login if not authenticated
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = (await getServerSession(
    context.req,
    context.res,
    authOptions as any
  )) as Session | null;

  if (!session) {
    return {
      redirect: {
        destination: "/Auth/Login",
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

  return { props: {} };
};

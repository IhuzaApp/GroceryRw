import type React from "react";
import SideBar from "./sidebar";
import HeaderLayout from "./NavBar/headerLayout";
import BottomBar from "./NavBar/bottomBar";
import { useSession } from "next-auth/react";

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
    <div className="bg-gray-80 min-h-screen pt-2">
      <HeaderLayout />
      {/* Main content */}
      <main className="px-4 pb-20 pt-6 md:pb-0">
        <SideBar />
        {children}
        <BottomBar />
      </main>
    </div>
  );
}

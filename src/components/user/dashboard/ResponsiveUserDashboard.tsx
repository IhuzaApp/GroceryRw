import { useState, useEffect } from "react";
import { Data } from "../../../types";
import MobileUserDashboard from "./MobileUserDashboard";
import DesktopUserDashboard from "./DesktopUserDashboard";
import LoadingScreen from "../../ui/LoadingScreen";

export default function ResponsiveUserDashboard({ initialData }: { initialData: Data }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsLoading(false);
    };

    // Check initial screen size
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);

    // Cleanup event listener on component unmount
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Show loading screen while determining screen size
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Render appropriate component based on screen size
  return isMobile ? (
    <MobileUserDashboard initialData={initialData} />
  ) : (
    <DesktopUserDashboard initialData={initialData} />
  );
}

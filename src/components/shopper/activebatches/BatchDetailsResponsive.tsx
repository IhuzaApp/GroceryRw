"use client";

import { useState, useEffect } from "react";
import BatchDetails from "./batchDetails";
import { BatchDetailsProps } from "./types";

export default function BatchDetailsResponsive(props: BatchDetailsProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };

    // Check on mount
    checkScreenSize();

    // Add listener for window resize
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // For now, we render the same component but with responsive classes
  // The batchDetails component already has built-in responsive design
  return <BatchDetails {...props} />;
}

import React, { createContext, useContext } from "react";
import { useJsApiLoader } from "@react-google-maps/api";

// Define the type for the context value
interface GoogleMapContextType {
  isLoaded: boolean;
}

const GoogleMapContext = createContext<GoogleMapContextType | undefined>(
  undefined
);

export const GoogleMapProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API || "",
    libraries: ["places", "drawing", "geometry"],
    language: "en",
    region: "US",
  });

  return (
    <GoogleMapContext.Provider value={{ isLoaded }}>
      {children}
    </GoogleMapContext.Provider>
  );
};

// Hook to access the context
export const useGoogleMap = (): GoogleMapContextType => {
  const context = useContext(GoogleMapContext);
  if (!context) {
    throw new Error("useGoogleMap must be used within a GoogleMapProvider");
  }
  return context;
}; 
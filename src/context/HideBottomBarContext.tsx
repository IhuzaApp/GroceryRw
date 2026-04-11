"use client";

import React, { createContext, useContext, useState } from "react";

interface HideBottomBarContextType {
  hideBottomBar: boolean;
  setHideBottomBar: (hide: boolean) => void;
  hideFloatingUI: boolean;
  setHideFloatingUI: (hide: boolean) => void;
}

const HideBottomBarContext = createContext<
  HideBottomBarContextType | undefined
>(undefined);

export function HideBottomBarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hideBottomBar, setHideBottomBar] = useState(false);
  const [hideFloatingUI, setHideFloatingUI] = useState(false);
  return (
    <HideBottomBarContext.Provider
      value={{
        hideBottomBar,
        setHideBottomBar,
        hideFloatingUI,
        setHideFloatingUI,
      }}
    >
      {children}
    </HideBottomBarContext.Provider>
  );
}

export function useHideBottomBar() {
  const ctx = useContext(HideBottomBarContext);
  if (ctx === undefined) {
    return {
      hideBottomBar: false,
      setHideBottomBar: () => {},
      hideFloatingUI: false,
      setHideFloatingUI: () => {},
    };
  }
  return ctx;
}

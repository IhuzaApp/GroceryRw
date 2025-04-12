import React from "react";
import RootLayout from "@components/ui/layout";
import SideBar from "@components/ui/sidebar";
import AllItems from "@components/items/items";

export default function Home() {
  return (
    <RootLayout>
     <AllItems />
    </RootLayout>
  );
}

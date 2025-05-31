import React from "react";
import ShopperLayout from "@components/shopper/ShopperLayout";
import { useTheme } from "../../../src/context/ThemeContext";

const SettingsPage: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <ShopperLayout>
      <div className={`container mx-auto px-4 py-8 ${
        theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
      }`}>
        {/* Settings content will go here */}
      </div>
    </ShopperLayout>
  );
};

export default SettingsPage;

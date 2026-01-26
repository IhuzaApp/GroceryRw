import React from "react";
import ShopperLayout from "@components/shopper/ShopperLayout";
import ShopperProfileComponent from "@components/shopper/profile/ShopperProfileComponent";
import { AuthGuard } from "../../../src/components/AuthGuard";

function ShopperProfilePage() {
  return (
    <AuthGuard requireAuth={true} requireRole="shopper">
      <ShopperLayout>
        <div className="w-full overflow-x-hidden">
          <ShopperProfileComponent />
        </div>
      </ShopperLayout>
    </AuthGuard>
  );
}

export default ShopperProfilePage;

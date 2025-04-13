import React, { useState } from "react";
import ProdCategories from "@components/ui/categories";
import Products from "./Products";
import ShopList from "@components/shops/shopList";

export default function ItemsSection() {
  const [categorySelected, setCategorySelected] = useState("Popular");
  const [selectedShop, setSelectedShop] = useState<any>(null); // Store selected shop

  const shopCategories = ["Super Market", "Bakery"];
  const showShops = shopCategories.includes(categorySelected);

  return (
    <>
      <ProdCategories
        categorySelected={categorySelected}
        onSelectCategory={(cat) => {
          setCategorySelected(cat);
          setSelectedShop(null); // Reset selected shop when switching categories
        }}
      />

      {showShops ? (
        selectedShop ? (
          <Products shopId={selectedShop.id} shopName={selectedShop.name} />
        ) : (
          <ShopList
            category={categorySelected}
            onSelectShop={(shop) => setSelectedShop(shop)}
          />
        )
      ) : (
        <Products category={categorySelected} />
      )}
    </>
  );
}

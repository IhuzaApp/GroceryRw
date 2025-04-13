import React, { useState } from "react";
import { Panel } from "rsuite";

function darkenColor(hex: string, amount: number): string {
  let col = hex.startsWith("#") ? hex.slice(1) : hex;
  if (col.length === 3) {
    col = col.split("").map((c) => c + c).join("");
  }

  const r = Math.max(0, parseInt(col.substring(0, 2), 16) - amount);
  const g = Math.max(0, parseInt(col.substring(2, 4), 16) - amount);
  const b = Math.max(0, parseInt(col.substring(4, 6), 16) - amount);

  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

interface ProdCategoriesProps {
  categorySelected: string;
  onSelectCategory: (category: string) => void;
}

export default function ProdCategories({
  categorySelected,
  onSelectCategory,
}: ProdCategoriesProps) {
  const [showAll, setShowAll] = useState(false);

  const visibleCategories = showAll ? categories : categories.slice(0, 8);

  return (
    <div className="p-0 sm:relative sm:mt-4 sm:p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl">
          Categories
        </h2>
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-base text-green-500 hover:underline sm:text-lg"
        >
          {showAll ? "Show Less" : "View All"}
        </button>
      </div>

      <div className="overflow-x-auto sm:overflow-hidden">
        <div className="flex gap-3 sm:grid sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {visibleCategories.map((cat) => (
            <CategoryCard
              key={cat.name}
              icon={cat.icon}
              name={cat.name}
              bgColor={cat.bgColor}
              selected={cat.name === categorySelected}
              onClick={() => onSelectCategory(cat.name)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const categories = [
  { icon: "/assets/icons/shop.png", name: "Super Market", bgColor: "#E6F7FF" },
  { icon: "/assets/icons/bakery.png", name: "Bakery", bgColor: "#FFFAE6" },
  { icon: "/assets/icons/vegitables.png", name: "Vegetables", bgColor: "#F1FFF0" },
  { icon: "/assets/icons/fruits.png", name: "Fruits", bgColor: "#ffe6cc" },
  { icon: "/assets/icons/Butchery.png", name: "Meat & Seafood", bgColor: "#ffe6f9" },
  { icon: "/assets/icons/drinks.png", name: "Drinks", bgColor: "#ffe6e6" },
  { icon: "/assets/icons/snacks.png", name: "Snacks", bgColor: "#F3EFEA" },
  { icon: "/assets/icons/hygien.png", name: "Care & Beauty", bgColor: "#F0F8FF" },
  { icon: "/assets/icons/pets.png", name: "Pet Food", bgColor: "#FFF0F5" },
];

function CategoryCard({
  icon,
  name,
  bgColor,
  selected,
  onClick,
}: {
  icon: string;
  name: string;
  bgColor: string;
  selected: boolean;
  onClick: () => void;
}) {
  const darkenedColor = darkenColor(bgColor, 10);

  return (
    <div className="w-32 flex-shrink-0 sm:w-auto sm:flex-shrink">
      <Panel
        shaded
        bodyFill
        onClick={onClick}
        className={`rounded-xl border p-3 text-center transition-all duration-300 hover:shadow-md cursor-pointer ${
          selected ? "ring-2 ring-green-500" : ""
        }`}
        style={{
          backgroundColor: bgColor,
          transition: "background-color 0.3s ease",
        }}
        onMouseEnter={(e: { currentTarget: HTMLDivElement }) => {
          (e.currentTarget as HTMLDivElement).style.backgroundColor = darkenedColor;
        }}
        onMouseLeave={(e: { currentTarget: HTMLDivElement }) => {
          (e.currentTarget as HTMLDivElement).style.backgroundColor = bgColor;
        }}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <img src={icon} alt={name} className="w-10 h-10 mb-2" />
          <span className="text-sm font-medium text-gray-800">{name}</span>
        </div>
      </Panel>
    </div>
  );
}

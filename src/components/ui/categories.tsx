import React from "react";
import { Panel } from "rsuite";

export default function ProdCategories() {
  return (
    <div className="p-0 sm:relative sm:mt-4 sm:p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl">
          Categories
        </h2>
        <a href="#" className="text-base text-orange-500 sm:text-lg">
          View All
        </a>
      </div>

      <div className="overflow-x-auto sm:overflow-hidden">
        <div className="flex gap-3 sm:grid sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.name}
              icon={cat.icon}
              name={cat.name}
              bgColor={cat.bgColor}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Light pastel background colors
const categories = [
  { icon: "🥪", name: "Snacks", bgColor: "#FFF7E6" },
  { icon: "🍳", name: "Breakfast", bgColor: "#FFF0F0" },
  { icon: "🥤", name: "Drinks", bgColor: "#E6F7FF" },
  { icon: "☕", name: "Coffee", bgColor: "#F3EFEA" },
  { icon: "🥫", name: "Canned", bgColor: "#FFFAE6" },
  { icon: "🍎", name: "Fruits", bgColor: "#FFF0F5" },
  { icon: "🍶", name: "Sauce", bgColor: "#F0F8FF" },
  { icon: "🥬", name: "Vegetables", bgColor: "#F1FFF0" },
];

function CategoryCard({
  icon,
  name,
  bgColor,
}: {
  icon: string;
  name: string;
  bgColor: string;
}) {
  return (
    <div className="w-32 flex-shrink-0 sm:w-auto sm:flex-shrink">
      <Panel
        shaded
        bodyFill
        className="rounded-xl border p-3 text-center transition-shadow hover:shadow-sm"
        style={{ backgroundColor: bgColor }}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <span className="text-3xl">{icon}</span>
          <span className="text-sm font-medium text-gray-800">{name}</span>
        </div>
      </Panel>
    </div>
  );
}

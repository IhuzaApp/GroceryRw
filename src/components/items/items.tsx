import React from "react";

import { Input, InputGroup, Panel, IconButton, FlexboxGrid } from "rsuite";
import Image from "next/image";
import ProdCategories from "@components/ui/categories";

export default function AllItems() {
  return (
    <div className="p-4 md:ml-16">
      {" "}
      {/* Adjust ml-* to match your sidebar width */}
      <div className="container mx-auto">
        {/* Banner */}
      
        {/* Categories */}
        <ProdCategories />

        {/* Popular Items */}
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Popular Items</h2>
            <div className="flex gap-2">
              <IconButton
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-4 w-4"
                  >
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                }
                circle
                size="sm"
                appearance="subtle"
              />
              <IconButton
                icon={
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-4 w-4"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                }
                circle
                size="sm"
                appearance="subtle"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
            <ProductCard
              image="https://media.istockphoto.com/id/171302954/photo/groceries.jpg?s=612x612&w=0&k=20&c=D3MmhT5DafwimcYyxCYXqXMxr1W25wZnyUf4PF1RYw8="
              name="Mushroom"
              size="24oz"
              price="$8,92"
            />
            <ProductCard
              image="https://media.istockphoto.com/id/171302954/photo/groceries.jpg?s=612x612&w=0&k=20&c=D3MmhT5DafwimcYyxCYXqXMxr1W25wZnyUf4PF1RYw8="
              name="Deliciously Ella"
              size="500g"
              price="$20,72"
            />
            <ProductCard
              image="https://media.istockphoto.com/id/171302954/photo/groceries.jpg?s=612x612&w=0&k=20&c=D3MmhT5DafwimcYyxCYXqXMxr1W25wZnyUf4PF1RYw8="
              name="Mixed Nuts"
              size="24oz"
              price="$3,01"
            />
            <ProductCard
              image="https://media.istockphoto.com/id/171302954/photo/groceries.jpg?s=612x612&w=0&k=20&c=D3MmhT5DafwimcYyxCYXqXMxr1W25wZnyUf4PF1RYw8="
              name="Seasoned"
              size="0.5 Kg"
              price="$4,29"
            />
            <ProductCard
              image="https://media.istockphoto.com/id/171302954/photo/groceries.jpg?s=612x612&w=0&k=20&c=D3MmhT5DafwimcYyxCYXqXMxr1W25wZnyUf4PF1RYw8="
              name="6 Pieces Eggs"
              size="6 Pieces"
              price="$6,92"
            />
            <ProductCard
              image="https://media.istockphoto.com/id/171302954/photo/groceries.jpg?s=612x612&w=0&k=20&c=D3MmhT5DafwimcYyxCYXqXMxr1W25wZnyUf4PF1RYw8="
              name="Premium Muffin"
              size="1 Pieces"
              price="$8,92"
            />
          </div>
        </div>

        {/* New Arrival */}
        {/* <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-800">New Arrival</h2>
      </div> */}
      </div>
    </div>
  );
}

function ProductCard({
  image,
  name,
  size,
  price,
}: {
  image: string;
  name: string;
  size: string;
  price: string;
}) {
  return (
    <Panel shaded bodyFill style={{ borderRadius: "0.75rem", height: "100%" }}>
      <div className="flex justify-center p-4">
        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          width={120}
          height={120}
          className="object-contain"
        />
      </div>
      <Panel>
        <h3 className="font-medium text-gray-900">{name}</h3>
        <p className="text-sm text-gray-500">{size}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-bold text-gray-900">{price}</span>
          <IconButton
  icon={
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5 text-white"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  }
  circle
  color="green"
  size="sm"
  appearance="primary"
  className="bg-green-600 hover:bg-green-700"
/>
        </div>
      </Panel>
    </Panel>
  );
}

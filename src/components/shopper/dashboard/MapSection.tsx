"use client"

import React from "react";
import { Loader } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import Image from "next/image";

interface MapSectionProps {
  mapLoaded: boolean;
  availableOrders: Array<{ id: string }>;
}

export default function MapSection({ mapLoaded, availableOrders }: MapSectionProps) {
  return (
    <div className="p-4">
      <div className="h-[300px] md:h-[400px] bg-gray-200 rounded-lg relative overflow-hidden">
        {!mapLoaded ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader size="lg" content="Loading map..." />
          </div>
        ) : (
          <>
            <Image
              src="/placeholder.svg?height=400&width=1200"
              alt="Map"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="bg-white bg-opacity-75 p-2 rounded">
                Interactive map would display here with order locations
              </p>
            </div>
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                Your Location
              </div>
            </div>
            {availableOrders.map((order, index) => (
              <div
                key={order.id}
                className="absolute"
                style={{
                  left: `${20 + index * 20}%`,
                  top: `${30 + (index % 3) * 15}%`,
                }}
              >
                <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs">
                  {index + 1}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
} 
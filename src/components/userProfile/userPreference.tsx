import React from "react";
import { Tag, Button } from "rsuite";

export default function UserPreference() {
  return (
    <>
      <h3 className="mb-4 text-lg font-bold">Preferences</h3>

      <div className="space-y-6">
        <div>
          <h4 className="mb-2 font-bold">Notification Settings</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Order updates</span>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between">
              <span>Promotions and deals</span>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between">
              <span>New product arrivals</span>
              <input type="checkbox" className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between">
              <span>Delivery reminders</span>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div>
          <h4 className="mb-2 font-bold">Dietary Preferences</h4>
          <div className="flex flex-wrap gap-2">
            <Tag className="border-gray-200 bg-gray-100 text-gray-600">
              Vegetarian
            </Tag>
            <Tag className="border-gray-200 bg-gray-100 text-gray-600">
              Gluten-Free
            </Tag>
            <Tag className="border-gray-200 bg-gray-100 text-gray-600">
              Organic
            </Tag>
            <button className="rounded border border-green-700 px-3 py-1 text-sm text-green-700 hover:bg-green-100">
            + Add More
            </button>
          </div>
        </div>

        <div>
          <h4 className="mb-2 font-bold">Favorite Categories</h4>
          <div className="flex flex-wrap gap-2">
            <Tag className="border-gray-200 bg-gray-100 text-gray-600">
              Fresh Produce
            </Tag>
            <Tag className="border-gray-200 bg-gray-100 text-gray-600">
              Snacks
            </Tag>
            <Tag className="border-gray-200 bg-gray-100 text-gray-600">
              Dairy
            </Tag>
            <Tag className="border-gray-200 bg-gray-100 text-gray-600">
              Beverages
            </Tag>
            <button className="rounded border border-purple-700 px-3 py-1 text-sm text-purple-700 hover:bg-purple-100">
            + Add More
            </button>

          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
      <button className="rounded bg-green-600 px-3 py-2 text-sm text-White hover:bg-green-500">
<span className="text-white">      Save Preferences</span>
            </button>

      </div>
    </>
  );
}

import React from "react";
import { Tag, Button } from "rsuite";

export default function UserPreference(){
    return(
        <>
             <h3 className="mb-4 text-lg font-bold">Preferences</h3>

<div className="space-y-6">
  <div>
    <h4 className="mb-2 font-bold">Notification Settings</h4>
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span>Order updates</span>
        <input
          type="checkbox"
          defaultChecked
          className="h-4 w-4"
        />
      </div>
      <div className="flex items-center justify-between">
        <span>Promotions and deals</span>
        <input
          type="checkbox"
          defaultChecked
          className="h-4 w-4"
        />
      </div>
      <div className="flex items-center justify-between">
        <span>New product arrivals</span>
        <input type="checkbox" className="h-4 w-4" />
      </div>
      <div className="flex items-center justify-between">
        <span>Delivery reminders</span>
        <input
          type="checkbox"
          defaultChecked
          className="h-4 w-4"
        />
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
      <Button appearance="ghost" size="sm">
        + Add More
      </Button>
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
      <Button appearance="ghost" size="sm">
        + Add More
      </Button>
    </div>
  </div>
</div>

<div className="mt-6 flex justify-end">
  <Button
    appearance="primary"
    className="bg-green-500 text-white"
  >
    Save Preferences
  </Button>
</div>
        </>
    )
}
import React from "react";
import { Panel, Tag } from "rsuite";

export default function UserPayment() {
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold">Payment Methods</h3>
        <button className="rounded bg-green-700 px-4 py-2 text-white hover:bg-green-600">
          Add Payment Method
        </button>
      </div>

      <div className="space-y-4">
        <Panel bordered className="relative">
          <Tag className="absolute right-2 top-2 border-green-200 bg-green-100 text-green-600">
            Default
          </Tag>
          <div className="flex items-center">
            <div className="mr-3 flex h-8 w-12 items-center justify-center rounded bg-blue-600 text-white">
              VISA
            </div>
            <div>
              <h4 className="font-bold">Visa ending in 4242</h4>
              <p className="text-sm text-gray-600">Expires 05/2026</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button className="rounded border border-purple-500 px-3 py-1 text-sm text-purple-500 hover:bg-purple-100">
              Edit
            </button>
            <button className="rounded border border-red-500 px-3 py-1 text-sm text-red-500 hover:bg-red-100">
              Delete
            </button>
          </div>
        </Panel>

        <Panel bordered>
          <div className="flex items-center">
            <div className="mr-3 flex h-8 w-12 items-center justify-center rounded bg-orange-500 text-white">
              MC
            </div>
            <div>
              <h4 className="font-bold">Mastercard ending in 8888</h4>
              <p className="text-sm text-gray-600">Expires 11/2025</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button className="rounded border border-purple-500 px-3 py-1 text-sm text-purple-500 hover:bg-purple-100">
              Edit
            </button>
            <button className="rounded border border-red-500 px-3 py-1 text-sm text-red-500 hover:bg-red-100">
              Delete
            </button>
            <button className="rounded border border-green-700 px-3 py-1 text-sm text-green-700 hover:bg-green-100">
              Set as Default
            </button>
          </div>
        </Panel>
      </div>
    </>
  );
}

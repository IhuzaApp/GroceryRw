import React from "react";
import { Button, Panel, Tag } from "rsuite";

export default function UserAddress() {
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold">Saved Addresses</h3>
        <Button
          appearance="primary"
          color="green"
          className="bg-green-500 text-white"
        >
          Add New Address
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Panel bordered className="relative">
          <Tag className="absolute right-2 top-2 border-green-200 bg-green-100 text-green-600">
            Default
          </Tag>
          <h4 className="font-bold">Home</h4>
          <p className="mt-2 text-gray-600">
            2464 Royal Ln.
            <br />
            Mesa, AZ 85201
            <br />
            United States
          </p>
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
          <h4 className="font-bold">Work</h4>
          <p className="mt-2 text-gray-600">
            875 Tech Park Dr.
            <br />
            Mesa, AZ 85210
            <br />
            United States
          </p>
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

import React from "react";
import { Button, Panel, Tag } from "rsuite";

export default function UserPayment(){
    return(
        <>
             <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold">Payment Methods</h3>
                <Button
                  appearance="primary"
                  className="bg-green-500 text-white"
                >
                  Add Payment Method
                </Button>
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
                    <Button appearance="ghost" size="sm">
                      Edit
                    </Button>
                    <Button appearance="ghost" size="sm">
                      Delete
                    </Button>
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
                    <Button appearance="ghost" size="sm">
                      Edit
                    </Button>
                    <Button appearance="ghost" size="sm">
                      Delete
                    </Button>
                    <Button appearance="ghost" size="sm">
                      Set as Default
                    </Button>
                  </div>
                </Panel>
              </div>
        </>
    )
}
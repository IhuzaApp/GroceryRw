import React from "react";
import { Input, Button } from "rsuite";
import UserPaymentCards from "./UserPaymentCards";

export default function UserAccount(){
    return(
        <>
        <UserPaymentCards />

              <div className="hidden sm:block">
                <h3 className="mb-4 mt-3 text-lg font-bold">
                  Account Information
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm text-gray-600">
                      First Name
                    </label>
                    <input className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-gray-200 rounded-[9px] px-3 py-2 transition duration-300 ease focus:outline-none focus:border-gray-100 hover:border-slate-300 shadow-sm focus:shadow" placeholder="First Name" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-gray-600">
                      Last Name
                    </label>
                    <input className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-gray-200 rounded-[9px] px-3 py-2 transition duration-300 ease focus:outline-none focus:border-gray-100 hover:border-slate-300 shadow-sm focus:shadow" placeholder="Last Name" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-gray-600">
                      Email Address
                    </label>
                    <input className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-gray-200 rounded-[9px] px-3 py-2 transition duration-300 ease focus:outline-none focus:border-gray-100 hover:border-slate-300 shadow-sm focus:shadow" placeholder="Email Address" />

                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-gray-600">
                      Phone Number
                    </label>
                    <input className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-gray-200 rounded-[9px] px-3 py-2 transition duration-300 ease focus:outline-none focus:border-gray-100 hover:border-slate-300 shadow-sm focus:shadow" placeholder="Phone Number" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-gray-600">
                      Address
                    </label>
                    <input className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-gray-200 rounded-[9px] px-3 py-2 transition duration-300 ease focus:outline-none focus:border-gray-100 hover:border-slate-300 shadow-sm focus:shadow" placeholder="First Name" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-gray-600">
                      Gender
                    </label>
                    <select className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-gray-200 rounded-[9px] px-3 py-2 transition duration-300 ease focus:outline-none focus:border-gray-100 hover:border-slate-300 shadow-sm focus:shadow" name="" id="">
                        <option value="">Select Gender</option>
                        <option value="">Male</option>
                        <option value="">Female</option>
                    </select>
           
                  </div>
                </div>
              </div>

              <h3 className="mb-4 mt-6 text-lg font-bold">Password</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-gray-600">
                    Current Password
                  </label>
                  <input className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-gray-200 rounded-[9px] px-3 py-2 transition duration-300 ease focus:outline-none focus:border-gray-100 hover:border-slate-300 shadow-sm focus:shadow" type="password" placeholder="Current Password" />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-600">
                    New Password
                  </label>
                  <input className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-gray-200 rounded-[9px] px-3 py-2 transition duration-300 ease focus:outline-none focus:border-gray-100 hover:border-slate-300 shadow-sm focus:shadow"  type="password" placeholder="New Password" />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  appearance="primary"
                  className="bg-green-500 text-white"
                >
                  Save Changes
                </Button>
              </div>
        </>
    )
}
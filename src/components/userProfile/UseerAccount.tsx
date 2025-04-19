import React from "react";
import { Input, Button } from "rsuite";
import UserPaymentCards from "./UserPaymentCards";

export default function UserAccount() {
  return (
    <>
      <UserPaymentCards />

      <div className="hidden sm:block">
        <h3 className="mb-4 mt-3 text-lg font-bold">Account Information</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-gray-600">
              First Name
            </label>
            <input
              className="ease w-full rounded-[9px] border border-gray-200 bg-transparent px-3 py-2 text-sm text-slate-700 shadow-sm transition duration-300 placeholder:text-slate-400 hover:border-slate-300 focus:border-gray-100 focus:shadow focus:outline-none"
              placeholder="First Name"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">
              Last Name
            </label>
            <input
              className="ease w-full rounded-[9px] border border-gray-200 bg-transparent px-3 py-2 text-sm text-slate-700 shadow-sm transition duration-300 placeholder:text-slate-400 hover:border-slate-300 focus:border-gray-100 focus:shadow focus:outline-none"
              placeholder="Last Name"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">
              Email Address
            </label>
            <input
              className="ease w-full rounded-[9px] border border-gray-200 bg-transparent px-3 py-2 text-sm text-slate-700 shadow-sm transition duration-300 placeholder:text-slate-400 hover:border-slate-300 focus:border-gray-100 focus:shadow focus:outline-none"
              placeholder="Email Address"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">
              Phone Number
            </label>
            <input
              className="ease w-full rounded-[9px] border border-gray-200 bg-transparent px-3 py-2 text-sm text-slate-700 shadow-sm transition duration-300 placeholder:text-slate-400 hover:border-slate-300 focus:border-gray-100 focus:shadow focus:outline-none"
              placeholder="Phone Number"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Address</label>
            <input
              className="ease w-full rounded-[9px] border border-gray-200 bg-transparent px-3 py-2 text-sm text-slate-700 shadow-sm transition duration-300 placeholder:text-slate-400 hover:border-slate-300 focus:border-gray-100 focus:shadow focus:outline-none"
              placeholder="First Name"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Gender</label>
            <select
              className="ease w-full rounded-[9px] border border-gray-200 bg-transparent px-3 py-2 text-sm text-slate-700 shadow-sm transition duration-300 placeholder:text-slate-400 hover:border-slate-300 focus:border-gray-100 focus:shadow focus:outline-none"
              name=""
              id=""
            >
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
          <input
            className="ease w-full rounded-[9px] border border-gray-200 bg-transparent px-3 py-2 text-sm text-slate-700 shadow-sm transition duration-300 placeholder:text-slate-400 hover:border-slate-300 focus:border-gray-100 focus:shadow focus:outline-none"
            type="password"
            placeholder="Current Password"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-gray-600">
            New Password
          </label>
          <input
            className="ease w-full rounded-[9px] border border-gray-200 bg-transparent px-3 py-2 text-sm text-slate-700 shadow-sm transition duration-300 placeholder:text-slate-400 hover:border-slate-300 focus:border-gray-100 focus:shadow focus:outline-none"
            type="password"
            placeholder="New Password"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">

        <button className="rounded border bg-green-700 px-3 py-2 text-sm text-white hover:bg-green-600">
        Save Changes
            </button>
      </div>
    </>
  );
}
